/**
 * Migration Script: Add Plan System to Existing Users
 *
 * This script migrates all existing users to the new plan system:
 * - Sets currentPlanId to 'free' if not already set
 * - Updates planLimits to FREE plan defaults
 * - Creates UsageTracking document for current month
 * - Logs results
 *
 * Usage: node scripts/migratePlans.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const UsageTracking = require('../src/models/UsageTracking');

// Connect to database
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('[Migration] ✅ Connected to MongoDB');
  } catch (error) {
    console.error('[Migration] ❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Disconnect from database
async function disconnectDB() {
  await mongoose.disconnect();
  console.log('[Migration] 📤 Disconnected from MongoDB');
}

// Main migration function
async function migratePlans() {
  console.log('\n========================================');
  console.log('📋 Plan Migration Script');
  console.log('========================================\n');

  try {
    // Find all users
    const users = await User.find({});
    console.log(`[Migration] Found ${users.length} users to migrate\n`);

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        let needsUpdate = false;
        const updates = [];

        // Check if user needs migration
        if (!user.currentPlanId || user.currentPlanId === '') {
          user.currentPlanId = 'free';
          needsUpdate = true;
          updates.push('Set currentPlanId to FREE');
        }

        // Update planLimits to FREE plan defaults
        const freeLimits = {
          executions: 200,
          flows: 5,
          dataPerMonth: 50 * 1024 * 1024, // 50MB
          dataRetentionDays: 7
        };

        const limitsChanged =
          user.planLimits.executions !== freeLimits.executions ||
          user.planLimits.flows !== freeLimits.flows ||
          user.planLimits.dataPerMonth !== freeLimits.dataPerMonth ||
          user.planLimits.dataRetentionDays !== freeLimits.dataRetentionDays;

        if (limitsChanged) {
          user.planLimits = freeLimits;
          needsUpdate = true;
          updates.push('Updated planLimits to FREE defaults');
        }

        // Save user if needed
        if (needsUpdate) {
          await user.save();
          console.log(`[Migration] ✅ User ${user.email}:`);
          updates.forEach(update => console.log(`           - ${update}`));
          migratedCount++;
        } else {
          console.log(`[Migration] ⏭️  User ${user.email} - Already migrated`);
          skippedCount++;
        }

        // Create or verify UsageTracking for current period
        const currentPeriod = new Date().toISOString().slice(0, 7); // YYYY-MM
        let usage = await UsageTracking.findOne({ userId: user._id, period: currentPeriod });

        if (!usage) {
          // Calculate resetAt (first day of next month)
          const now = new Date();
          const resetAt = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);

          usage = await UsageTracking.create({
            userId: user._id,
            period: currentPeriod,
            executions: 0,
            activeFlows: 0,
            dataUsed: 0,
            resetAt,
            executionDetails: []
          });

          console.log(`           - Created UsageTracking for period ${currentPeriod}`);
        }

      } catch (error) {
        console.error(`[Migration] ❌ Error migrating user ${user.email}:`, error.message);
        errorCount++;
      }
    }

    // Print summary
    console.log('\n========================================');
    console.log('📊 Migration Summary');
    console.log('========================================');
    console.log(`Total users:          ${users.length}`);
    console.log(`✅ Migrated:          ${migratedCount}`);
    console.log(`⏭️  Skipped (already): ${skippedCount}`);
    console.log(`❌ Errors:            ${errorCount}`);
    console.log('========================================\n');

    if (errorCount > 0) {
      console.log('⚠️  Some users failed to migrate. Check logs above for details.');
      return false;
    }

    console.log('✅ Migration completed successfully!\n');
    return true;

  } catch (error) {
    console.error('[Migration] ❌ Fatal error:', error);
    return false;
  }
}

// Run migration
(async () => {
  await connectDB();
  const success = await migratePlans();
  await disconnectDB();
  process.exit(success ? 0 : 1);
})();
