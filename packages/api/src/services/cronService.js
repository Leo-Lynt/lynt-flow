/**
 * Cron Service
 *
 * Handles scheduled tasks:
 * - Monthly usage reset (runs daily, resets when period expires)
 * - Stripe subscription sync (runs daily)
 * - Cleanup old execution data based on retention policy
 */

const cron = require('node-cron');
const UsageTracking = require('../models/UsageTracking');
const User = require('../models/User');
const PlanSubscription = require('../models/PlanSubscription');
const billingService = require('./billingService');
const logger = require('../utils/logger');

/**
 * Reset usage for expired periods
 * Runs daily at 00:05 (5 minutes past midnight)
 */
function scheduleMonthlyUsageReset() {
  // Run every day at 00:05
  cron.schedule('5 0 * * *', async () => {
    logger.info('[Cron] Starting monthly usage reset check...');

    try {
      const now = new Date();

      // Find all usage tracking documents where resetAt has passed
      const expiredUsage = await UsageTracking.find({
        resetAt: { $lte: now }
      });

      logger.info(`[Cron] Found ${expiredUsage.length} expired usage periods to reset`);

      let successCount = 0;
      let errorCount = 0;

      for (const usage of expiredUsage) {
        try {
          // Get user to check limits
          const user = await User.findById(usage.userId);
          if (!user) {
            logger.warn(`[Cron] User not found for usage tracking ${usage._id}, skipping`);
            continue;
          }

          // Calculate new period and resetAt
          const newPeriod = now.toISOString().slice(0, 7); // YYYY-MM
          const newResetAt = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);

          // Check if new period document already exists
          const existingNewPeriod = await UsageTracking.findOne({
            userId: usage.userId,
            period: newPeriod
          });

          if (existingNewPeriod) {
            // New period already exists, just delete the old one
            await UsageTracking.deleteOne({ _id: usage._id });
            logger.info(`[Cron] Deleted expired usage for user ${user.email} (${usage.period}), new period already exists`);
          } else {
            // Update to new period
            usage.period = newPeriod;
            usage.executions = 0;
            usage.dataUsed = 0;
            // activeFlows count persists (it's not usage, it's current state)
            usage.resetAt = newResetAt;
            usage.executionDetails = [];
            await usage.save();

            logger.info(`[Cron] Reset usage for user ${user.email}: ${usage.period} -> ${newPeriod}`);
          }

          successCount++;
        } catch (error) {
          logger.error(`[Cron] Error resetting usage for ${usage._id}:`, error);
          errorCount++;
        }
      }

      logger.info(`[Cron] Monthly usage reset completed: ${successCount} success, ${errorCount} errors`);
    } catch (error) {
      logger.error('[Cron] Fatal error in monthly usage reset:', error);
    }
  });

  logger.info('[Cron] ✅ Scheduled monthly usage reset (daily at 00:05)');
}

/**
 * Sync subscriptions with Stripe
 * Runs daily at 01:00
 */
function scheduleStripeSync() {
  // Run every day at 01:00
  cron.schedule('0 1 * * *', async () => {
    logger.info('[Cron] Starting Stripe subscription sync...');

    try {
      // Find all active paid subscriptions
      const subscriptions = await PlanSubscription.find({
        planId: { $in: ['starter', 'pro'] },
        status: { $in: ['active', 'past_due', 'trialing'] },
        stripeSubscriptionId: { $exists: true, $ne: null }
      });

      logger.info(`[Cron] Found ${subscriptions.length} subscriptions to sync`);

      let successCount = 0;
      let errorCount = 0;
      let changesCount = 0;

      for (const subscription of subscriptions) {
        try {
          // Fetch latest data from Stripe
          const stripeSubscription = await billingService.getStripeSubscription(
            subscription.stripeSubscriptionId
          );

          if (!stripeSubscription) {
            logger.warn(`[Cron] Stripe subscription not found: ${subscription.stripeSubscriptionId}`);
            continue;
          }

          // Check if anything changed
          let hasChanges = false;

          if (subscription.status !== stripeSubscription.status) {
            logger.info(`[Cron] Status changed for subscription ${subscription._id}: ${subscription.status} -> ${stripeSubscription.status}`);
            subscription.status = stripeSubscription.status;
            hasChanges = true;
          }

          const newPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);
          if (subscription.currentPeriodEnd?.getTime() !== newPeriodEnd.getTime()) {
            subscription.currentPeriodEnd = newPeriodEnd;
            subscription.nextPaymentDate = newPeriodEnd;
            hasChanges = true;
          }

          // If subscription is no longer active, handle it
          if (['canceled', 'unpaid', 'incomplete_expired'].includes(stripeSubscription.status)) {
            const user = await User.findById(subscription.userId);
            if (user && user.currentPlanId !== 'free') {
              await user.updatePlanLimits('free');
              logger.info(`[Cron] Downgraded user ${user.email} to FREE due to inactive subscription`);
              hasChanges = true;
            }
          }

          if (hasChanges) {
            await subscription.save();
            changesCount++;
          }

          successCount++;
        } catch (error) {
          logger.error(`[Cron] Error syncing subscription ${subscription._id}:`, error);
          errorCount++;
        }
      }

      logger.info(`[Cron] Stripe sync completed: ${successCount} success (${changesCount} changes), ${errorCount} errors`);
    } catch (error) {
      logger.error('[Cron] Fatal error in Stripe sync:', error);
    }
  });

  logger.info('[Cron] ✅ Scheduled Stripe sync (daily at 01:00)');
}

