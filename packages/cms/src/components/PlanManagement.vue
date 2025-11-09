<script setup>
import { ref, onMounted, computed } from 'vue'
import { Icon } from '@iconify/vue'
import BaseCard from './BaseCard.vue'
import PlanCard from './PlanCard.vue'
import { usePlan } from '../composables/usePlan.js'

const {
  currentPlan,
  subscription,
  usage,
  loading,
  planDetails,
  usagePercentages,
  isNearLimit,
  isOverLimit,
  nextBillingDate,
  warnings,
  PLANS,
  getCurrentPlan,
  getSubscription,
  createCheckoutSession,
  openBillingPortal,
  formatBytes,
  formatNumber
} = usePlan()

const billingInterval = ref('monthly')

onMounted(async () => {
  await getCurrentPlan()
  await getSubscription()
})

const formattedNextBillingDate = computed(() => {
  if (!nextBillingDate.value) return null
  return new Date(nextBillingDate.value).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
})

const plansList = computed(() => {
  return [PLANS.FREE, PLANS.STARTER, PLANS.PRO]
})

function getProgressBarColor(percentage) {
  if (percentage >= 100) return 'bg-red-600'
  if (percentage >= 80) return 'bg-orange-600'
  return 'bg-green-600'
}

function getProgressBarWidth(percentage) {
  return Math.min(percentage, 100) + '%'
}

async function handleSelectPlan(planId) {
  console.log('[PlanManagement] Selecting plan:', planId, 'interval:', billingInterval.value)

  const result = await createCheckoutSession(planId, billingInterval.value)

  if (!result.success) {
    console.error('[PlanManagement] Checkout failed:', result.error)
    alert(`Erro ao criar checkout: ${result.error}`)
  }
}

