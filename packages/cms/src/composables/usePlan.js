import { ref, computed } from 'vue'
import api from '../utils/api.js'

// Plan definitions
export const PLANS = {
  FREE: {
    id: 'free',
    name: 'FREE',
    price: 0,
    priceYearly: 0,
    currency: 'BRL',
    limits: {
      executions: 200,
      flows: 5,
      dataPerMonth: 50 * 1024 * 1024, // 50MB in bytes
      dataRetentionDays: 7
    },
    features: [
      'Editor visual de flows',
      'Conectores básicos (HTTP API, Google Sheets)',
      'Nodes essenciais',
      'Execução manual',
      'Debug viewer',
      'Documentação completa',
      'Suporte via comunidade'
    ],
    restrictions: [
      'Sem agendamento automático',
      'Sem OAuth connectors',
      'Sem data matching',
      'Sem API access'
    ]
  },
  STARTER: {
    id: 'starter',
    name: 'STARTER',
    price: 35.90,
    priceYearly: 290,
    currency: 'BRL',
    popular: true,
    limits: {
      executions: 2000,
      flows: 25,
      dataPerMonth: 1 * 1024 * 1024 * 1024, // 1GB in bytes
      dataRetentionDays: 30
    },
    features: [
      'Tudo do FREE',
      'Agendamento automático (mínimo: 1 hora)',
      'Todos os conectores (OAuth incluído)',
      'Webhooks de entrada',
      'Variáveis e state management',
      'Histórico detalhado',
      'Export/import flows',
      'Notificações por email',
      'Suporte via email (48h)'
    ]
  },
  PRO: {
    id: 'pro',
    name: 'PRO',
    price: 130,
    priceYearly: 999,
    currency: 'BRL',
    limits: {
      executions: 10000,
      flows: 100,
      dataPerMonth: 10 * 1024 * 1024 * 1024, // 10GB in bytes
      dataRetentionDays: 90
    },
    features: [
      'Tudo do STARTER',
      'Agendamento avançado (mínimo: 5 min)',
      'Data matching e deduplicação',
      'REST API completa',
      'Webhooks de saída',
      'Real-time logs via WebSocket',
      'Permissões granulares',
      'Ambientes (dev, staging, prod)',
      'Versionamento de flows',
      'SLA 99.5% uptime',
      'Priority support (4h)',
      'Auditoria completa',
      'Custom nodes (JavaScript)',
      'Integração CI/CD'
    ]
  }
}

