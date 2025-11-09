<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import AppLayout from '../components/AppLayout.vue'
import ExecutionStatusBadge from '../components/ExecutionStatusBadge.vue'
import { useFlows } from '../composables/useFlows.js'

const router = useRouter()
const flowsComposable = useFlows()
const { getExecutions, loading, getFlowOptions, flowOptions } = flowsComposable

const executions = ref([])
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  pages: 0
})

const filters = ref({
  flowId: '',
  status: '',
  startDate: '',
  endDate: ''
})

const availableFlows = ref([])

onMounted(async () => {
  await loadExecutions()
  await loadFlows()
})

async function loadExecutions() {
  const params = {
    page: pagination.value.page,
    limit: pagination.value.limit,
    ...filters.value
  }

  // Remove empty filters
  Object.keys(params).forEach(key => {
    if (params[key] === '' || params[key] === null) {
      delete params[key]
    }
  })

  const result = await getExecutions(params)
  if (result.success) {
    executions.value = result.data || []
    if (result.pagination) {
      pagination.value = result.pagination
    }
  }
}

async function loadFlows() {
  try {
    const result = await getFlowOptions()
    if (result.success) {
      availableFlows.value = result.data.flows || flowOptions.value || []
    } else if (flowOptions.value) {
      availableFlows.value = flowOptions.value
    }
  } catch (error) {
    if (flowOptions.value) {
      availableFlows.value = flowOptions.value
    }
  }
}

function applyFilters() {
  pagination.value.page = 1
  loadExecutions()
}

function clearFilters() {
  filters.value = {
    flowId: '',
    status: '',
    startDate: '',
    endDate: ''
  }
  pagination.value.page = 1
  loadExecutions()
}

function changePage(newPage) {
  pagination.value.page = newPage
  loadExecutions()
}

function viewExecution(execution) {
  router.push(`/executions/${execution._id}`)
}

function viewFlow(flowId) {
  router.push(`/flows/${flowId}`)
}

function formatDate(date) {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatDuration(ms) {
  if (!ms) return '-'
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  } else {
    return `${seconds}s`
  }
}

function getTriggeredByLabel(triggeredBy) {
  const labels = {
    manual: 'Manual',
    api: 'API',
    schedule: 'Agendado'
  }
  return labels[triggeredBy] || triggeredBy
}

function getTriggeredByColor(triggeredBy) {
  const colors = {
    manual: 'bg-cyan-500/20 text-cyan-700 border-cyan-500/30',
    api: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
    schedule: 'bg-orange-500/20 text-orange-700 border-orange-500/30'
  }
  return colors[triggeredBy] || 'bg-gray-100/50 text-gray-700 border-gray-300'
}

const hasActiveFilters = computed(() => {
  return filters.value.flowId || filters.value.status || filters.value.startDate || filters.value.endDate
})
</script>

