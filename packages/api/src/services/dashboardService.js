const User = require('../models/User');
const Flow = require('../models/Flow');
const FlowExecution = require('../models/FlowExecution');
const FlowSchedule = require('../models/FlowSchedule');
const { formatSuccess, formatError, sanitizeUser } = require('../utils/helpers');

class DashboardService {
  async getOverview(userId) {
    const user = await User.findById(userId);
    if (!user) {
      return formatError('Usuário não encontrado', 'USER_NOT_FOUND');
    }

    const [
      totalFlows,
      sharedFlows,
      totalExecutions,
      activeSchedulesCount,
      recentExecutionsRaw,
      activeSchedulesRaw
    ] = await Promise.all([
      Flow.countDocuments({ userId: user._id }),
      Flow.countDocuments({
        userId: user._id,
        isPublic: true,
        'publicationData.status': 'approved'
      }),
      FlowExecution.countDocuments({ userId: user._id }),
      FlowSchedule.countDocuments({ userId: user._id, enabled: true }),
      FlowExecution.find({ userId: user._id })
        .sort({ startedAt: -1 })
        .limit(5)
        .select([
          'flowId',
          'flowName',
          'status',
          'startedAt',
          'completedAt',
          'executionTime',
          'triggeredBy',
          'nodesExecuted',
          'flowSnapshot.totalNodes',
          'createdAt',
          'scheduleId'
        ])
        .lean(),
      FlowSchedule.find({ userId: user._id, enabled: true })
        .sort({ nextExecutionAt: 1 })
        .limit(5)
        .populate({ path: 'flowId', select: 'name' })
        .lean()
    ]);

    const recentExecutions = recentExecutionsRaw.map((execution) => ({
      id: execution._id,
      _id: execution._id,
      flowId: execution.flowId,
      flowName: execution.flowName,
      status: execution.status,
      startedAt: execution.startedAt,
      completedAt: execution.completedAt,
      executionTime: execution.executionTime,
      triggeredBy: execution.triggeredBy,
      nodesExecuted: execution.nodesExecuted,
      totalNodes: execution.flowSnapshot?.totalNodes ?? null,
      scheduleId: execution.scheduleId,
      createdAt: execution.createdAt
    }));

    const activeSchedules = activeSchedulesRaw.map((schedule) => ({
      id: schedule._id,
      _id: schedule._id,
      flowId: schedule.flowId?._id || schedule.flowId,
      flowName: schedule.flowId?.name || schedule.flowName || 'Unknown Flow',
      scheduleType: schedule.scheduleType,
      nextExecutionAt: schedule.nextExecutionAt,
      lastExecutionStatus: schedule.lastExecutionStatus,
      executionCount: schedule.executionCount,
      consecutiveFailures: schedule.consecutiveFailures,
      enabled: schedule.enabled,
      createdAt: schedule.createdAt
    }));

    const profile = sanitizeUser(user);

    const overview = {
      profile: {
        id: profile._id,
        name: profile.name,
        email: profile.email,
        picture: profile.picture,
        role: profile.role,
        isVerified: profile.isVerified,
        twoFactorEnabled: profile.twoFactorEnabled,
        lastLoginAt: profile.lastLoginAt,
        accountCreated: profile.createdAt,
        plan: 'Free',
        teamMembers: 1
      },
      stats: {
        totalFlows,
        sharedFlows,
        activeSchedules: activeSchedulesCount,
        totalExecutions
      },
      storage: {
        used: profile.executionStorageUsed,
        quota: profile.executionStorageQuota,
        usedPercentage: profile.executionStorageQuota
          ? (profile.executionStorageUsed / profile.executionStorageQuota) * 100
          : null
      },
      recentExecutions,
      activeSchedules
    };

    return formatSuccess(overview, 'Visão geral do dashboard obtida com sucesso');
  }

  async getFlowOptions(userId) {
    const flows = await Flow.find({ userId })
      .sort({ updatedAt: -1 })
      .select([
        'name',
        'description',
        'category',
        'publicMetadata.tags',
        'isPublic',
        'updatedAt',
        'createdAt'
      ])
      .lean();

    const options = flows.map((flow) => ({
      id: flow._id,
      _id: flow._id,
      name: flow.name,
      description: flow.description,
      category: flow.category,
      tags: flow.publicMetadata?.tags || [],
      isPublic: flow.isPublic,
      updatedAt: flow.updatedAt,
      createdAt: flow.createdAt
    }));

    return formatSuccess({ flows: options }, 'Opções de fluxo obtidas com sucesso');
  }
}

module.exports = new DashboardService();