async function handleManageBilling() {
  console.log('[PlanManagement] Opening billing portal')

  const result = await openBillingPortal()

  if (!result.success) {
    console.error('[PlanManagement] Portal failed:', result.error)
    alert(`Erro ao abrir portal: ${result.error}`)
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Current Plan Summary -->
    <div class="bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-xl border border-blue-500/20 p-6 glass-card backdrop-blur-xl">
      <div v-if="loading && !currentPlan" class="flex justify-center items-center py-8">
        <Icon icon="lucide:loader-2" class="w-8 h-8 text-blue-600 animate-spin" />
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Plan Info -->
        <div class="lg:col-span-3">
          <div class="flex items-center gap-3 mb-4">
            <div class="bg-blue-500/10 text-blue-600 p-2.5 rounded-lg">
              <Icon icon="lucide:sparkles" class="w-5 h-5" />
            </div>
            <div>
              <p class="text-xs text-gray-500 uppercase tracking-wider">Seu Plano</p>
              <h3 class="text-xl font-bold text-gray-900">{{ planDetails.name }}</h3>
            </div>
          </div>

          <div class="space-y-2 mb-4">
            <div v-if="planDetails.price > 0" class="flex items-baseline gap-1">
              <span class="text-2xl font-bold text-gray-900">R$ {{ planDetails.price }}</span>
              <span class="text-gray-500 text-sm">/mês</span>
            </div>
            <p v-else class="text-lg font-medium text-gray-600">Gratuito</p>

            <div v-if="currentPlan && currentPlan.planId !== 'free'" class="text-xs text-gray-500">
              Renova em {{ formattedNextBillingDate || 'N/A' }}
            </div>
          </div>

          <button
            v-if="currentPlan && currentPlan.planId !== 'free'"
            @click="handleManageBilling"
            :disabled="loading"
            class="w-full bg-white text-blue-600 border border-blue-500 px-3 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition-all disabled:opacity-50 text-sm font-medium"
          >
            <Icon icon="lucide:settings" class="w-4 h-4 inline mr-1.5" />
            Gerenciar
          </button>
        </div>

        <!-- Usage Stats -->
        <div class="lg:col-span-9">
          <h4 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Icon icon="lucide:bar-chart-3" class="w-4 h-4" />
            Uso do Mês Atual
          </h4>

          <div v-if="usage" class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Executions -->
            <div class="bg-white rounded-lg p-3 border border-gray-100">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-gray-700">Execuções</span>
                <span :class="['text-sm font-bold', (usagePercentages.executions || 0) >= 80 ? 'text-orange-600' : 'text-green-600']">
                  {{ usagePercentages.executions || 0 }}%
                </span>
              </div>
              <div class="w-full bg-gray-100 rounded-full h-2 overflow-hidden mb-2">
                <div
                  :class="['h-2 rounded-full transition-all', getProgressBarColor(usagePercentages.executions || 0)]"
                  :style="{ width: getProgressBarWidth(usagePercentages.executions || 0) }"
                ></div>
              </div>
              <p class="text-xs text-gray-500">{{ formatNumber(usage.executions || 0) }} / {{ formatNumber(planDetails.limits.executions) }}</p>
            </div>

            <!-- Flows -->
            <div class="bg-white rounded-lg p-3 border border-gray-100">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-gray-700">Flows Ativos</span>
                <span :class="['text-sm font-bold', (usagePercentages.flows || 0) >= 80 ? 'text-orange-600' : 'text-green-600']">
                  {{ usagePercentages.flows || 0 }}%
                </span>
              </div>
              <div class="w-full bg-gray-100 rounded-full h-2 overflow-hidden mb-2">
                <div
                  :class="['h-2 rounded-full transition-all', getProgressBarColor(usagePercentages.flows || 0)]"
                  :style="{ width: getProgressBarWidth(usagePercentages.flows || 0) }"
                ></div>
              </div>
              <p class="text-xs text-gray-500">{{ usage.activeFlows || 0 }} / {{ planDetails.limits.flows }}</p>
            </div>

            <!-- Data -->
            <div class="bg-white rounded-lg p-3 border border-gray-100">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-gray-700">Dados</span>
                <span :class="['text-sm font-bold', (usagePercentages.data || 0) >= 80 ? 'text-orange-600' : 'text-green-600']">
                  {{ usagePercentages.data || 0 }}%
                </span>
              </div>
              <div class="w-full bg-gray-100 rounded-full h-2 overflow-hidden mb-2">
                <div
                  :class="['h-2 rounded-full transition-all', getProgressBarColor(usagePercentages.data || 0)]"
                  :style="{ width: getProgressBarWidth(usagePercentages.data || 0) }"
                ></div>
              </div>
              <p class="text-xs text-gray-500">{{ formatBytes(usage.dataUsed || 0) }} / {{ formatBytes(planDetails.limits.dataPerMonth) }}</p>
            </div>
          </div>

          <!-- No usage data -->
          <div v-else class="text-center py-4 text-gray-500">
            Carregando dados de uso...
          </div>

          <!-- Warning -->
          <div v-if="isOverLimit || isNearLimit" class="mt-3">
            <div :class="[
              'px-3 py-2 rounded-lg flex items-center gap-2 text-sm',
              isOverLimit ? 'bg-red-500/10 text-red-600' : 'bg-orange-500/10 text-orange-600'
            ]">
              <Icon :icon="isOverLimit ? 'lucide:alert-circle' : 'lucide:alert-triangle'" class="w-4 h-4 flex-shrink-0" />
              <span class="font-medium">{{ isOverLimit ? 'Você excedeu os limites do plano' : 'Você está próximo dos limites' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Plans Comparison -->
    <BaseCard>
      <div class="flex items-center justify-between mb-6">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">Planos Disponíveis</h3>
          <p class="text-sm text-gray-500 mt-1">Escolha o plano ideal para suas necessidades</p>
        </div>

        <!-- Billing Toggle -->
        <div class="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            @click="billingInterval = 'monthly'"
            :class="[
              'px-4 py-1.5 rounded-md text-sm font-medium transition-all',
              billingInterval === 'monthly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            ]"
          >
            Mensal
          </button>
          <button
            @click="billingInterval = 'yearly'"
            :class="[
              'px-4 py-1.5 rounded-md text-sm font-medium transition-all relative',
              billingInterval === 'yearly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            ]"
          >
            Anual
            <span class="absolute -top-3 -right-3 bg-brand-green text-white text-[9px] font-bold px-1 py-0.5 rounded">
              -32%
            </span>
          </button>
        </div>
      </div>

      <!-- Plans Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <PlanCard
          v-for="plan in plansList"
          :key="plan.id"
          :plan="plan"
          :current="currentPlan?.planId === plan.id"
          :billing-interval="billingInterval"
          @select="handleSelectPlan"
        />
      </div>
    </BaseCard>
  </div>
</template>