<template>
  <AppLayout>
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-semibold text-gray-800 tracking-wide">Histórico de Execuções</h1>
      <p class="text-gray-600 mt-2 text-sm tracking-wide">Visualize e analise o histórico de execução dos seus fluxos</p>
    </div>

    <!-- Filters -->
    <div class="glass-card backdrop-blur-xl bg-white/70 rounded-xl border border-white/40 shadow-sm p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Flow Filter -->
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wider">Fluxo</label>
          <select
            v-model="filters.flowId"
            class="w-full px-3 py-2.5 bg-white/50 backdrop-blur-sm border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white/70 transition-all text-sm"
          >
            <option value="">Todos os Fluxos</option>
            <option
              v-for="flow in availableFlows"
              :key="flow.id || flow._id"
              :value="flow.id || flow._id"
            >
              {{ flow.name }}
            </option>
          </select>
        </div>

        <!-- Status Filter -->
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wider">Status</label>
          <select
            v-model="filters.status"
            class="w-full px-3 py-2.5 bg-white/50 backdrop-blur-sm border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white/70 transition-all text-sm"
          >
            <option value="">Todos os Status</option>
            <option value="success">Sucesso</option>
            <option value="failed">Falhou</option>
            <option value="running">Executando</option>
          </select>
        </div>

        <!-- Start Date Filter -->
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wider">Data Inicial</label>
          <input
            v-model="filters.startDate"
            type="date"
            class="w-full px-3 py-2.5 bg-white/50 backdrop-blur-sm border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white/70 transition-all text-sm"
          />
        </div>

        <!-- End Date Filter -->
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wider">Data Final</label>
          <input
            v-model="filters.endDate"
            type="date"
            class="w-full px-3 py-2.5 bg-white/50 backdrop-blur-sm border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white/70 transition-all text-sm"
          />
        </div>
      </div>

      <!-- Filter Actions -->
      <div class="flex items-center space-x-3 mt-4">
        <button
          @click="applyFilters"
          class="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-4 py-2.5 rounded-lg flex items-center space-x-2 transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 text-sm font-medium tracking-wide"
        >
          <Icon icon="lucide:filter" class="w-4 h-4" />
          <span>Aplicar Filtros</span>
        </button>
        <button
          v-if="hasActiveFilters"
          @click="clearFilters"
          class="bg-white/70 backdrop-blur-sm border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-white/90 hover:brightness-95 transition-all flex items-center space-x-2 text-sm font-medium tracking-wide"
        >
          <Icon icon="lucide:x" class="w-4 h-4" />
          <span>Limpar</span>
        </button>
      </div>
    </div>

    <!-- Executions Table -->
    <div class="glass-card backdrop-blur-xl bg-white/70 rounded-xl border border-white/40 shadow-sm overflow-hidden">
      <div v-if="loading" class="flex justify-center py-12">
        <Icon icon="lucide:loader-2" class="w-8 h-8 animate-spin text-blue-600" />
      </div>

      <div v-else-if="executions.length === 0" class="text-center py-12">
        <Icon icon="lucide:inbox" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-800 mb-2">Nenhuma execução encontrada</h3>
        <p class="text-gray-600 text-sm tracking-wide">
          {{ hasActiveFilters ? 'Tente ajustar seus filtros' : 'Execute um fluxo para ver resultados aqui' }}
        </p>
      </div>

      <div v-else class="p-4">
        <table class="w-full border-separate border-spacing-y-2 table-fixed">
          <thead>
            <tr>
              <th class="w-[25%] px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Fluxo</th>
              <th class="w-[12%] px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
              <th class="w-[13%] px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider hidden md:table-cell">Origem</th>
              <th class="w-[18%] px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider hidden lg:table-cell">Iniciado</th>
              <th class="w-[12%] px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider hidden xl:table-cell">Duração</th>
              <th class="w-[10%] px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider hidden xl:table-cell">Nós</th>
              <th class="w-[10%] px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="execution in executions"
              :key="execution._id"
              class="bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 hover:shadow-md cursor-pointer transition-all rounded-lg"
              @click="viewExecution(execution)"
            >
              <td class="px-4 py-4 rounded-l-lg">
                <div class="flex items-center min-w-0">
                  <Icon icon="lucide:workflow" class="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                  <div class="min-w-0">
                    <div class="text-sm font-medium text-gray-900 truncate">
                      {{ execution.flowName || 'Fluxo sem nome' }}
                    </div>
                    <div v-if="execution.flowDeleted" class="text-xs text-red-600">
                      Excluído
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-4 py-4">
                <ExecutionStatusBadge :status="execution.status" />
              </td>
              <td class="px-4 py-4 hidden md:table-cell">
                <span
                  :class="getTriggeredByColor(execution.triggeredBy)"
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border backdrop-blur-sm"
                >
                  {{ getTriggeredByLabel(execution.triggeredBy) }}
                </span>
              </td>
              <td class="px-4 py-4 text-sm text-gray-700 hidden lg:table-cell">
                <div class="truncate">{{ formatDate(execution.startedAt) }}</div>
              </td>
              <td class="px-4 py-4 text-sm text-gray-700 hidden xl:table-cell">
                {{ formatDuration(execution.executionTime) }}
              </td>
              <td class="px-4 py-4 text-sm text-gray-700 hidden xl:table-cell">
                {{ execution.nodesExecuted || 0 }}/{{ execution.flowSnapshot?.totalNodes || 0 }}
              </td>
              <td class="px-4 py-4 text-right text-sm font-medium rounded-r-lg">
                <button
                  @click.stop="viewExecution(execution)"
                  class="text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <span class="hidden sm:inline">Ver Detalhes</span>
                  <Icon icon="lucide:eye" class="w-4 h-4 inline sm:hidden" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.pages > 1" class="px-6 py-4 border-t border-gray-200/30 bg-white/10 backdrop-blur-sm">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-700 tracking-wide">
            Mostrando {{ (pagination.page - 1) * pagination.limit + 1 }} a
            {{ Math.min(pagination.page * pagination.limit, pagination.total) }} de {{ pagination.total }} resultados
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click="changePage(pagination.page - 1)"
              :disabled="pagination.page === 1"
              class="px-3 py-2 bg-white/70 backdrop-blur-sm border border-gray-300 rounded-lg hover:bg-white/90 hover:brightness-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium text-gray-700"
            >
              Anterior
            </button>
            <span class="text-sm text-gray-700 tracking-wide">
              Página {{ pagination.page }} de {{ pagination.pages }}
            </span>
            <button
              @click="changePage(pagination.page + 1)"
              :disabled="pagination.page === pagination.pages"
              class="px-3 py-2 bg-white/70 backdrop-blur-sm border border-gray-300 rounded-lg hover:bg-white/90 hover:brightness-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium text-gray-700"
            >
              Próximo
            </button>
          </div>
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
