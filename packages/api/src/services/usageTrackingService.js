const UsageTracking = require('../models/UsageTracking');
const User = require('../models/User');
const Flow = require('../models/Flow');

/**
 * Obtém o uso atual do usuário para o período corrente
 * @param {String} userId - ID do usuário
 * @returns {Object} - Objeto de UsageTracking
 */
exports.getCurrentUsage = async (userId) => {
  try {
    const usage = await UsageTracking.findOrCreateCurrent(userId);
    return usage;
  } catch (error) {
    throw new Error(`Erro ao obter uso atual: ${error.message}`);
  }
};

/**
 * Incrementa contador de execuções
 * @param {String} userId - ID do usuário
 * @param {String} flowId - ID do flow executado
 * @param {String} executionId - ID da execução
 * @returns {Object} - UsageTracking atualizado
 */
exports.incrementExecutions = async (userId, flowId, executionId) => {
  try {
    const usage = await UsageTracking.findOrCreateCurrent(userId);
    await usage.incrementExecutions(flowId, executionId);

    return usage;
  } catch (error) {
    throw new Error(`Erro ao incrementar execuções: ${error.message}`);
  }
};

/**
 * Atualiza contador de flows ativos
 * @param {String} userId - ID do usuário
 * @returns {Object} - UsageTracking atualizado
 */
exports.updateActiveFlows = async (userId) => {
  try {
    const usage = await UsageTracking.findOrCreateCurrent(userId);

    // Conta flows ativos do usuário
    const activeFlowCount = await Flow.countDocuments({
      userId,
      deletedAt: null
    });

    await usage.updateActiveFlows(activeFlowCount);

    return usage;
  } catch (error) {
    throw new Error(`Erro ao atualizar flows ativos: ${error.message}`);
  }
};

/**
 * Adiciona uso de dados (storage)
 * @param {String} userId - ID do usuário
 * @param {Number} bytes - Bytes adicionados
 * @returns {Object} - UsageTracking atualizado
 */
exports.addDataUsage = async (userId, bytes) => {
  try {
    const usage = await UsageTracking.findOrCreateCurrent(userId);
    await usage.addDataUsage(bytes);

    // Atualizar também o campo no User
    await User.findByIdAndUpdate(userId, {
      $inc: { executionStorageUsed: bytes }
    });

    return usage;
  } catch (error) {
    throw new Error(`Erro ao adicionar uso de dados: ${error.message}`);
  }
};

/**
 * Reseta uso mensal de um usuário (cria novo período)
 * @param {String} userId - ID do usuário
 * @returns {Object} - Novo UsageTracking criado
 */
exports.resetMonthlyUsage = async (userId) => {
  try {
    // Obter uso atual para saber quanto de data está sendo usado
    const currentUsage = await UsageTracking.findOrCreateCurrent(userId);

    // Criar novo período
    const newPeriod = UsageTracking.getCurrentPeriod();
    const resetAt = UsageTracking.getNextResetDate();

    // Conta flows ativos
    const activeFlowCount = await Flow.countDocuments({
      userId,
      deletedAt: null
    });

    // Criar novo registro para o próximo período
    const newUsage = await UsageTracking.create({
      userId,
      period: newPeriod,
      executions: 0, // Resetar execuções
      activeFlows: activeFlowCount,
      dataUsed: currentUsage.dataUsed, // Manter acumulado de dados
      resetAt
    });

    return newUsage;
  } catch (error) {
    throw new Error(`Erro ao resetar uso mensal: ${error.message}`);
  }
};

/**
 * Verifica e reseta todos os usuários que precisam de reset
 * (Para ser executado por cron job)
 * @returns {Number} - Quantidade de usuários resetados
 */
exports.checkAndResetIfNeeded = async () => {
  try {
    const usersNeedingReset = await UsageTracking.findUsersNeedingReset();

    let resetCount = 0;

    for (const usage of usersNeedingReset) {
      await exports.resetMonthlyUsage(usage.userId);
      resetCount++;
    }

    console.log(`[UsageTracking] ${resetCount} usuários resetados`);

    return resetCount;
  } catch (error) {
    console.error(`[UsageTracking] Erro ao verificar resets: ${error.message}`);
    throw error;
  }
};

/**
 * Obtém histórico de uso de um usuário
 * @param {String} userId - ID do usuário
 * @param {Number} months - Número de meses de histórico (default: 12)
 * @returns {Array} - Array de UsageTracking
 */
exports.getUserHistory = async (userId, months = 12) => {
  try {
    const history = await UsageTracking.getUserHistory(userId, months);
    return history;
  } catch (error) {
    throw new Error(`Erro ao obter histórico: ${error.message}`);
  }
};

/**
 * Verifica se usuário está próximo dos limites (>= 80%)
 * @param {String} userId - ID do usuário
 * @returns {Object} - { isNear: boolean, percentages: {}, warnings: [] }
 */
exports.checkLimitWarnings = async (userId) => {
  try {
    const user = await User.findById(userId);
    const usage = await UsageTracking.findOrCreateCurrent(userId);

    const percentages = usage.getUsagePercentage(user.planLimits);
    const isNear = usage.isNearLimit(user.planLimits, 80);
    const isOver = usage.isOverLimit(user.planLimits);

    const warnings = [];

    if (percentages.executions >= 80) {
      warnings.push({
        resource: 'executions',
        percentage: percentages.executions,
        current: usage.executions,
        limit: user.planLimits.executions,
        isOver: percentages.executions >= 100
      });
    }

    if (percentages.flows >= 80) {
      warnings.push({
        resource: 'flows',
        percentage: percentages.flows,
        current: usage.activeFlows,
        limit: user.planLimits.flows,
        isOver: percentages.flows >= 100
      });
    }

    if (percentages.data >= 80) {
      warnings.push({
        resource: 'data',
        percentage: percentages.data,
        current: usage.dataUsed,
        limit: user.planLimits.dataPerMonth,
        isOver: percentages.data >= 100
      });
    }

    return {
      isNear,
      isOver,
      percentages,
      warnings
    };
  } catch (error) {
    throw new Error(`Erro ao verificar avisos de limite: ${error.message}`);
  }
};

/**
 * Obtém estatísticas de uso completas para o dashboard
 * @param {String} userId - ID do usuário
 * @returns {Object} - Estatísticas completas
 */
exports.getUsageStats = async (userId) => {
  try {
    const user = await User.findById(userId);
    const usage = await UsageTracking.findOrCreateCurrent(userId);

    const percentages = usage.getUsagePercentage(user.planLimits);
    const { isNear, isOver, warnings } = await exports.checkLimitWarnings(userId);

    return {
      period: usage.period,
      usage: {
        executions: usage.executions,
        activeFlows: usage.activeFlows,
        dataUsed: usage.dataUsed
      },
      limits: user.planLimits,
      percentages,
      isNearLimit: isNear,
      isOverLimit: isOver,
      warnings,
      resetAt: usage.resetAt
    };
  } catch (error) {
    throw new Error(`Erro ao obter estatísticas de uso: ${error.message}`);
  }
};

module.exports = exports;
