const Stripe = require('stripe');
const PlanSubscription = require('../models/PlanSubscription');
const BillingHistory = require('../models/BillingHistory');
const User = require('../models/User');
const emailService = require('./emailService');

// Inicializar Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Mapeamento de planos para Stripe Price IDs
const STRIPE_PRICE_IDS = {
  starter: {
    monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY,
    yearly: process.env.STRIPE_PRICE_STARTER_YEARLY
  },
  pro: {
    monthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
    yearly: process.env.STRIPE_PRICE_PRO_YEARLY
  }
};

/**
 * Cria ou obtém customer no Stripe
 * @param {String} userId - ID do usuário
 * @param {String} email - Email do usuário
 * @param {String} name - Nome do usuário
 * @returns {String} - Stripe Customer ID
 */
exports.createOrGetStripeCustomer = async (userId, email, name) => {
  try {
    // Verificar se já existe subscription com customer ID
    const subscription = await PlanSubscription.findByUserId(userId);

    if (subscription && subscription.stripeCustomerId) {
      return subscription.stripeCustomerId;
    }

    // Criar novo customer no Stripe
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        userId: userId.toString()
      }
    });

    // Salvar customer ID
    if (subscription) {
      subscription.stripeCustomerId = customer.id;
      await subscription.save();
    } else {
      await PlanSubscription.create({
        userId,
        planId: 'free',
        status: 'active',
        stripeCustomerId: customer.id
      });
    }

    return customer.id;
  } catch (error) {
    throw new Error(`Erro ao criar customer no Stripe: ${error.message}`);
  }
};

/**
 * Cria sessão de checkout do Stripe
 * @param {String} userId - ID do usuário
 * @param {String} planId - ID do plano (starter ou pro)
 * @param {String} billingInterval - monthly ou yearly
 * @param {String} successUrl - URL de sucesso
 * @param {String} cancelUrl - URL de cancelamento
 * @returns {Object} - { sessionId, url }
 */
exports.createCheckoutSession = async (userId, planId, billingInterval, successUrl, cancelUrl) => {
  try {
    // Validar plano
    if (!['starter', 'pro'].includes(planId)) {
      throw new Error('Plano inválido');
    }

    if (!['monthly', 'yearly'].includes(billingInterval)) {
      throw new Error('Intervalo de cobrança inválido');
    }

    // Obter usuário
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Criar ou obter customer
    const customerId = await exports.createOrGetStripeCustomer(userId, user.email, user.name);

    // Obter Price ID do Stripe
    const priceId = STRIPE_PRICE_IDS[planId][billingInterval];
    if (!priceId) {
      throw new Error('Price ID do Stripe não configurado');
    }

    // Criar checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      billing_address_collection: 'required',
      allow_promotion_codes: true,
      subscription_data: {
        metadata: {
          userId: userId.toString(),
          planId,
          billingInterval
        },
        // Trial period de 7 dias se for primeira assinatura paga
        trial_period_days: user.currentPlanId === 'free' ? 7 : 0
      },
      metadata: {
        userId: userId.toString(),
        planId,
        billingInterval
      }
    });

    return {
      sessionId: session.id,
      url: session.url
    };
  } catch (error) {
    throw new Error(`Erro ao criar checkout session: ${error.message}`);
  }
};

/**
 * Cria sessão do billing portal do Stripe
 * @param {String} userId - ID do usuário
 * @param {String} returnUrl - URL de retorno
 * @returns {String} - URL do portal
 */
exports.createBillingPortalSession = async (userId, returnUrl) => {
  try {
    const subscription = await PlanSubscription.findByUserId(userId);

    if (!subscription || !subscription.stripeCustomerId) {
      throw new Error('Customer do Stripe não encontrado');
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: returnUrl
    });

    return session.url;
  } catch (error) {
    throw new Error(`Erro ao criar billing portal session: ${error.message}`);
  }
};

/**
 * Webhook handler: subscription criada
 * @param {Object} stripeSubscription - Objeto subscription do Stripe
 */