export function usePlan() {
  // State
  const currentPlan = ref(null)
  const subscription = ref(null)
  const usage = ref(null)
  const limits = ref(null)
  const usagePercent = ref({})
  const warnings = ref([])
  const loading = ref(false)
  const error = ref('')

  // Computed
  const planName = computed(() => currentPlan.value?.planId || 'free')
  const planDetails = computed(() => PLANS[planName.value.toUpperCase()] || PLANS.FREE)

  const usagePercentages = computed(() => {
    return usagePercent.value || {}
  })

  const isNearLimit = computed(() => {
    const percentages = usagePercentages.value
    return Object.values(percentages).some(p => p >= 80)
  })

  const isOverLimit = computed(() => {
    const percentages = usagePercentages.value
    return Object.values(percentages).some(p => p >= 100)
  })

  const nextBillingDate = computed(() => {
    return subscription.value?.currentPeriodEnd || subscription.value?.nextPaymentDate || null
  })

  // Methods
  async function getCurrentPlan() {
    try {
      loading.value = true
      error.value = ''

      // Get plan and usage from profile
      const response = await api.get('/auth/profile')

      if (response.data?.success) {
        const profile = response.data.data
        currentPlan.value = profile.currentPlan || { planId: 'free', isPaid: false }
        usage.value = profile.usage || { executions: 0, activeFlows: 0, dataUsed: 0 }
        limits.value = profile.limits || PLANS.FREE.limits
        usagePercent.value = profile.usagePercentages || {}
        warnings.value = profile.warnings || []

        return { success: true, data: profile }
      }

      return { success: false, error: 'Failed to fetch plan' }
    } catch (err) {
      error.value = err.response?.data?.message || 'Erro ao buscar plano'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  async function getCurrentUsage() {
    // Usage is fetched together with plan in getCurrentPlan()
    // This method is kept for compatibility
    return getCurrentPlan()
  }

  async function getSubscription() {
    try {
      loading.value = true
      error.value = ''

      const response = await api.get('/billing/subscription')

      if (response.data?.success) {
        subscription.value = response.data.subscription
        return { success: true, data: response.data.subscription }
      }

      return { success: false, error: 'Failed to fetch subscription' }
    } catch (err) {
      error.value = err.response?.data?.message || 'Erro ao buscar assinatura'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  async function createCheckoutSession(planId, billingInterval = 'monthly') {
    try {
      loading.value = true
      error.value = ''

      console.log('[usePlan] Creating checkout session:', { planId, billingInterval })

      const response = await api.post('/billing/checkout', {
        planId,
        billingInterval
      })

      console.log('[usePlan] Checkout response:', response.data)

      if (response.data?.success) {
        const checkoutUrl = response.data.data?.url || response.data.url
        console.log('[usePlan] Redirecting to:', checkoutUrl)

        // Redirect to Stripe Checkout
        window.location.href = checkoutUrl
        return { success: true }
      }

      const errorMsg = response.data?.message || 'Failed to create checkout session'
      console.error('[usePlan] Checkout failed:', errorMsg)
      return { success: false, error: errorMsg }
    } catch (err) {
      console.error('[usePlan] Checkout error:', err)
      console.error('[usePlan] Error response:', err.response?.data)

      error.value = err.response?.data?.message || err.response?.data?.error || 'Erro ao criar sessão de checkout'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  async function openBillingPortal() {
    try {
      loading.value = true
      error.value = ''

      const response = await api.post('/billing/portal')

      if (response.data?.success) {
        // Redirect to Stripe Billing Portal
        window.location.href = response.data.data.url
        return { success: true }
      }

      return { success: false, error: 'Failed to open billing portal' }
    } catch (err) {
      error.value = err.response?.data?.message || 'Erro ao abrir portal de cobrança'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  async function upgradePlan(newPlanId, newBillingInterval = 'monthly') {
    try {
      loading.value = true
      error.value = ''

      const response = await api.post('/billing/upgrade', {
        newPlanId,
        newBillingInterval
      })

      if (response.data?.success) {
        await getCurrentPlan()
        return { success: true, message: 'Plano atualizado com sucesso!' }
      }

      return { success: false, error: 'Failed to upgrade plan' }
    } catch (err) {
      error.value = err.response?.data?.message || 'Erro ao fazer upgrade do plano'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  async function downgradePlan(newPlanId, newBillingInterval = 'monthly') {
    try {
      loading.value = true
      error.value = ''

      const response = await api.post('/billing/downgrade', {
        newPlanId,
        newBillingInterval
      })

      if (response.data?.success) {
        await getCurrentPlan()
        return { success: true, message: 'Downgrade agendado para o fim do período atual' }
      }

      return { success: false, error: 'Failed to downgrade plan' }
    } catch (err) {
      error.value = err.response?.data?.message || 'Erro ao fazer downgrade do plano'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  async function cancelSubscription() {
    try {
      loading.value = true
      error.value = ''

      const response = await api.post('/billing/cancel')

      if (response.data?.success) {
        await getCurrentPlan()
        return { success: true, message: 'Assinatura cancelada com sucesso' }
      }

      return { success: false, error: 'Failed to cancel subscription' }
    } catch (err) {
      error.value = err.response?.data?.message || 'Erro ao cancelar assinatura'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  async function reactivateSubscription() {
    try {
      loading.value = true
      error.value = ''

      const response = await api.post('/billing/reactivate')

      if (response.data?.success) {
        await getCurrentPlan()
        return { success: true, message: 'Assinatura reativada com sucesso!' }
      }

      return { success: false, error: 'Failed to reactivate subscription' }
    } catch (err) {
      error.value = err.response?.data?.message || 'Erro ao reativar assinatura'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  function formatNumber(num) {
    return new Intl.NumberFormat('pt-BR').format(num)
  }

  return {
    // State
    currentPlan: computed(() => currentPlan.value),
    subscription: computed(() => subscription.value),
    usage: computed(() => usage.value),
    limits: computed(() => limits.value),
    warnings: computed(() => warnings.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),

    // Computed
    planName,
    planDetails,
    usagePercentages,
    isNearLimit,
    isOverLimit,
    nextBillingDate,
    PLANS,

    // Methods
    getCurrentPlan,
    getCurrentUsage,
    getSubscription,
    createCheckoutSession,
    openBillingPortal,
    upgradePlan,
    downgradePlan,
    cancelSubscription,
    reactivateSubscription,
    formatBytes,
    formatNumber
  }
}
