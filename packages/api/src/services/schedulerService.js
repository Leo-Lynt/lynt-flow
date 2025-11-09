const cron = require('node-cron');
const FlowSchedule = require('../models/FlowSchedule');
const logger = require('../utils/logger');
const Flow = require('../models/Flow');
const flowExecutor = require('./flowExecutor');
const { calculateNextExecution } = require('./scheduleCalculator');
const { resolveDynamicInputs } = require('../utils/dynamicInputResolver');

class SchedulerService {
  constructor() {
    this.jobs = new Map(); // Map<scheduleId, cronTask>
    this.initialized = false;
  }

  /**
   * Inicializar scheduler: carregar todos schedules ativos
   */
  async initialize() {
    if (this.initialized) {
      logger.info('⚠️  Scheduler already initialized');
      return;
    }

    try {
      logger.info('🔍 Searching for active schedules in database...');
      const schedules = await FlowSchedule.find({
        enabled: true,
        $or: [
          { expiresAt: { $gt: new Date() } },
          { expiresAt: null }
        ]
      }).populate('flowId');

      logger.info(`📊 Found ${schedules.length} enabled schedules`);

      for (const schedule of schedules) {
        logger.info(`🔄 Processing schedule ${schedule._id}`, {
          hasFlow: !!schedule.flowId,
          scheduleType: schedule.scheduleType
        });
        if (schedule.flowId) {
          await this.registerSchedule(schedule);
        } else {
          logger.warn(`⚠️  Schedule ${schedule._id} has no flow, skipping`);
        }
      }

      this.initialized = true;
      logger.info(`✅ Scheduler initialized with ${schedules.length} active schedules`);
    } catch (error) {
      logger.error('❌ Failed to initialize scheduler:', {
        error: error.message,
        stack: error.stack,
        name: error.name
      });
      throw error;
    }
  }

  /**
   * Registrar schedule no node-cron
   */
  async registerSchedule(schedule) {
    const scheduleId = schedule._id.toString();

    // Se já existe, remover
    if (this.jobs.has(scheduleId)) {
      this.unregisterSchedule(scheduleId);
    }

    try {
      // Converter para cron expression
      const cronExpression = this.toCronExpression(schedule);

      // Calcular próxima execução se não existir
      if (!schedule.nextExecutionAt) {
        schedule.nextExecutionAt = calculateNextExecution(schedule);
        await schedule.save();
      }

      // Criar job
      const task = cron.schedule(cronExpression, async () => {
        try {
          logger.info(`🔄 Cron triggered for schedule ${scheduleId}`);
          await this.executeScheduledFlow(scheduleId);
          logger.info(`✅ Cron completed for schedule ${scheduleId}`);
        } catch (error) {
          logger.error(`❌ Cron callback error for schedule ${scheduleId}:`, {
            error: error.message,
            stack: error.stack,
            name: error.name
          });
          // Re-throw para manter comportamento original
          throw error;
        }
      }, {
        timezone: schedule.timezone || 'UTC',
        scheduled: true
      });

      this.jobs.set(scheduleId, task);
      logger.info(`📅 Registered schedule ${scheduleId} with cron: ${cronExpression}`);
    } catch (error) {
      logger.error(`❌ Failed to register schedule ${scheduleId}:`, error);
      throw error;
    }
  }

  /**
   * Desregistrar schedule
   */
  unregisterSchedule(scheduleId) {
    const task = this.jobs.get(scheduleId.toString());
    if (task) {
      task.stop();
      this.jobs.delete(scheduleId.toString());
      logger.info(`🗑️  Unregistered schedule ${scheduleId}`);
    }
  }

