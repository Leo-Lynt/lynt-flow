<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import AppLayout from '../components/AppLayout.vue'
import ScheduleStatusBadge from '../components/ScheduleStatusBadge.vue'
import ScheduleWizard from '../components/ScheduleWizard.vue'
import { useSchedules } from '../composables/useSchedules.js'
import { useFlows } from '../composables/useFlows.js'

const router = useRouter()
const { schedules, loading, getSchedules, deleteSchedule, enableSchedule, disableSchedule } = useSchedules()
const flowsComposable = useFlows()
const { getFlowInputs, getFlowOptions, flowOptions } = flowsComposable

const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const scheduleToDelete = ref(null)
const availableFlows = ref([])
const selectedFlowFilter = ref('')
const flowInputs = ref([])
const loadingInputs = ref(false)
const currentPage = ref(1)
const itemsPerPage = ref(4)

onMounted(async () => {
  await loadSchedules()
  await loadFlows()
  calculateItemsPerPage()
  window.addEventListener('resize', calculateItemsPerPage)
})

onUnmounted(() => {
  window.removeEventListener('resize', calculateItemsPerPage)
})

function calculateItemsPerPage() {
  // Altura da viewport
  const viewportHeight = window.innerHeight

  // Altura estimada ocupada por header (56px) + título/botão (100px) + filtro (80px) + paginação (60px) + margens (80px)
  const fixedElementsHeight = 56 + 100 + 80 + 60 + 80

  // Altura disponível para os cards
  const availableHeight = viewportHeight - fixedElementsHeight

  // Altura estimada de cada card de schedule (aproximadamente 280px com spacing)
  const cardHeight = 280

  // Calcular quantos cards cabem (mínimo 2, máximo 6)
  const itemsFit = Math.floor(availableHeight / cardHeight)
  itemsPerPage.value = Math.max(2, Math.min(6, itemsFit))
}

async function loadSchedules() {
  const params = {}
  if (selectedFlowFilter.value) {
    params.flowId = selectedFlowFilter.value
  }
  await getSchedules(params)
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

// Handle flow selection from wizard
async function handleFlowSelected(flowId) {
  loadingInputs.value = true
  const result = await getFlowInputs(flowId)
  loadingInputs.value = false

  if (result.success) {
    flowInputs.value = result.data.data?.inputs || []
  } else {
    flowInputs.value = []
  }
}

async function handleCreateSchedule(scheduleData) {
  const { createSchedule } = useSchedules()
  const result = await createSchedule(scheduleData)

  if (result.success) {
    showCreateModal.value = false
    await loadSchedules()
  }
}

async function handleToggleEnabled(schedule) {
  if (schedule.enabled) {
    await disableSchedule(schedule._id)
  } else {
    await enableSchedule(schedule._id)
  }
  await loadSchedules()
}

function confirmDelete(schedule) {
  scheduleToDelete.value = schedule
  showDeleteModal.value = true
}

async function handleDelete() {
  if (!scheduleToDelete.value) return

  const result = await deleteSchedule(scheduleToDelete.value._id)
  if (result.success) {
    showDeleteModal.value = false
    scheduleToDelete.value = null
    await loadSchedules()
  }
}

function viewScheduleExecutions(schedule) {
  router.push(`/executions?scheduleId=${schedule._id}`)
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

function getScheduleDescription(schedule) {
  switch (schedule.scheduleType) {
    case 'interval':
      return `Every ${schedule.intervalValue} ${schedule.intervalUnit}`

    case 'daily':
      return `Daily at ${schedule.time} (${schedule.timezone})`

    case 'weekly':
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const dayLabels = schedule.daysOfWeek.map(d => days[d]).join(', ')
      return `${dayLabels} at ${schedule.time} (${schedule.timezone})`

    case 'monthly':
      return `Monthly on day ${schedule.dayOfMonth} at ${schedule.time} (${schedule.timezone})`

    case 'cron':
      return `Cron: ${schedule.cronExpression} (${schedule.timezone})`

    default:
      return 'Unknown schedule type'
  }
}

function getTimeUntilNext(nextExecutionAt) {
  if (!nextExecutionAt) return null

  const now = new Date()
  const next = new Date(nextExecutionAt)
  const diff = next - now

  if (diff < 0) return 'Overdue'

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (hours > 24) {
    const days = Math.floor(hours / 24)
    return `in ${days} day${days > 1 ? 's' : ''}`
  } else if (hours > 0) {
    return `in ${hours}h ${minutes}m`
  } else {
    return `in ${minutes}m`
  }
}

const allFilteredSchedules = computed(() => {
  let filtered = schedules.value
  if (selectedFlowFilter.value) {
    filtered = filtered.filter(s => s.flowId._id === selectedFlowFilter.value)
  }
  return filtered
})

const filteredSchedules = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return allFilteredSchedules.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(allFilteredSchedules.value.length / itemsPerPage.value)
})

const hasSchedules = computed(() => schedules.value.length > 0)

const totalSchedulesCount = computed(() => {
  return allFilteredSchedules.value.length
})

