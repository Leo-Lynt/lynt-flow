const billingService = require('../services/billingService');
const PlanSubscription = require('../models/PlanSubscription');
const BillingHistory = require('../models/BillingHistory');
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * POST /api/billing/checkout
 * Cria sessão de checkout do Stripe
 */
exports.createCheckout = async (req, res) => {
  try {
    const { planId, billingInterval } = req.body;
    const userId = req.user.userId;

    // Validações
    if (!['starter', 'pro'].includes(planId)) {
      return res.status(400).json({ error: 'Plano inválido' });
    }

    if (!['monthly', 'yearly'].includes(billingInterval)) {
      return res.status(400).json({ error: 'Intervalo de cobrança inválido' });
    }

    // URLs de sucesso e cancelamento
    const successUrl = `${process.env.FRONTEND_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${process.env.FRONTEND_URL}/billing/cancel`;

    // Criar checkout session
    const session = await billingService.createCheckoutSession(
      userId,
      planId,
      billingInterval,
      successUrl,
      cancelUrl
    );

    res.json({
      success: true,
      sessionId: session.sessionId,
      url: session.url
    });
  } catch (error) {
    console.error('[Billing] Erro ao criar checkout:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/billing/portal
 * Cria sessão do billing portal
 */
exports.createPortal = async (req, res) => {
  try {
    const userId = req.user.userId;

    const returnUrl = `${process.env.FRONTEND_URL}/profile?tab=plan`;

    const url = await billingService.createBillingPortalSession(userId, returnUrl);

    res.json({
      success: true,
      url
    });
  } catch (error) {
    console.error('[Billing] Erro ao criar portal:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/billing/webhook
 * Webhook do Stripe (público, validado por signature)
 */
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Verificar signature do Stripe
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('[Billing] Webhook signature inválida:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Processar evento
  try {
    switch (event.type) {
      case 'customer.subscription.created':
        await billingService.handleSubscriptionCreated(event.data.object);
        break;

      case 'customer.subscription.updated':
        await billingService.handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await billingService.handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.paid':
        await billingService.handleInvoicePaid(event.data.object);
        break;

      case 'invoice.payment_failed':
        await billingService.handleInvoicePaymentFailed(event.data.object);
        break;

      case 'payment_method.attached':
        await billingService.handlePaymentMethodAttached(event.data.object);
        break;

      default:
        console.log(`[Billing] Evento não tratado: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error(`[Billing] Erro ao processar webhook ${event.type}:`, error);
    res.status(500).json({ error: 'Erro ao processar webhook' });
  }
};

/**
 * GET /api/billing/subscription
 * Obtém subscription atual do usuário
 */
exports.getSubscription = async (req, res) => {
  try {
    const userId = req.user.userId;

    const subscription = await PlanSubscription.findByUserId(userId);

    if (!subscription) {
      return res.json({
        success: true,
        subscription: {
          planId: 'free',
          status: 'active',
          billingInterval: null,
          currentPeriodStart: null,
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
          isPaid: false
        }
      });
    }

    res.json({
      success: true,
      subscription: {
        planId: subscription.planId,
        status: subscription.status,
        billingInterval: subscription.billingInterval,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        lastPaymentDate: subscription.lastPaymentDate,
        nextPaymentDate: subscription.nextPaymentDate,
        trialEndsAt: subscription.trialEndsAt,
        isPaid: subscription.isPaid()
      }
    });
  } catch (error) {
    console.error('[Billing] Erro ao obter subscription:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/billing/invoices
 * Lista histórico de faturas do usuário
 */
exports.getInvoices = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = 10, skip = 0 } = req.query;

    const invoices = await BillingHistory.findByUserId(userId, {
      limit: parseInt(limit),
      skip: parseInt(skip)
    });

    const total = await BillingHistory.countDocuments({ userId });

    res.json({
      success: true,
      invoices,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: skip + limit < total
      }
    });
  } catch (error) {
    console.error('[Billing] Erro ao listar invoices:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/billing/upgrade
 * Faz upgrade de plano (efeito imediato)
 */
exports.upgradePlan = async (req, res) => {
  try {
    const { planId, billingInterval } = req.body;
    const userId = req.user.userId;

    // Validações
    if (!['starter', 'pro'].includes(planId)) {
      return res.status(400).json({ error: 'Plano inválido' });
    }

    if (!['monthly', 'yearly'].includes(billingInterval)) {
      return res.status(400).json({ error: 'Intervalo de cobrança inválido' });
    }

    const subscription = await billingService.upgradePlan(userId, planId, billingInterval);

    res.json({
      success: true,
      message: 'Upgrade realizado com sucesso',
      subscription: {
        planId: subscription.planId,
        billingInterval: subscription.billingInterval,
        status: subscription.status
      }
    });
  } catch (error) {
    console.error('[Billing] Erro ao fazer upgrade:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/billing/downgrade
 * Agenda downgrade de plano (efeito ao fim do período)
 */
exports.downgradePlan = async (req, res) => {
  try {
    const { planId, billingInterval } = req.body;
    const userId = req.user.userId;

    // Validações
    if (!['free', 'starter'].includes(planId)) {
      return res.status(400).json({ error: 'Plano inválido para downgrade' });
    }

    const subscription = await billingService.downgradePlan(userId, planId, billingInterval);

    res.json({
      success: true,
      message: 'Downgrade agendado com sucesso',
      subscription: {
        planId: subscription.planId,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        effectiveDate: subscription.currentPeriodEnd
      }
    });
  } catch (error) {
    console.error('[Billing] Erro ao fazer downgrade:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/billing/cancel
 * Cancela assinatura
 */
exports.cancelSubscription = async (req, res) => {
  try {
    const { immediate = false } = req.body;
    const userId = req.user.userId;

    const subscription = await billingService.cancelSubscription(userId, immediate);

    res.json({
      success: true,
      message: immediate
        ? 'Assinatura cancelada imediatamente'
        : 'Assinatura será cancelada ao fim do período',
      subscription: {
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        effectiveDate: immediate ? new Date() : subscription.currentPeriodEnd
      }
    });
  } catch (error) {
    console.error('[Billing] Erro ao cancelar subscription:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/billing/reactivate
 * Reativa assinatura cancelada
 */
exports.reactivateSubscription = async (req, res) => {
  try {
    const userId = req.user.userId;

    const subscription = await billingService.reactivateSubscription(userId);

    res.json({
      success: true,
      message: 'Assinatura reativada com sucesso',
      subscription: {
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd
      }
    });
  } catch (error) {
    console.error('[Billing] Erro ao reativar subscription:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = exports;
