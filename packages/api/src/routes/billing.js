const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');
const { authenticate } = require('../middleware/auth');

// Middleware para raw body (necessário para webhook do Stripe)
const rawBodyMiddleware = express.raw({ type: 'application/json' });

/**
 * @route POST /api/billing/webhook
 * @desc Webhook do Stripe (público, validado por signature)
 * @access Public
 */
router.post('/webhook', rawBodyMiddleware, billingController.handleWebhook);

/**
 * @route POST /api/billing/checkout
 * @desc Cria sessão de checkout do Stripe
 * @access Private
 */
router.post('/checkout', authenticate, billingController.createCheckout);

/**
 * @route POST /api/billing/portal
 * @desc Cria sessão do billing portal
 * @access Private
 */
router.post('/portal', authenticate, billingController.createPortal);

/**
 * @route GET /api/billing/subscription
 * @desc Obtém subscription atual do usuário
 * @access Private
 */
router.get('/subscription', authenticate, billingController.getSubscription);

/**
 * @route GET /api/billing/invoices
 * @desc Lista histórico de faturas
 * @access Private
 */
router.get('/invoices', authenticate, billingController.getInvoices);

/**
 * @route POST /api/billing/upgrade
 * @desc Faz upgrade de plano (efeito imediato)
 * @access Private
 */
router.post('/upgrade', authenticate, billingController.upgradePlan);

/**
 * @route POST /api/billing/downgrade
 * @desc Agenda downgrade de plano (efeito ao fim do período)
 * @access Private
 */
router.post('/downgrade', authenticate, billingController.downgradePlan);

/**
 * @route POST /api/billing/cancel
 * @desc Cancela assinatura
 * @access Private
 */
router.post('/cancel', authenticate, billingController.cancelSubscription);

/**
 * @route POST /api/billing/reactivate
 * @desc Reativa assinatura cancelada
 * @access Private
 */
router.post('/reactivate', authenticate, billingController.reactivateSubscription);

module.exports = router;
