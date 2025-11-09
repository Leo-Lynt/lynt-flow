<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import AppLayout from '../components/AppLayout.vue'
import StatsCard from '../components/StatsCard.vue'
import ExecutionStatusBadge from '../components/ExecutionStatusBadge.vue'
import { useDashboard } from '../composables/useDashboard.js'
import { useAuth } from '../composables/useAuth.js'
import { usePlan } from '../composables/usePlan.js'

const router = useRouter()
const { user } = useAuth()
const { overview, getOverview } = useDashboard()
const { getCurrentPlan, getCurrentUsage, currentPlan, usage, usagePercentages, isNearLimit, isOverLimit, planDetails } = usePlan()

const dashboardData = ref(null)
const dataLoading = ref(true)

const profileOverview = computed(() => dashboardData.value?.profile || {})
const recentExecutions = computed(() => dashboardData.value?.recentExecutions || [])
const schedules = computed(() => dashboardData.value?.activeSchedules || [])

const statsCards = computed(() => {
  const stats = dashboardData.value?.stats
  if (!stats) return []

  // Get plan limits
  const flowsLimit = planDetails.value?.limits?.flows
  const executionsLimit = planDetails.value?.limits?.executions

  return [
    {
      title: 'Total de Fluxos',
      value: flowsLimit ? `${usage.value?.activeFlows || stats.totalFlows || 0} / ${flowsLimit}` : (stats.totalFlows || 0),
      change: 0,
      subtitle: flowsLimit ? `Limite do plano ${planDetails.value?.name || ''}` : 'Fluxos criados no seu workspace',
      icon: 'lucide:workflow',
      color: 'blue',
      actionText: 'Criar novo fluxo'
    },
    {
      title: 'Fluxos Compartilhados',
      value: stats.sharedFlows || 0,
      change: 0,
      subtitle: 'Publicados na biblioteca',
      icon: 'lucide:share-2',
      color: 'purple'
    },
    {
      title: 'Agendamentos Ativos',
      value: stats.activeSchedules || 0,
      change: 0,
      subtitle: 'Fluxos automatizados',
      icon: 'lucide:calendar-clock',
      color: 'indigo'
    },
    {
      title: 'Total de Execuções',
      value: executionsLimit ? `${usage.value?.executions || 0} / ${executionsLimit}` : (stats.totalExecutions || 0),
      change: 0,
      subtitle: executionsLimit ? `Execuções mensais (${planDetails.value?.name || ''})` : 'Execuções de todos os tempos',
      icon: 'lucide:activity',
      color: 'green'
    }
  ]
})

onMounted(async () => {
  if (overview.value) {
    dashboardData.value = overview.value
    dataLoading.value = false
  } else {
    await loadData()
  }
  
  // Load plan data
  await Promise.all([
    getCurrentPlan(),
    getCurrentUsage()
  ])
})

async function loadData(force = false) {
  try {
    dataLoading.value = true
    const result = await getOverview(force)

    if (result.success) {
      dashboardData.value = result.data
    }
  } catch (error) {
  } finally {
    dataLoading.value = false
  }
}

function createFlow() {
  router.push('/flows/create')
}

function formatRelativeTime(date) {
  if (!date) return 'Never'

  const now = new Date()
  const then = new Date(date)
  const diffMs = now - then
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 30) return `${diffDays} days ago`

  return then.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function formatAccountDate(date) {
  if (!date) return 'Unknown'

  const then = new Date(date)
  return then.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}




function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function formatDateShort(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

</script>

<template>
  <AppLayout>
    <!-- Page header -->
    <div class="mb-8">
      <h1 class="text-3xl font-semibold text-gray-800 tracking-wide">
        Painel
      </h1>
      <p class="text-gray-600 mt-2 text-sm tracking-wide">
        Bem-vindo de volta, <span class="font-medium text-gray-800">{{ user?.name || 'Usuário' }}</span>! Aqui está sua visão geral do LyntFlow.
      </p>
    </div>

    <!-- Stats cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatsCard
        v-for="card in statsCards"
        :key="card.title"
        v-bind="card"
        @action-click="card.actionText === 'Criar novo fluxo' ? createFlow() : null"
      />
    </div>

    <!-- Recent Executions & Schedules -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Recent Executions -->
      <div class="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/40 shadow-sm p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-800">Execuções Recentes</h2>
          <button
            @click="router.push('/executions')"
            class="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center"
          >
            Ver todas
            <Icon icon="lucide:arrow-right" class="ml-1 w-4 h-4" />
          </button>
        </div>
        <div v-if="recentExecutions.length > 0" class="space-y-3">
          <div
            v-for="execution in recentExecutions"
            :key="execution.id || execution._id"
            @click="router.push(`/executions/${execution.id || execution._id}`)"
            class="flex items-center justify-between p-3 bg-white/40 backdrop-blur-sm rounded-xl border border-white/30 hover:bg-white/50 cursor-pointer transition-colors"
          >
            <div class="flex items-center space-x-3 flex-1 min-w-0">
              <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-sm">
                <Icon icon="lucide:play-circle" class="w-5 h-5 text-white" />
              </div>
              <div class="min-w-0 flex-1">
                <div class="text-sm font-medium text-gray-900 truncate">
                  {{ execution.flowName || 'Fluxo Desconhecido' }}
                </div>
                <div class="text-xs text-gray-600">
                  {{ formatDateShort(execution.startedAt) }}
                </div>
              </div>
            </div>
            <ExecutionStatusBadge :status="execution.status" />
          </div>
        </div>
        <div v-else class="text-center py-8 text-gray-500">
          <Icon icon="lucide:inbox" class="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p class="text-sm">Nenhuma execução recente</p>
        </div>
      </div>

      <!-- Active Schedules -->
      <div class="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/40 shadow-sm p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-800">Agendamentos Ativos</h2>
          <button
            @click="router.push('/schedules')"
            class="text-sm font-medium text-green-600 hover:text-green-700 transition-colors flex items-center"
          >
            Ver todos
            <Icon icon="lucide:arrow-right" class="ml-1 w-4 h-4" />
          </button>
        </div>
        <div v-if="schedules.length > 0" class="space-y-3">
          <div
            v-for="schedule in schedules.slice(0, 5)"
            :key="schedule.id || schedule._id"
            class="flex items-center justify-between p-3 bg-white/40 backdrop-blur-sm rounded-xl border border-white/30 hover:bg-white/50 transition-colors"
          >
            <div class="flex items-center space-x-3 flex-1 min-w-0">
              <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-sm">
                <Icon icon="lucide:clock" class="w-5 h-5 text-white" />
              </div>
              <div class="min-w-0 flex-1">
                <div class="text-sm font-medium text-gray-900 truncate">
                  {{ schedule.flowName || schedule.flowId?.name || 'Fluxo Desconhecido' }}
                </div>
                <div class="text-xs text-gray-600">
                  Próximo: {{ formatDateShort(schedule.nextExecutionAt) }}
                </div>
              </div>
            </div>
            <span class="text-xs px-2.5 py-1 bg-green-50 text-green-700 rounded-lg font-medium">
              {{ schedule.scheduleType }}
            </span>
          </div>
        </div>
        <div v-else class="text-center py-8 text-gray-500">
          <Icon icon="lucide:calendar-off" class="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p class="text-sm">Nenhum agendamento ativo</p>
          <button
            @click="router.push('/schedules')"
            class="mt-3 inline-flex items-center text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
          >
            Crie seu primeiro agendamento
            <Icon icon="lucide:arrow-right" class="ml-1 w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

  </AppLayout>
</template>
