<script setup>
import { computed } from 'vue'
import { Icon } from '@iconify/vue'

const props = defineProps({
  plan: {
    type: Object,
    required: true
  },
  current: {
    type: Boolean,
    default: false
  },
  billingInterval: {
    type: String,
    default: 'monthly',
    validator: (value) => ['monthly', 'yearly'].includes(value)
  },
  planIndex: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['select'])

const displayPrice = computed(() => {
  if (props.billingInterval === 'yearly') {
    const yearlyPrice = props.plan.priceYearly || props.plan.price * 12
    const monthlyCost = props.plan.price * 12
    const savings = Math.round((monthlyCost - yearlyPrice) * 100) / 100
    return {
      value: yearlyPrice,
      period: '/ano',
      savings
    }
  }
  return {
    value: props.plan.price,
    period: '/mês',
    savings: 0
  }
})

const previousPlanName = computed(() => {
  if (props.planIndex > 0) {
    const planNames = ['FREE', 'STARTER', 'PRO']
    return planNames[props.planIndex - 1]
  }
  return null
})

const isFeatured = computed(() => {
  return props.plan.popular && !props.current
})

function handleSelect() {
  if (!props.current) {
    emit('select', props.plan.id)
  }
}
</script>

<template>
  <div
    :class="[
      'relative glass-card backdrop-blur-xl bg-white/70 rounded-xl border-2 p-5 flex flex-col shadow-sm transition-all duration-500',
      isFeatured ? 'border-blue-500 shadow-lg shadow-blue-500/20' : 'border-white/40',
      current ? 'border-blue-500' : ''
    ]"
  >
    <!-- Featured Badge -->
    <div v-if="isFeatured" class="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
      <div class="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs font-semibold rounded-full shadow-lg whitespace-nowrap">
        MAIS POPULAR
      </div>
    </div>

    <!-- Current plan badge -->
    <div v-else-if="current" class="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
      <div class="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs font-semibold rounded-full shadow-lg whitespace-nowrap flex items-center gap-1.5">
        <Icon icon="lucide:check-circle" class="w-3.5 h-3.5" />
        SEU PLANO
      </div>
    </div>

    <!-- Plan Header -->
    <div class="mb-4 pt-1 flex-shrink-0">
      <div class="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 bg-blue-500/10 text-blue-700">
        {{ plan.name }}
      </div>

      <!-- Price - Compacto -->
      <div class="mb-2 flex items-baseline gap-1">
        <span class="text-4xl font-black text-gray-900 tracking-tighter leading-none">
          {{ plan.price === 0 ? 'R$ 0' : `R$ ${Math.floor(plan.price)}` }}
        </span>
        <span v-if="plan.price > 0" class="text-sm font-semibold text-gray-500">/mês</span>
      </div>
    </div>

    <!-- CTA Button - Top position -->
    <div class="mb-3 flex-shrink-0">
      <button
        v-if="current"
        disabled
        class="w-full bg-gray-100 text-gray-500 px-4 py-2.5 rounded-lg text-sm font-semibold cursor-not-allowed"
      >
        Plano Atual
      </button>
      <button
        v-else-if="plan.id === 'free'"
        disabled
        class="w-full bg-gray-50 text-gray-400 px-4 py-2.5 rounded-lg text-sm font-semibold cursor-not-allowed border border-gray-200"
      >
        Plano Gratuito
      </button>
      <button
        v-else
        @click="handleSelect"
        :class="[
          'w-full px-4 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2',
          isFeatured
            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40'
            : 'bg-white text-blue-600 border-2 border-blue-500 hover:bg-blue-600 hover:text-white'
        ]"
      >
        <span>{{ plan.cta || `Escolher ${plan.name}` }}</span>
        <Icon icon="lucide:arrow-right" class="w-4 h-4" />
      </button>
    </div>

    <!-- Divider -->
    <div class="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-3 flex-shrink-0"></div>

    <!-- Key Highlights - Compacto -->
    <div class="space-y-2">
      <!-- Limites em formato compacto -->
      <div class="flex items-center gap-2 text-sm text-gray-700">
        <div class="w-4 h-4 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
          <Icon icon="lucide:zap" class="w-2.5 h-2.5 text-blue-600" />
        </div>
        <span><span class="font-bold">{{ plan.limits.executions.toLocaleString('pt-BR') }}</span> execuções/mês</span>
      </div>

      <div class="flex items-center gap-2 text-sm text-gray-700">
        <div class="w-4 h-4 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
          <Icon icon="lucide:workflow" class="w-2.5 h-2.5 text-blue-600" />
        </div>
        <span><span class="font-bold">{{ plan.limits.flows }}</span> flows ativos</span>
      </div>

      <div class="flex items-center gap-2 text-sm text-gray-700">
        <div class="w-4 h-4 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
          <Icon icon="lucide:database" class="w-2.5 h-2.5 text-blue-600" />
        </div>
        <span><span class="font-bold">{{ plan.limits.dataPerMonth >= 1073741824 ? (plan.limits.dataPerMonth / 1073741824).toFixed(0) + ' GB' : (plan.limits.dataPerMonth / 1048576).toFixed(0) + ' MB' }}</span> de armazenamento</span>
      </div>
    </div>

    <!-- Featured glow effect -->
    <div v-if="isFeatured" class="absolute inset-0 -z-10 blur-xl opacity-20 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-xl"></div>
  </div>
</template>

<style scoped>
.glass-card {
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
}
</style>
