const User = require('../models/User');
const Flow = require('../models/Flow');
const FlowSchedule = require('../models/FlowSchedule');
const usageTrackingService = require('../services/usageTrackingService');

/**
 * Middleware para verificar limite de execuções
 */
exports.checkExecutionLimit = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Obter usuário e uso atual
    const user = await User.findById(userId);
    const usage = await usageTrackingService.getCurrentUsage(userId);

    // Verificar limite
    if (!user.canExecuteFlow(usage)) {
      return res.status(403).json({
        error: 'Limite de execuções atingido',
        message: `Você atingiu o limite de ${user.planLimits.executions} execuções/mês do plano ${user.currentPlanId.toUpperCase()}. Faça upgrade do plano ou aguarde o próximo mês.`,
        currentUsage: usage.executions,
        limit: user.planLimits.executions,
        resetAt: usage.resetAt,
        upgradeUrl: '/billing/checkout'
      });
    }

    // Armazenar no req para uso posterior
    req.userPlanInfo = {
      user,
      usage,
      limits: user.planLimits
    };

    next();
  } catch (error) {
    console.error('[CheckLimits] Erro ao verificar limite de execuções:', error);
    res.status(500).json({ error: 'Erro ao verificar limite de execuções' });
  }
};

/**
 * Middleware para verificar limite de flows
 */
exports.checkFlowLimit = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Obter usuário
    const user = await User.findById(userId);

    // Contar flows ativos
    const flowCount = await Flow.countDocuments({
      userId,
      deletedAt: null
    });

    // Verificar limite
    if (!user.canCreateFlow(flowCount)) {
      return res.status(403).json({
        error: 'Limite de flows atingido',
        message: `Você atingiu o limite de ${user.planLimits.flows} flows ativos do plano ${user.currentPlanId.toUpperCase()}. Delete alguns flows ou faça upgrade do plano.`,
        currentUsage: flowCount,
        limit: user.planLimits.flows,
        upgradeUrl: '/billing/checkout'
      });
    }

    // Armazenar no req para uso posterior
    req.userPlanInfo = {
      user,
      flowCount,
      limits: user.planLimits
    };

    next();
  } catch (error) {
    console.error('[CheckLimits] Erro ao verificar limite de flows:', error);
    res.status(500).json({ error: 'Erro ao verificar limite de flows' });
  }
};

/**
 * Middleware factory para verificar limite de armazenamento
 * @param {Function} getSizeInBytes - Função que recebe req e retorna o tamanho em bytes
 */
exports.checkStorageLimit = (getSizeInBytes) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.userId;

      // Obter usuário
      const user = await User.findById(userId);

      // Calcular tamanho necessário
      const bytes = typeof getSizeInBytes === 'function'
        ? await getSizeInBytes(req)
        : getSizeInBytes;

      // Verificar limite
      if (!user.hasStorageAvailable(bytes)) {
        const usedMB = (user.executionStorageUsed / (1024 * 1024)).toFixed(2);
        const limitMB = (user.planLimits.dataPerMonth / (1024 * 1024)).toFixed(2);
        const neededMB = (bytes / (1024 * 1024)).toFixed(2);

        return res.status(403).json({
          error: 'Limite de armazenamento atingido',
          message: `Você atingiu o limite de armazenamento do plano ${user.currentPlanId.toUpperCase()}. Uso: ${usedMB}MB de ${limitMB}MB. Necessário: ${neededMB}MB. Faça upgrade do plano.`,
          currentUsage: user.executionStorageUsed,
          limit: user.planLimits.dataPerMonth,
          needed: bytes,
          upgradeUrl: '/billing/checkout'
        });
      }

      // Armazenar no req para uso posterior
      req.userPlanInfo = {
        user,
        executionSize: bytes,
        limits: user.planLimits
      };

      next();
    } catch (error) {
      console.error('[CheckLimits] Erro ao verificar limite de armazenamento:', error);
      res.status(500).json({ error: 'Erro ao verificar limite de armazenamento' });
    }
  };
};

/**
 * Middleware para verificar limite de schedules
 */
exports.checkScheduleLimit = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Obter usuário
    const user = await User.findById(userId);

    // Definir limites de schedules por plano
    const SCHEDULE_LIMITS = {
      free: 0,      // FREE não pode criar schedules
      starter: 5,   // STARTER pode ter até 5 schedules
      pro: 20       // PRO pode ter até 20 schedules
    };

    const limit = SCHEDULE_LIMITS[user.currentPlanId];

    // Plano FREE não pode criar schedules
    if (limit === 0) {
      return res.status(403).json({
        error: 'Schedules não disponíveis no plano FREE',
        message: 'Agende execuções automáticas fazendo upgrade para o plano STARTER ou PRO.',
        currentPlan: user.currentPlanId,
        upgradeUrl: '/billing/checkout'
      });
    }

    // Contar schedules ativos
    const scheduleCount = await FlowSchedule.countDocuments({
      userId,
      enabled: true
    });

    // Verificar limite
    if (scheduleCount >= limit) {
      return res.status(403).json({
        error: 'Limite de schedules atingido',
        message: `Você atingiu o limite de ${limit} schedules ativos do plano ${user.currentPlanId.toUpperCase()}. Desative alguns schedules ou faça upgrade do plano.`,
        currentUsage: scheduleCount,
        limit,
        upgradeUrl: '/billing/checkout'
      });
    }

    // Armazenar no req para uso posterior
    req.userPlanInfo = {
      user,
      scheduleCount,
      scheduleLimit: limit,
      limits: user.planLimits
    };

    next();
  } catch (error) {
    console.error('[CheckLimits] Erro ao verificar limite de schedules:', error);
    res.status(500).json({ error: 'Erro ao verificar limite de schedules' });
  }
};

/**
 * Middleware para verificar se plano está ativo
 */
exports.checkPlanActive = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const PlanSubscription = require('../models/PlanSubscription');

    const subscription = await PlanSubscription.findByUserId(userId);

    // Se não tem subscription ou é FREE, está OK
    if (!subscription || subscription.planId === 'free') {
      return next();
    }

    // Verificar se plano está ativo
    if (!subscription.isActive()) {
      return res.status(403).json({
        error: 'Assinatura inativa',
        message: 'Sua assinatura está inativa. Atualize o método de pagamento ou reative sua assinatura.',
        status: subscription.status,
        billingPortalUrl: '/billing/portal'
      });
    }

    next();
  } catch (error) {
    console.error('[CheckLimits] Erro ao verificar plano ativo:', error);
    res.status(500).json({ error: 'Erro ao verificar status da assinatura' });
  }
};

/**
 * Helper para avisar quando usuário está próximo do limite
 * Não bloqueia a requisição, apenas adiciona warning
 */
exports.warnNearLimit = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const warnings = await usageTrackingService.checkLimitWarnings(userId);

    if (warnings.isNear || warnings.isOver) {
      // Adicionar headers com avisos
      res.setHeader('X-Usage-Warning', 'true');
      res.setHeader('X-Usage-Near-Limit', warnings.isNear.toString());
      res.setHeader('X-Usage-Over-Limit', warnings.isOver.toString());

      // Adicionar ao req para incluir na resposta
      req.usageWarnings = warnings;
    }

    next();
  } catch (error) {
    console.error('[CheckLimits] Erro ao verificar avisos:', error);
    // Não bloquear requisição em caso de erro
    next();
  }
};

module.exports = exports;