function goToPage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

// Reset page when filter changes
watch(selectedFlowFilter, () => {
  currentPage.value = 1
})
</script>

<template>
  <AppLayout>
    <!-- Page Header -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-semibold text-gray-800 tracking-wide">Agendamentos</h1>
          <p class="text-gray-600 mt-2 text-sm tracking-wide">Automatize seus fluxos com execuções agendadas</p>
        </div>
        <button
          @click="showCreateModal = true"
          class="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-5 py-2.5 rounded-lg flex items-center space-x-2 transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 text-sm font-medium tracking-wide"
        >
          <Icon icon="lucide:plus" class="w-4 h-4" />
          <span>Criar Agendamento</span>
        </button>
      </div>
    </div>

    <!-- Filter -->
    <div class="mb-6">
      <div class="max-w-md">
        <label class="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wider">Filtrar por Fluxo</label>
        <select
          v-model="selectedFlowFilter"
          @change="loadSchedules"
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
    </div>

    <!-- Schedules List -->
    <div v-if="loading" class="flex justify-center py-12">
      <Icon icon="lucide:loader-2" class="w-8 h-8 animate-spin text-blue-600" />
    </div>

    <div v-else-if="!hasSchedules" class="text-center py-12 glass-card backdrop-blur-xl bg-white/70 rounded-xl border border-white/40 shadow-sm">
      <Icon icon="lucide:clock" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-semibold text-gray-800 mb-2">Nenhum agendamento ainda</h3>
      <p class="text-gray-600 mb-6 text-sm tracking-wide">Crie seu primeiro agendamento para automatizar a execução de fluxos</p>
      <button
        @click="showCreateModal = true"
        class="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-5 py-2.5 rounded-lg transition-all inline-flex items-center space-x-2 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 text-sm font-medium tracking-wide"
      >
        <Icon icon="lucide:plus" class="w-4 h-4" />
        <span>Criar Primeiro Agendamento</span>
      </button>
    </div>

    <div v-else>
      <div class="space-y-4">
        <div
          v-for="schedule in filteredSchedules"
          :key="schedule._id"
          class="glass-card backdrop-blur-xl bg-white/70 rounded-xl border border-white/40 shadow-sm p-6 hover:shadow-xl hover:bg-white/80 transition-all"
        >
          <div class="flex items-start justify-between">
            <!-- Schedule Info -->
            <div class="flex-1">
              <div class="flex items-center space-x-3 mb-2">
                <h3 class="text-lg font-semibold text-gray-900">
                  {{ schedule.flowId?.name || 'Unknown Flow' }}
                </h3>
                <ScheduleStatusBadge
                  :enabled="schedule.enabled"
                  :is-currently-running="schedule.isCurrentlyRunning"
                  :paused-reason="schedule.pausedReason"
                />
              </div>

              <p class="text-sm text-gray-600 mb-3">{{ getScheduleDescription(schedule) }}</p>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                <!-- Next Execution -->
                <div class="flex items-center text-sm">
                  <Icon icon="lucide:calendar-clock" class="w-4 h-4 text-blue-600 mr-2" />
                  <div>
                    <div class="text-gray-600 text-xs">Próxima execução:</div>
                    <div class="font-medium text-gray-900">
                      {{ schedule.nextExecutionAt ? formatDate(schedule.nextExecutionAt) : 'N/A' }}
                    </div>
                    <div v-if="schedule.enabled && schedule.nextExecutionAt" class="text-xs text-blue-600">
                      {{ getTimeUntilNext(schedule.nextExecutionAt) }}
                    </div>
                  </div>
                </div>

                <!-- Execution Stats -->
                <div class="flex items-center text-sm">
                  <Icon icon="lucide:activity" class="w-4 h-4 text-green-600 mr-2" />
                  <div>
                    <div class="text-gray-600 text-xs">Total de execuções:</div>
                    <div class="font-medium text-gray-900">{{ schedule.executionCount || 0 }}</div>
                    <div
                      v-if="schedule.lastExecutionStatus"
                      :class="[
                        'text-xs',
                        schedule.lastExecutionStatus === 'success' ? 'text-green-600' : 'text-red-600'
                      ]"
                    >
                      Última: {{ schedule.lastExecutionStatus === 'success' ? 'sucesso' : 'falhou' }}
                    </div>
                  </div>
                </div>

                <!-- Failures -->
                <div v-if="schedule.consecutiveFailures > 0" class="flex items-center text-sm">
                  <Icon icon="lucide:alert-triangle" class="w-4 h-4 text-red-600 mr-2" />
                  <div>
                    <div class="text-gray-600 text-xs">Falhas consecutivas:</div>
                    <div class="font-medium text-red-600">{{ schedule.consecutiveFailures }}</div>
                  </div>
                </div>
              </div>

              <!-- Paused Reason -->
              <div v-if="schedule.pausedReason" class="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 mb-3 backdrop-blur-sm">
                <div class="flex items-start">
                  <Icon icon="lucide:alert-circle" class="w-4 h-4 text-orange-600 mr-2 mt-0.5" />
                  <div class="text-sm text-orange-600">
                    <strong>Pausado:</strong> {{ schedule.pausedReason }}
                  </div>
                </div>
              </div>

              <!-- Metadata -->
              <div class="flex items-center space-x-4 text-xs text-gray-600 tracking-wide">
                <span>Criado {{ formatDate(schedule.createdAt) }}</span>
                <span v-if="schedule.maxExecutions">
                  Máx execuções: {{ schedule.maxExecutions }}
                </span>
                <span v-if="schedule.expiresAt">
                  Expira: {{ formatDate(schedule.expiresAt) }}
                </span>
              </div>
            </div>

          <!-- Actions -->
          <div class="flex items-center space-x-2 ml-4">
            <button
              @click="handleToggleEnabled(schedule)"
              :title="schedule.enabled ? 'Desabilitar' : 'Habilitar'"
              :class="[
                'p-2 rounded-lg transition-all',
                schedule.enabled
                  ? 'text-orange-600 hover:bg-orange-50'
                  : 'text-green-600 hover:bg-green-50'
              ]"
            >
              <Icon
                :icon="schedule.enabled ? 'lucide:pause-circle' : 'lucide:play-circle'"
                class="w-5 h-5"
              />
            </button>
            <button
              @click="viewScheduleExecutions(schedule)"
              title="Ver Execuções"
              class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            >
              <Icon icon="lucide:history" class="w-5 h-5" />
            </button>
            <button
              @click="confirmDelete(schedule)"
              title="Excluir"
              class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
            >
              <Icon icon="lucide:trash-2" class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="mt-6 flex items-center justify-between glass-card backdrop-blur-xl bg-white/70 rounded-xl border border-white/40 shadow-sm p-4">
        <div class="text-sm text-gray-700 tracking-wide">
          Mostrando {{ (currentPage - 1) * itemsPerPage + 1 }}-{{ Math.min(currentPage * itemsPerPage, totalSchedulesCount) }} de {{ totalSchedulesCount }}
        </div>
        <div class="flex items-center space-x-2">
          <button
            @click="prevPage"
            :disabled="currentPage === 1"
            :class="[
              'px-3 py-2 rounded-lg transition-all text-sm font-medium tracking-wide',
              currentPage === 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-blue-600 hover:bg-blue-50'
            ]"
          >
            <Icon icon="lucide:chevron-left" class="w-4 h-4" />
          </button>

          <div class="flex items-center space-x-1">
            <button
              v-for="page in totalPages"
              :key="page"
              @click="goToPage(page)"
              :class="[
                'px-3 py-1.5 rounded-lg text-sm font-medium tracking-wide transition-all',
                page === currentPage
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30'
                  : 'text-gray-700 hover:bg-white/60'
              ]"
            >
              {{ page }}
            </button>
          </div>

          <button
            @click="nextPage"
            :disabled="currentPage === totalPages"
            :class="[
              'px-3 py-2 rounded-lg transition-all text-sm font-medium tracking-wide',
              currentPage === totalPages
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-blue-600 hover:bg-blue-50'
            ]"
          >
            <Icon icon="lucide:chevron-right" class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Create Schedule Modal -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click="showCreateModal = false"
    >
      <div
        class="glass-card backdrop-blur-xl bg-white/90 rounded-xl border border-white/40 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <div class="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-6 py-4 flex items-center justify-between">
          <h2 class="text-xl font-semibold text-gray-900 tracking-wide">Criar Agendamento</h2>
          <button
            @click="showCreateModal = false"
            class="text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 p-1.5 rounded-lg transition-all"
          >
            <Icon icon="lucide:x" class="w-6 h-6" />
          </button>
        </div>

        <div class="p-6">
          <ScheduleWizard
            :available-flows="availableFlows"
            :flow-inputs="flowInputs"
            @flow-selected="handleFlowSelected"
            @submit="handleCreateSchedule"
            @cancel="showCreateModal = false"
          />
        </div>
      </div>
    </div>

    <!-- Delete Modal -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50"
      @click="showDeleteModal = false"
    >
      <div class="glass-card backdrop-blur-xl bg-white/70 rounded-lg border border-white/40 shadow-xl p-6 max-w-sm w-full mx-4" @click.stop>
        <div class="flex items-center mb-4">
          <Icon icon="lucide:alert-triangle" class="w-6 h-6 text-red-600 mr-3" />
          <h3 class="text-lg font-semibold text-gray-900 tracking-wide">Excluir Agendamento</h3>
        </div>
        <p class="text-gray-700 mb-6 text-sm tracking-wide">
          Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita.
        </p>
        <div class="flex space-x-3">
          <button
            @click="showDeleteModal = false"
            class="flex-1 px-4 py-2.5 bg-white/70 backdrop-blur-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-white/90 hover:brightness-95 transition-all text-sm font-medium tracking-wide"
          >
            Cancelar
          </button>
          <button
            @click="handleDelete"
            class="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-sm font-medium tracking-wide shadow-lg shadow-red-500/30"
          >
            Excluir
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