/**
 * Cleanup old execution data based on retention policy
 * Runs daily at 02:00
 */
function scheduleDataCleanup() {
  // Run every day at 02:00
  cron.schedule('0 2 * * *', async () => {
    logger.info('[Cron] Starting data cleanup...');

    try {
      const FlowExecution = require('../models/FlowExecution');

      // Get all users with their retention policies
      const users = await User.find({}, 'planLimits.dataRetentionDays');

      let totalDeleted = 0;

      for (const user of users) {
        const retentionDays = user.planLimits.dataRetentionDays || 7;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

        // Delete executions older than retention period
        const result = await FlowExecution.deleteMany({
          userId: user._id,
          createdAt: { $lt: cutoffDate }
        });

        if (result.deletedCount > 0) {
          logger.info(`[Cron] Deleted ${result.deletedCount} old executions for user ${user._id} (retention: ${retentionDays} days)`);
          totalDeleted += result.deletedCount;
        }
      }

      logger.info(`[Cron] Data cleanup completed: ${totalDeleted} executions deleted`);
    } catch (error) {
      logger.error('[Cron] Fatal error in data cleanup:', error);
    }
  });

  logger.info('[Cron] ✅ Scheduled data cleanup (daily at 02:00)');
}

/**
 * Send usage warning emails
 * Runs daily at 10:00 (morning time for better visibility)
 */
function scheduleUsageWarnings() {
  // Run every day at 10:00
  cron.schedule('0 10 * * *', async () => {
    logger.info('[Cron] Starting usage warnings check...');

    try {
      const emailService = require('./emailService');
      const usageTrackingService = require('./usageTrackingService');

      // Find all users
      const users = await User.find({});

      let warningsSent = 0;

      for (const user of users) {
        try {
          // Check usage warnings
          const { isNear, isOver, warnings } = await usageTrackingService.checkLimitWarnings(user._id);

          // Only send email if near or over limit (80%+)
          if (!isNear && !isOver) continue;

          // Get usage data
          const usage = await usageTrackingService.getCurrentUsage(user._id);

          // Send warnings for each resource type
          for (const warning of warnings) {
            if (warning.percentage >= 80) {
              const resourceType = warning.type === 'executions' ? 'Execuções'
                : warning.type === 'flows' ? 'Flows Ativos'
                : warning.type === 'data' ? 'Armazenamento'
                : warning.type;

              if (warning.percentage >= 100) {
                await emailService.sendLimitExceeded(user, resourceType);
              } else {
                await emailService.sendLimitWarning(user, resourceType, warning.percentage);
              }

              warningsSent++;
              logger.info(`[Cron] Sent ${warning.percentage >= 100 ? 'exceeded' : 'warning'} email to ${user.email} for ${resourceType}`);
            }
          }
        } catch (error) {
          logger.error(`[Cron] Error checking warnings for user ${user._id}:`, error);
        }
      }

      logger.info(`[Cron] Usage warnings completed: ${warningsSent} emails sent`);
    } catch (error) {
      logger.error('[Cron] Fatal error in usage warnings:', error);
    }
  });

  logger.info('[Cron] ✅ Scheduled usage warnings (daily at 10:00)');
}

/**
 * Initialize all cron jobs
 */
function initializeCronJobs() {
  logger.info('[Cron] 🕐 Initializing cron jobs...');

  scheduleMonthlyUsageReset();
  scheduleStripeSync();
  scheduleDataCleanup();
  scheduleUsageWarnings();

  logger.info('[Cron] ✅ All cron jobs initialized successfully');
}

module.exports = {
  initializeCronJobs,
  scheduleMonthlyUsageReset,
  scheduleStripeSync,
  scheduleDataCleanup,
  scheduleUsageWarnings
};