exports.handleSubscriptionCreated = async (stripeSubscription) => {
  try {
    const userId = stripeSubscription.metadata.userId;
    const planId = stripeSubscription.metadata.planId;
    const billingInterval = stripeSubscription.metadata.billingInterval;

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Atualizar ou criar subscription
    let subscription = await PlanSubscription.findByUserId(userId);

    if (!subscription) {
      subscription = new PlanSubscription({ userId });
    }

    subscription.planId = planId;
    subscription.status = stripeSubscription.status;
    subscription.billingInterval = billingInterval;
    subscription.currentPeriodStart = new Date(stripeSubscription.current_period_start * 1000);
    subscription.currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);
    subscription.stripeCustomerId = stripeSubscription.customer;
    subscription.stripeSubscriptionId = stripeSubscription.id;
    subscription.cancelAtPeriodEnd = stripeSubscription.cancel_at_period_end;

    if (stripeSubscription.trial_end) {
      subscription.trialEndsAt = new Date(stripeSubscription.trial_end * 1000);
    }

    await subscription.save();

    // Atualizar limites do usuário
    await user.updatePlanLimits(planId);

    // Enviar email de confirmação
    await emailService.sendSubscriptionConfirmation(user, planId, billingInterval);

    console.log(`[Billing] Subscription criada para usuário ${userId}: ${planId} ${billingInterval}`);
  } catch (error) {
    console.error(`[Billing] Erro ao processar subscription created: ${error.message}`);
    throw error;
  }
};

/**
 * Webhook handler: subscription atualizada
 * @param {Object} stripeSubscription - Objeto subscription do Stripe
 */
exports.handleSubscriptionUpdated = async (stripeSubscription) => {
  try {
    const subscription = await PlanSubscription.findOne({
      stripeSubscriptionId: stripeSubscription.id
    });

    if (!subscription) {
      console.error(`[Billing] Subscription não encontrada: ${stripeSubscription.id}`);
      return;
    }

    const user = await User.findById(subscription.userId);

    // Atualizar dados da subscription
    subscription.status = stripeSubscription.status;
    subscription.currentPeriodStart = new Date(stripeSubscription.current_period_start * 1000);
    subscription.currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);
    subscription.cancelAtPeriodEnd = stripeSubscription.cancel_at_period_end;

    // Detectar mudança de plano
    const newPlanId = stripeSubscription.metadata.planId;
    const newBillingInterval = stripeSubscription.metadata.billingInterval;

    if (newPlanId && newPlanId !== subscription.planId) {
      subscription.planId = newPlanId;
      subscription.billingInterval = newBillingInterval;
      await user.updatePlanLimits(newPlanId);
    }

    await subscription.save();

    console.log(`[Billing] Subscription atualizada: ${stripeSubscription.id}`);
  } catch (error) {
    console.error(`[Billing] Erro ao processar subscription updated: ${error.message}`);
    throw error;
  }
};

/**
 * Webhook handler: subscription deletada/cancelada
 * @param {Object} stripeSubscription - Objeto subscription do Stripe
 */
exports.handleSubscriptionDeleted = async (stripeSubscription) => {
  try {
    const subscription = await PlanSubscription.findOne({
      stripeSubscriptionId: stripeSubscription.id
    });

    if (!subscription) {
      console.error(`[Billing] Subscription não encontrada: ${stripeSubscription.id}`);
      return;
    }

    const user = await User.findById(subscription.userId);

    // Marcar como cancelada
    subscription.status = 'canceled';
    subscription.cancelAtPeriodEnd = false;
    await subscription.save();

    // Downgrade para FREE
    await user.updatePlanLimits('free');

    // Enviar email de cancelamento
    await emailService.sendCancellationConfirmation(user, subscription.planId, new Date());

    console.log(`[Billing] Subscription cancelada: ${stripeSubscription.id}, usuário downgrade para FREE`);
  } catch (error) {
    console.error(`[Billing] Erro ao processar subscription deleted: ${error.message}`);
    throw error;
  }
};

/**
 * Webhook handler: invoice paga
 * @param {Object} stripeInvoice - Objeto invoice do Stripe
 */
exports.handleInvoicePaid = async (stripeInvoice) => {
  try {
    const subscription = await PlanSubscription.findOne({
      stripeSubscriptionId: stripeInvoice.subscription
    });

    if (!subscription) {
      console.log(`[Billing] Invoice sem subscription associada: ${stripeInvoice.id}`);
      return;
    }

    // Verificar se já existe registro
    const existing = await BillingHistory.findByInvoiceId(stripeInvoice.id);
    if (existing) {
      console.log(`[Billing] Invoice já registrada: ${stripeInvoice.id}`);
      return;
    }

    // Criar registro de histórico
    await BillingHistory.create({
      userId: subscription.userId,
      subscriptionId: subscription._id,
      stripeInvoiceId: stripeInvoice.id,
      amount: stripeInvoice.amount_paid,
      currency: stripeInvoice.currency.toUpperCase(),
      status: 'paid',
      paidAt: new Date(stripeInvoice.status_transitions.paid_at * 1000),
      invoicePdf: stripeInvoice.invoice_pdf,
      description: `Pagamento ${subscription.planId.toUpperCase()} - ${subscription.billingInterval}`,
      planId: subscription.planId,
      billingInterval: subscription.billingInterval
    });

    // Atualizar subscription
    subscription.lastPaymentDate = new Date(stripeInvoice.status_transitions.paid_at * 1000);
    subscription.nextPaymentDate = new Date(stripeInvoice.period_end * 1000);
    subscription.paymentFailureCount = 0;
    await subscription.save();

    const user = await User.findById(subscription.userId);

    // Enviar email de confirmação
    await emailService.sendPaymentSuccess(user, stripeInvoice.amount_paid, stripeInvoice);

    console.log(`[Billing] Invoice paga: ${stripeInvoice.id}, valor: ${stripeInvoice.amount_paid / 100}`);
  } catch (error) {
    console.error(`[Billing] Erro ao processar invoice paid: ${error.message}`);
    throw error;
  }
};

