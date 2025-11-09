<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  errorMessage: {
    type: String,
    default: ''
  },
  limitType: {
    type: String,
    default: 'generic', // 'flows', 'executions', 'storage', 'schedules', 'generic'
  }
})

const emit = defineEmits(['close'])

const router = useRouter()

const limitInfo = computed(() => {
  const types = {
    flows: {
      title: 'Limite de Flows Atingido',
      icon: 'lucide:workflow',
      tip: 'Você pode excluir flows que não está mais usando ou fazer upgrade para criar mais flows.',
      action: 'Gerenciar Meus Flows',
      actionRoute: '/flows'
    },
    executions: {
      title: 'Limite de Execuções Atingido',
      icon: 'lucide:play-circle',
      tip: 'Você atingiu o limite mensal de execuções. Faça upgrade para continuar executando seus flows.',
      action: 'Ver Histórico de Execuções',
      actionRoute: '/executions'
    },
    storage: {
      title: 'Limite de Armazenamento Atingido',
      icon: 'lucide:hard-drive',
      tip: 'Seu armazenamento está cheio. Você pode excluir execuções antigas ou fazer upgrade para mais espaço.',
      action: 'Ver Armazenamento',
      actionRoute: '/profile?tab=plan'
    },
    schedules: {
      title: 'Limite de Agendamentos Atingido',
      icon: 'lucide:calendar',
      tip: 'Schedules não estão disponíveis no plano FREE. Faça upgrade para agendar execuções automáticas.',
      action: 'Gerenciar Schedules',
      actionRoute: '/schedules'
    },
    generic: {
      title: 'Limite do Plano Atingido',
      icon: 'lucide:alert-triangle',
      tip: 'Você atingiu um limite do seu plano atual. Faça upgrade para continuar usando todos os recursos.',
      action: 'Ver Detalhes',
      actionRoute: '/profile?tab=plan'
    }
  }

  return types[props.limitType] || types.generic
})

function goToUpgrade() {
  router.push('/profile?tab=plan')
  emit('close')
}

function goToAction() {
  router.push(limitInfo.value.actionRoute)
  emit('close')
}
</script>

<template>
  <div v-if="show" class="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-lg p-6 shadow-lg">
    <div class="flex items-start gap-4">
      <div class="flex-shrink-0">
        <div class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
          <Icon :icon="limitInfo.icon" class="w-6 h-6 text-orange-600" />
        </div>
      </div>
      <div class="flex-1">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">
          {{ limitInfo.title }}
        </h3>
        <p class="text-gray-700 mb-4">
          {{ errorMessage || 'Você atingiu o limite do seu plano atual.' }}
        </p>
        <div class="bg-white/80 rounded-lg p-4 mb-4">
          <p class="text-sm text-gray-600">
            <strong>💡 Dica:</strong> {{ limitInfo.tip }}
          </p>
        </div>
        <div class="flex flex-wrap gap-3">
          <button
            @click="goToUpgrade"
            class="px-6 py-3 bg-brand-purple text-white rounded-lg hover:brightness-110 transition-all flex items-center gap-2 font-medium shadow-sm"
          >
            <Icon icon="lucide:sparkles" class="w-5 h-5" />
            Ver Planos e Fazer Upgrade
          </button>
          <button
            @click="goToAction"
            class="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2 font-medium"
          >
            <Icon icon="lucide:arrow-right" class="w-5 h-5" />
            {{ limitInfo.action }}
          </button>
        </div>
      </div>
      <button
        @click="$emit('close')"
        class="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <Icon icon="lucide:x" class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>
