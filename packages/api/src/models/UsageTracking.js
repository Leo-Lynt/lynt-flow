const mongoose = require('mongoose');

const usageTrackingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  period: {
    type: String,
    required: true,
    match: /^\d{4}-\d{2}$/, // Format: YYYY-MM
    index: true
  },
  executions: {
    type: Number,
    default: 0,
    min: 0
  },
  activeFlows: {
    type: Number,
    default: 0,
    min: 0
  },
  dataUsed: {
    type: Number,
    default: 0,
    min: 0
  },
  resetAt: {
    type: Date,
    required: true,
    index: true
  },
  executionDetails: [{
    date: {
      type: Date,
      required: true
    },
    flowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Flow'
    },
    executionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FlowExecution'
    }
  }]
}, {
  timestamps: true
});

// Compound unique index - one record per user per period
usageTrackingSchema.index({ userId: 1, period: 1 }, { unique: true });

// Index for cron job that resets usage
usageTrackingSchema.index({ userId: 1, resetAt: 1 });

// Methods
usageTrackingSchema.methods.incrementExecutions = function(flowId, executionId) {
  this.executions += 1;
  this.executionDetails.push({
    date: new Date(),
    flowId,
    executionId
  });
  return this.save();
};

usageTrackingSchema.methods.addDataUsage = function(bytes) {
  this.dataUsed += bytes;
  return this.save();
};

usageTrackingSchema.methods.updateActiveFlows = function(count) {
  this.activeFlows = count;
  return this.save();
};

usageTrackingSchema.methods.shouldReset = function() {
  return this.resetAt <= new Date();
};

usageTrackingSchema.methods.getUsagePercentage = function(limits) {
  return {
    executions: limits.executions > 0 ? Math.round((this.executions / limits.executions) * 100) : 0,
    flows: limits.flows > 0 ? Math.round((this.activeFlows / limits.flows) * 100) : 0,
    data: limits.dataPerMonth > 0 ? Math.round((this.dataUsed / limits.dataPerMonth) * 100) : 0
  };
};

usageTrackingSchema.methods.isNearLimit = function(limits, threshold = 80) {
  const percentages = this.getUsagePercentage(limits);
  return percentages.executions >= threshold ||
         percentages.flows >= threshold ||
         percentages.data >= threshold;
};

usageTrackingSchema.methods.isOverLimit = function(limits) {
  return this.executions >= limits.executions ||
         this.activeFlows >= limits.flows ||
         this.dataUsed >= limits.dataPerMonth;
};

// Statics
usageTrackingSchema.statics.getCurrentPeriod = function() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

usageTrackingSchema.statics.getNextResetDate = function() {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth;
};

usageTrackingSchema.statics.findOrCreateCurrent = async function(userId) {
  const period = this.getCurrentPeriod();

  let usage = await this.findOne({ userId, period });

  if (!usage) {
    // Count active flows
    const Flow = mongoose.model('Flow');
    const activeFlows = await Flow.countDocuments({
      userId,
      deletedAt: null
    });

    usage = await this.create({
      userId,
      period,
      executions: 0,
      activeFlows,
      dataUsed: 0,
      resetAt: this.getNextResetDate()
    });
  }

  return usage;
};

usageTrackingSchema.statics.findUsersNeedingReset = function() {
  return this.find({
    resetAt: { $lte: new Date() }
  });
};

usageTrackingSchema.statics.getUserHistory = function(userId, months = 12) {
  return this.find({ userId })
    .sort({ period: -1 })
    .limit(months);
};

const UsageTracking = mongoose.model('UsageTracking', usageTrackingSchema);

module.exports = UsageTracking;