/**
 * Webhook handler: falha no pagamento
 * @param {Object} stripeInvoice - Objeto invoice do Stripe
 */
exports.handleInvoicePaymentFailed = async (stripeInvoice) => {
  try {
    const subscription = await PlanSubscription.findOne({
      stripeSubscriptionId: stripeInvoice.subscription
    });

    if (!subscription) {
      console.log(`[Billing] Invoice sem subscription associada: ${stripeInvoice.id}`);
      return;
    }

    // Incrementar contador de falhas
    subscription.paymentFailureCount += 1;
    subscription.status = 'past_due';
    await subscription.save();

    const user = await User.findById(subscription.userId);

    // Criar registro de histórico
    const existing = await BillingHistory.findByInvoiceId(stripeInvoice.id);
    if (!existing) {
      await BillingHistory.create({
        userId: subscription.userId,
        subscriptionId: subscription._id,
        stripeInvoiceId: stripeInvoice.id,
        amount: stripeInvoice.amount_due,
        currency: stripeInvoice.currency.toUpperCase(),
        status: 'failed',
        description: `Pagamento ${subscription.planId.toUpperCase()} - ${subscription.billingInterval}`,
        failureReason: stripeInvoice.last_finalization_error?.message || 'Falha no pagamento',
        planId: subscription.planId,
        billingInterval: subscription.billingInterval
      });
    }

    // Enviar email de alerta
    const nextRetry = new Date(stripeInvoice.next_payment_attempt * 1000);
    await emailService.sendPaymentFailed(user, stripeInvoice.amount_due, nextRetry);

    // Após 3 falhas, cancelar subscription
    if (subscription.paymentFailureCount >= 3) {
      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
      console.log(`[Billing] Subscription cancelada após 3 falhas: ${subscription.stripeSubscriptionId}`);
    }

    console.log(`[Billing] Falha no pagamento: ${stripeInvoice.id}, tentativa ${subscription.paymentFailureCount}`);
  } catch (error) {
    console.error(`[Billing] Erro ao processar invoice payment failed: ${error.message}`);
    throw error;
  }
};

/**
 * Webhook handler: método de pagamento anexado
 * @param {Object} paymentMethod - Objeto payment method do Stripe
 */
exports.handlePaymentMethodAttached = async (paymentMethod) => {
  try {
    const subscription = await PlanSubscription.findOne({
      stripeCustomerId: paymentMethod.customer
    });

    if (subscription) {
      subscription.stripePaymentMethodId = paymentMethod.id;
      await subscription.save();

      console.log(`[Billing] Método de pagamento atualizado: ${paymentMethod.id}`);
    }
  } catch (error) {
    console.error(`[Billing] Erro ao processar payment method attached: ${error.message}`);
    throw error;
  }
};

/**
 * Faz upgrade de plano (efeito imediato com proration)
 * @param {String} userId - ID do usuário
 * @param {String} newPlanId - Novo plano
 * @param {String} newBillingInterval - Novo intervalo
 */
