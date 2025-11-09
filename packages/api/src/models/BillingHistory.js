const mongoose = require('mongoose');

const billingHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PlanSubscription',
    required: true
  },
  stripeInvoiceId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'BRL',
    uppercase: true
  },
  status: {
    type: String,
    enum: ['paid', 'pending', 'failed', 'refunded'],
    required: true,
    index: true
  },
  paidAt: {
    type: Date,
    default: null
  },
  invoicePdf: {
    type: String,
    default: null
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  failureReason: {
    type: String,
    default: null,
    maxlength: 500
  },
  // Additional metadata
  planId: {
    type: String,
    enum: ['free', 'starter', 'pro'],
    required: true
  },
  billingInterval: {
    type: String,
    enum: ['monthly', 'yearly']
  },
  // For proration charges
  isProration: {
    type: Boolean,
    default: false
  },
  // For refunds
  refundedAt: {
    type: Date,
    default: null
  },
  refundAmount: {
    type: Number,
    default: null
  },
  refundReason: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Compound indexes
billingHistorySchema.index({ userId: 1, paidAt: -1 });
billingHistorySchema.index({ userId: 1, createdAt: -1 });

// Methods
billingHistorySchema.methods.isPaid = function() {
  return this.status === 'paid';
};

billingHistorySchema.methods.isFailed = function() {
  return this.status === 'failed';
};

billingHistorySchema.methods.isRefunded = function() {
  return this.status === 'refunded';
};

billingHistorySchema.methods.getAmountFormatted = function() {
  const amount = this.amount / 100; // Convert from cents
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: this.currency
  }).format(amount);
};

// Statics
billingHistorySchema.statics.findByUserId = function(userId, options = {}) {
  const query = this.find({ userId });

  if (options.status) {
    query.where('status').equals(options.status);
  }

  if (options.startDate) {
    query.where('paidAt').gte(options.startDate);
  }

  if (options.endDate) {
    query.where('paidAt').lte(options.endDate);
  }

  if (options.limit) {
    query.limit(options.limit);
  }

  if (options.skip) {
    query.skip(options.skip);
  }

  return query.sort({ paidAt: -1, createdAt: -1 });
};

billingHistorySchema.statics.findByInvoiceId = function(stripeInvoiceId) {
  return this.findOne({ stripeInvoiceId });
};

billingHistorySchema.statics.getTotalRevenue = async function(options = {}) {
  const match = { status: 'paid' };

  if (options.startDate) {
    match.paidAt = { $gte: options.startDate };
  }

  if (options.endDate) {
    match.paidAt = { ...match.paidAt, $lte: options.endDate };
  }

  const result = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);

  return result.length > 0 ? result[0] : { total: 0, count: 0 };
};

billingHistorySchema.statics.getUserTotalSpent = async function(userId) {
  const result = await this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId), status: 'paid' } },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);

  return result.length > 0 ? result[0] : { total: 0, count: 0 };
};

// Don't expose Stripe IDs in JSON
billingHistorySchema.methods.toJSON = function() {
  const obj = this.toObject();
  // Keep stripeInvoiceId visible as it's needed for customer support
  return obj;
};

const BillingHistory = mongoose.model('BillingHistory', billingHistorySchema);

module.exports = BillingHistory;
