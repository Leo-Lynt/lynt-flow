<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import AppLayout from '../components/AppLayout.vue'
import StatsCard from '../components/StatsCard.vue'
import ExecutionStatusBadge from '../components/ExecutionStatusBadge.vue'
import { useDashboard } from '../composables/useDashboard.js'
import { useAuth } from '../composables/useAuth.js'

const router = useRouter()
const { user } = useAuth()
const { overview, getOverview } = useDashboard()

const dashboardData = ref(null)
const dataLoading = ref(true)

const profileOverview = computed(() => dashboardData.value?.profile || {})
const recentExecutions = computed(() => dashboardData.value?.recentExecutions || [])
const schedules = computed(() => dashboardData.value?.activeSchedules || [])

const statsCards = computed(() => {
  const stats = dashboardData.value?.stats
  if (!stats) return []

  return [
    {
      title: 'Total de Fluxos',
      value: stats.totalFlows || 0,
      change: 0,
      subtitle: 'Fluxos criados no seu workspace',
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
      value: stats.totalExecutions || 0,
      change: 0,
      subtitle: 'Execuções de todos os tempos',
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
      <div>
        <h1 class="text-3xl font-semibold text-gray-800 tracking-wide">Painel</h1>
        <p class="text-gray-600 mt-2 text-sm tracking-wide">Bem-vindo de volta, {{ user?.name || 'Usuário' }}! Aqui está sua visão geral do LyntFlow.</p>
      </div>
    </div>

    <!-- Workspace Overview -->
    <div v-if="dataLoading" class="glass-card backdrop-blur-xl bg-white/30 rounded-lg border border-white/20 p-6 mb-8">
      <div class="flex justify-center items-center h-32">
        <Icon icon="lucide:loader-2" class="w-8 h-8 text-brand-purple animate-spin" />
      </div>
    </div>

    <div v-else-if="dashboardData" class="glass-card backdrop-blur-xl bg-white/30 rounded-lg border border-white/20 p-6 mb-8">
      <h2 class="text-lg font-semibold text-gray-800 mb-4 tracking-wide">Visão Geral do Workspace</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="text-center p-4 bg-white/40 backdrop-blur-sm rounded border border-white/30">
          <Icon icon="lucide:calendar" class="w-6 h-6 text-brand-purple mx-auto mb-2" />
          <p class="text-xs text-gray-600 uppercase tracking-wider">Conta Criada</p>
          <p class="font-semibold text-gray-900 mt-1">{{ formatAccountDate(profileOverview.accountCreated) }}</p>
        </div>
        <div class="text-center p-4 bg-white/40 backdrop-blur-sm rounded border border-white/30">
          <Icon icon="lucide:clock" class="w-6 h-6 text-brand-green mx-auto mb-2" />
          <p class="text-xs text-gray-600 uppercase tracking-wider">Último Login</p>
          <p class="font-semibold text-gray-900 mt-1">{{ formatRelativeTime(profileOverview.lastLoginAt) }}</p>
        </div>
        <div class="text-center p-4 bg-white/40 backdrop-blur-sm rounded border border-white/30">
          <Icon icon="lucide:users" class="w-6 h-6 text-brand-orange mx-auto mb-2" />
          <p class="text-xs text-gray-600 uppercase tracking-wider">Membros da Equipe</p>
          <p class="font-semibold text-gray-900 mt-1">{{ profileOverview.teamMembers || 1 }} (Você)</p>
        </div>
        <div class="text-center p-4 bg-white/40 backdrop-blur-sm rounded border border-white/30">
          <Icon icon="lucide:star" class="w-6 h-6 text-brand-pink mx-auto mb-2" />
          <p class="text-xs text-gray-600 uppercase tracking-wider">Plano</p>
          <p class="font-semibold text-gray-900 mt-1">{{ profileOverview.plan || 'Gratuito' }}</p>
        </div>
      </div>
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
      <div class="glass-card backdrop-blur-xl bg-white/30 rounded-lg border border-white/20 p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-800 tracking-wide">Execuções Recentes</h2>
          <button
            @click="router.push('/executions')"
            class="text-sm text-brand-purple hover:text-brand-purple/80 transition-colors"
          >
            Ver todas →
          </button>
        </div>
        <div v-if="recentExecutions.length > 0" class="space-y-3">
          <div
            v-for="execution in recentExecutions"
            :key="execution.id || execution._id"
            @click="router.push(`/executions/${execution.id || execution._id}`)"
            class="flex items-center justify-between p-3 bg-white/40 backdrop-blur-sm rounded border border-white/30 hover:bg-white/50 hover:brightness-95 cursor-pointer transition-all"
          >
            <div class="flex items-center space-x-3 flex-1 min-w-0">
              <Icon icon="lucide:play-circle" class="w-5 h-5 text-brand-purple flex-shrink-0" />
              <div class="min-w-0 flex-1">
                <div class="text-sm font-medium text-gray-900 truncate">
                  {{ execution.flowName || 'Fluxo Desconhecido' }}
                </div>
                <div class="text-xs text-gray-600 tracking-wide">
                  {{ formatDateShort(execution.startedAt) }}
                </div>
              </div>
            </div>
            <ExecutionStatusBadge :status="execution.status" />
          </div>
        </div>
        <div v-else class="text-center py-8 text-gray-500">
          <Icon icon="lucide:inbox" class="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p class="text-sm tracking-wide">Nenhuma execução recente</p>
        </div>
      </div>

      <!-- Active Schedules -->
      <div class="glass-card backdrop-blur-xl bg-white/30 rounded-lg border border-white/20 p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-800 tracking-wide">Agendamentos Ativos</h2>
          <button
            @click="router.push('/schedules')"
            class="text-sm text-brand-purple hover:text-brand-purple/80 transition-colors"
          >
            Ver todos →
          </button>
        </div>
        <div v-if="schedules.length > 0" class="space-y-3">
          <div
            v-for="schedule in schedules.slice(0, 5)"
            :key="schedule.id || schedule._id"
            class="flex items-center justify-between p-3 bg-white/40 backdrop-blur-sm rounded border border-white/30"
          >
            <div class="flex items-center space-x-3 flex-1 min-w-0">
              <Icon icon="lucide:clock" class="w-5 h-5 text-brand-green flex-shrink-0" />
              <div class="min-w-0 flex-1">
                <div class="text-sm font-medium text-gray-900 truncate">
                  {{ schedule.flowName || schedule.flowId?.name || 'Fluxo Desconhecido' }}
                </div>
                <div class="text-xs text-gray-600 tracking-wide">
                  Próximo: {{ formatDateShort(schedule.nextExecutionAt) }}
                </div>
              </div>
            </div>
            <span class="text-xs px-2 py-1 bg-brand-green/20 text-brand-green rounded">
              {{ schedule.scheduleType }}
            </span>
          </div>
        </div>
        <div v-else class="text-center py-8 text-gray-500">
          <Icon icon="lucide:calendar-off" class="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p class="text-sm tracking-wide">Nenhum agendamento ativo</p>
          <button
            @click="router.push('/schedules')"
            class="mt-3 text-sm text-brand-purple hover:text-brand-purple/80 transition-colors underline decoration-brand-purple/30 hover:decoration-brand-purple/60 underline-offset-2"
          >
            Crie seu primeiro agendamento
          </button>
        </div>
      </div>
    </div>

  </AppLayout>
</template>

<style scoped>
.glass-card {
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}
</style>
