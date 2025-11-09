const mongoose = require('mongoose');

const planSubscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  planId: {
    type: String,
    enum: ['free', 'starter', 'pro'],
    required: true,
    default: 'free'
  },
  status: {
    type: String,
    enum: ['active', 'canceled', 'expired', 'past_due', 'trialing'],
    required: true,
    default: 'active',
    index: true
  },
  billingInterval: {
    type: String,
    enum: ['monthly', 'yearly'],
    default: null
  },
  currentPeriodStart: {
    type: Date,
    default: null
  },
  currentPeriodEnd: {
    type: Date,
    default: null,
    index: true
  },
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  },
  // Stripe integration
  stripeCustomerId: {
    type: String,
    default: null,
    index: true
  },
  stripeSubscriptionId: {
    type: String,
    default: null,
    index: true
  },
  stripePaymentMethodId: {
    type: String,
    default: null
  },
  // Payment tracking
  lastPaymentDate: {
    type: Date,
    default: null
  },
  nextPaymentDate: {
    type: Date,
    default: null
  },
  paymentFailureCount: {
    type: Number,
    default: 0
  },
  // Trial period
  trialEndsAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Compound indexes
planSubscriptionSchema.index({ status: 1, currentPeriodEnd: 1 });

// Methods
planSubscriptionSchema.methods.isActive = function() {
  return this.status === 'active' || this.status === 'trialing';
};

planSubscriptionSchema.methods.isPastDue = function() {
  return this.status === 'past_due';
};

planSubscriptionSchema.methods.isCanceled = function() {
  return this.status === 'canceled' || this.status === 'expired';
};

planSubscriptionSchema.methods.isInTrial = function() {
  return this.status === 'trialing' && this.trialEndsAt && this.trialEndsAt > new Date();
};

planSubscriptionSchema.methods.isPaid = function() {
  return this.planId !== 'free';
};

// Statics
planSubscriptionSchema.statics.findByUserId = function(userId) {
  return this.findOne({ userId });
};

planSubscriptionSchema.statics.findActiveSubscriptions = function() {
  return this.find({
    status: { $in: ['active', 'trialing'] }
  });
};

planSubscriptionSchema.statics.findExpiringSubscriptions = function(withinDays = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + withinDays);

  return this.find({
    status: { $in: ['active', 'trialing'] },
    currentPeriodEnd: { $lte: futureDate, $gte: new Date() }
  });
};

// Sanitize output - never return Stripe IDs to frontend
planSubscriptionSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.stripeCustomerId;
  delete obj.stripeSubscriptionId;
  delete obj.stripePaymentMethodId;
  return obj;
};

const PlanSubscription = mongoose.model('PlanSubscription', planSubscriptionSchema);

module.exports = PlanSubscription;