exports.upgradePlan = async (userId, newPlanId, newBillingInterval) => {
  try {
    const subscription = await PlanSubscription.findByUserId(userId);
    const user = await User.findById(userId);

    if (!subscription || !subscription.stripeSubscriptionId) {
      throw new Error('Subscription não encontrada');
    }

    // Obter novo price ID
    const newPriceId = STRIPE_PRICE_IDS[newPlanId][newBillingInterval];
    if (!newPriceId) {
      throw new Error('Price ID não configurado');
    }

    // Atualizar subscription no Stripe (com proration)
    const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);

    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      items: [{
        id: stripeSubscription.items.data[0].id,
        price: newPriceId
      }],
      proration_behavior: 'create_prorations',
      metadata: {
        userId: userId.toString(),
        planId: newPlanId,
        billingInterval: newBillingInterval
      }
    });

    // Atualizar localmente
    const oldPlanId = subscription.planId;
    subscription.planId = newPlanId;
    subscription.billingInterval = newBillingInterval;
    await subscription.save();

    // Atualizar limites imediatamente
    await user.updatePlanLimits(newPlanId);

    // Enviar email
    await emailService.sendUpgradeConfirmation(user, oldPlanId, newPlanId);

    console.log(`[Billing] Upgrade realizado: ${oldPlanId} -> ${newPlanId}`);

    return subscription;
  } catch (error) {
    throw new Error(`Erro ao fazer upgrade: ${error.message}`);
  }
};

/**
 * Faz downgrade de plano (efeito ao fim do período)
 * @param {String} userId - ID do usuário
 * @param {String} newPlanId - Novo plano
 * @param {String} newBillingInterval - Novo intervalo
 */
exports.downgradePlan = async (userId, newPlanId, newBillingInterval) => {
  try {
    const subscription = await PlanSubscription.findByUserId(userId);
    const user = await User.findById(userId);

    if (!subscription || !subscription.stripeSubscriptionId) {
      throw new Error('Subscription não encontrada');
    }

    // Agendar para fim do período
    subscription.cancelAtPeriodEnd = true;
    await subscription.save();

    // Agendar update no Stripe (via schedule)
    // Nota: isso deve ser implementado com Stripe Scheduled Changes ou manualmente no webhook de subscription.deleted

    // Enviar email
    await emailService.sendDowngradeScheduled(
      user,
      subscription.planId,
      newPlanId,
      subscription.currentPeriodEnd
    );

    console.log(`[Billing] Downgrade agendado: ${subscription.planId} -> ${newPlanId} em ${subscription.currentPeriodEnd}`);

    return subscription;
  } catch (error) {
    throw new Error(`Erro ao fazer downgrade: ${error.message}`);
  }
};

/**
 * Cancela subscription
 * @param {String} userId - ID do usuário
 * @param {Boolean} immediate - Cancelar imediatamente ou ao fim do período
 */
exports.cancelSubscription = async (userId, immediate = false) => {
  try {
    const subscription = await PlanSubscription.findByUserId(userId);
    const user = await User.findById(userId);

    if (!subscription || !subscription.stripeSubscriptionId) {
      throw new Error('Subscription não encontrada');
    }

    if (immediate) {
      // Cancelar imediatamente
      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);

      subscription.status = 'canceled';
      subscription.cancelAtPeriodEnd = false;
      await subscription.save();

      // Downgrade para FREE
      await user.updatePlanLimits('free');

      await emailService.sendCancellationConfirmation(user, subscription.planId, new Date());
    } else {
      // Agendar para fim do período
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true
      });

      subscription.cancelAtPeriodEnd = true;
      await subscription.save();

      await emailService.sendCancellationConfirmation(user, subscription.planId, subscription.currentPeriodEnd);
    }

    console.log(`[Billing] Subscription cancelada (immediate: ${immediate})`);

    return subscription;
  } catch (error) {
    throw new Error(`Erro ao cancelar subscription: ${error.message}`);
  }
};

/**
 * Reativa subscription cancelada
 * @param {String} userId - ID do usuário
 */
exports.reactivateSubscription = async (userId) => {
  try {
    const subscription = await PlanSubscription.findByUserId(userId);

    if (!subscription || !subscription.stripeSubscriptionId) {
      throw new Error('Subscription não encontrada');
    }

    if (!subscription.cancelAtPeriodEnd) {
      throw new Error('Subscription não está agendada para cancelamento');
    }

    // Remover agendamento de cancelamento
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: false
    });

    subscription.cancelAtPeriodEnd = false;
    subscription.status = 'active';
    await subscription.save();

    console.log(`[Billing] Subscription reativada: ${subscription.stripeSubscriptionId}`);

    return subscription;
  } catch (error) {
    throw new Error(`Erro ao reativar subscription: ${error.message}`);
  }
};

/**
 * Obtém subscription do Stripe (helper para cron jobs)
 * @param {String} stripeSubscriptionId - ID da subscription no Stripe
 * @returns {Object|null} - Stripe Subscription object ou null se não encontrado
 */
exports.getStripeSubscription = async (stripeSubscriptionId) => {
  try {
    const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    return subscription;
  } catch (error) {
    if (error.code === 'resource_missing') {
      return null;
    }
    throw error;
  }
};

module.exports = exports;