  /**
   * Executar flow agendado
   */
  async executeScheduledFlow(scheduleId) {
    let schedule;

    try {
      logger.info(`📋 Starting executeScheduledFlow for ${scheduleId}`);
      schedule = await FlowSchedule.findById(scheduleId).populate({
        path: 'flowId',
        populate: {
          path: 'flowDataId'
        }
      });
      logger.info(`📋 Schedule loaded for ${scheduleId}:`, {
        enabled: schedule?.enabled,
        hasFlow: !!schedule?.flowId
      });

      if (!schedule || !schedule.enabled) {
        logger.info(`⚠️  Schedule ${scheduleId} not found or disabled`);
        return;
      }

      // Prevenção de concorrência
      if (schedule.isCurrentlyRunning) {
        logger.info(`⏭️  Skipping schedule ${scheduleId} - already running`);
        return;
      }

      // Marcar como rodando
      schedule.isCurrentlyRunning = true;
      await schedule.save();

      const flow = schedule.flowId;
      if (!flow) {
        throw new Error('Flow not found');
      }

      // Mapear flowDataId para flowData para compatibilidade
      if (!flow.flowData && flow.flowDataId) {
        flow.flowData = flow.flowDataId.data || flow.flowDataId;
      }

      logger.info(`🚀 Executing scheduled flow: ${flow.name} (${scheduleId})`);

      // Resolver inputs dinâmicos ({{today}}, {{today - 10 days}}, etc.)
      const resolvedInputData = resolveDynamicInputs(
        schedule.inputData || {},
        flow,
        {
          lastExecution: schedule.lastExecutedAt,
          timezone: schedule.timezone || 'UTC'
        }
      );

      logger.info(`📝 Original inputs:`, schedule.inputData);
      logger.info(`✨ Resolved inputs:`, resolvedInputData);

      // Executar flow com triggeredBy='schedule'
      const result = await flowExecutor.executeFlow(
        flow,
        resolvedInputData,
        schedule.userId,
        'schedule',
        scheduleId
      );

      // Atualizar sucesso
      schedule.lastExecutedAt = new Date();
      schedule.executionCount++;
      schedule.lastExecutionStatus = 'success';
      schedule.consecutiveFailures = 0;
      schedule.nextExecutionAt = calculateNextExecution(schedule);
      schedule.isCurrentlyRunning = false;
      schedule.currentExecutionId = null;

      // Verificar limite de execuções
      if (schedule.maxExecutions && schedule.executionCount >= schedule.maxExecutions) {
        schedule.enabled = false;
        schedule.pausedReason = 'Max executions reached';
        this.unregisterSchedule(scheduleId);
        logger.info(`⏸️  Schedule ${scheduleId} paused - max executions reached`);
      }

      await schedule.save();
      logger.info(`✅ Schedule ${scheduleId} executed successfully`);

    } catch (error) {
      logger.error(`❌ Schedule ${scheduleId} failed:`, {
        error: error.message,
        stack: error.stack,
        name: error.name,
        scheduleId: scheduleId
      });
      console.error('🔴 SCHEDULE EXECUTION ERROR DETAILS:');
      console.error('Error:', error);
      console.error('Schedule ID:', scheduleId);

      if (schedule) {
        // Atualizar falha
        schedule.lastExecutedAt = new Date();
        schedule.lastExecutionStatus = 'failed';
        schedule.consecutiveFailures = (schedule.consecutiveFailures || 0) + 1;
        schedule.isCurrentlyRunning = false;
        schedule.currentExecutionId = null;

        // Pausar se muitas falhas consecutivas
        if (schedule.consecutiveFailures >= 3) {
          schedule.enabled = false;
          schedule.pausedReason = `Paused after ${schedule.consecutiveFailures} consecutive failures: ${error.message}`;
          this.unregisterSchedule(scheduleId);
          logger.info(`⏸️  Schedule ${scheduleId} paused - too many failures`);
        } else {
          // Calcular próxima execução mesmo após falha
          schedule.nextExecutionAt = calculateNextExecution(schedule);
        }

        await schedule.save();
      }
    }
  }

  /**
   * Converter schedule para cron expression
   */
  toCronExpression(schedule) {
    const { scheduleType } = schedule;

    if (scheduleType === 'cron') {
      return schedule.cronExpression;
    }

    if (scheduleType === 'interval') {
      const { intervalValue, intervalUnit } = schedule;

      if (intervalUnit === 'minutes') {
        return `*/${intervalValue} * * * *`;
      }
      if (intervalUnit === 'hours') {
        return `0 */${intervalValue} * * *`;
      }
      if (intervalUnit === 'days') {
        return `0 0 */${intervalValue} * *`;
      }

      throw new Error(`Unknown interval unit: ${intervalUnit}`);
    }

    if (scheduleType === 'daily') {
      const [hour, minute] = schedule.time.split(':');
      return `${minute} ${hour} * * *`;
    }

    if (scheduleType === 'weekly') {
      const [hour, minute] = schedule.time.split(':');
      const days = schedule.daysOfWeek.join(',');
      return `${minute} ${hour} * * ${days}`;
    }

    if (scheduleType === 'monthly') {
      const [hour, minute] = schedule.time.split(':');
      return `${minute} ${hour} ${schedule.dayOfMonth} * *`;
    }

    throw new Error(`Unknown schedule type: ${scheduleType}`);
  }

  /**
   * Recarregar schedule específico
   */
  async reloadSchedule(scheduleId) {
    const schedule = await FlowSchedule.findById(scheduleId).populate('flowId');

    if (!schedule) {
      throw new Error('Schedule not found');
    }

    if (schedule.enabled) {
      await this.registerSchedule(schedule);
    } else {
      this.unregisterSchedule(scheduleId);
    }
  }

  /**
   * Obter estatísticas do scheduler
   */
  getStats() {
    return {
      totalSchedules: this.jobs.size,
      activeSchedules: Array.from(this.jobs.keys())
    };
  }
}

// Singleton
const schedulerService = new SchedulerService();

module.exports = schedulerService;
