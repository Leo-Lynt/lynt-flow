<script setup>
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import AppLayout from '../components/AppLayout.vue'
import { useAdmin } from '../composables/useAdmin.js'

const {
  listPendingFlows,
  listReports,
  listAllPublicFlows,
  approveFlow,
  rejectFlow,
  verifyFlow,
  unverifyFlow,
  quarantineFlow,
  resolveReport,
  getModerationStats,
  loading
} = useAdmin()

const activeTab = ref('pending') // 'pending' | 'reports' | 'allFlows'
const pendingFlows = ref([])
const reports = ref([])
const allFlows = ref([])
const stats = ref(null)
const currentPage = ref(1)
const totalPages = ref(1)

// Filtros para aba All Flows
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedVerified = ref('')
const selectedSort = ref('recent')

const showRejectModal = ref(false)
const selectedFlow = ref(null)
const rejectReason = ref('')

const showResolveModal = ref(false)
const selectedReport = ref(null)
const resolveAction = ref('no_action')
const resolveNotes = ref('')

const showQuarantineModal = ref(false)
const quarantineReason = ref('')

onMounted(async () => {
  await loadStats()
  await loadPendingFlows()
})

async function loadStats() {
  const result = await getModerationStats()
  if (result.success) {
    stats.value = result.data
  }
}

async function loadPendingFlows() {
  const result = await listPendingFlows(currentPage.value, 20)
  if (result.success) {
    pendingFlows.value = result.data.flows || []
    totalPages.value = result.data.pagination?.pages || 1
  }
}

async function loadReports() {
  const result = await listReports({
    status: 'pending',
    page: currentPage.value,
    limit: 20
  })
  if (result.success) {
    reports.value = result.data.reports || []
    totalPages.value = result.data.pagination?.pages || 1
  }
}

async function loadAllFlows() {
  const result = await listAllPublicFlows({
    search: searchQuery.value,
    category: selectedCategory.value,
    verified: selectedVerified.value,
    sortBy: selectedSort.value,
    page: currentPage.value,
    limit: 20
  })
  if (result.success) {
    allFlows.value = result.data.flows || []
    totalPages.value = result.data.pagination?.pages || 1
  }
}

async function handleApprove(flow) {
  if (!confirm(`Aprovar o flow "${flow.name}"?`)) return

  const result = await approveFlow(flow._id)
  if (result.success) {
    await loadPendingFlows()
    await loadStats()
  } else {
    alert('Erro: ' + result.error)
  }
}

function openRejectModal(flow) {
  selectedFlow.value = flow
  rejectReason.value = ''
  showRejectModal.value = true
}

async function handleReject() {
  if (!selectedFlow.value || !rejectReason.value.trim()) {
    alert('Por favor, informe o motivo da rejeição')
    return
  }

  const result = await rejectFlow(selectedFlow.value._id, rejectReason.value)
  if (result.success) {
    showRejectModal.value = false
    await loadPendingFlows()
    await loadStats()
  } else {
    alert('Erro: ' + result.error)
  }
}

async function handleVerify(flow) {
  if (!confirm(`Adicionar badge de verificado ao flow "${flow.name}"?`)) return

  const result = await verifyFlow(flow._id)
  if (result.success) {
    if (activeTab.value === 'pending') {
      await loadPendingFlows()
    } else if (activeTab.value === 'allFlows') {
      await loadAllFlows()
    }
  } else {
    alert('Erro: ' + result.error)
  }
}

async function handleUnverify(flow) {
  if (!confirm(`Remover badge de verificado do flow "${flow.name}"?`)) return

  const result = await unverifyFlow(flow._id)
  if (result.success) {
    await loadAllFlows()
  } else {
    alert('Erro: ' + result.error)
  }
}

function openQuarantineModal(flow) {
  selectedFlow.value = flow
  quarantineReason.value = ''
  showQuarantineModal.value = true
}

async function handleQuarantine() {
  if (!selectedFlow.value) return

  const result = await quarantineFlow(selectedFlow.value._id, quarantineReason.value)
  if (result.success) {
    showQuarantineModal.value = false
    await loadAllFlows()
    await loadStats()
  } else {
    alert('Erro: ' + result.error)
  }
}

function openResolveModal(report) {
  selectedReport.value = report
  resolveAction.value = 'no_action'
  resolveNotes.value = ''
  showResolveModal.value = true
}

async function handleResolveReport() {
  if (!selectedReport.value) return

  const result = await resolveReport(
    selectedReport.value._id,
    resolveAction.value,
    resolveNotes.value
  )

  if (result.success) {
    showResolveModal.value = false
    await loadReports()
    await loadStats()
  } else {
    alert('Erro: ' + result.error)
  }
}

async function switchTab(tab) {
  activeTab.value = tab
  currentPage.value = 1

  if (tab === 'pending') {
    await loadPendingFlows()
  } else if (tab === 'reports') {
    await loadReports()
  } else if (tab === 'allFlows') {
    await loadAllFlows()
  }
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getCategoryColor(category) {
  const colors = {
    'automation': 'bg-blue-100 text-blue-800',
    'data-processing': 'bg-green-100 text-green-800',
    'api-integration': 'bg-purple-100 text-purple-800',
    'notification': 'bg-yellow-100 text-yellow-800',
    'utility': 'bg-gray-100 text-gray-800'
  }
  return colors[category] || colors.utility
}

function getReportCategoryLabel(category) {
  const labels = {
    spam: 'Spam',
    malicious_code: 'Código Malicioso',
    inappropriate_content: 'Conteúdo Inapropriado',
    copyright_violation: 'Violação de Copyright',
    misleading: 'Enganoso',
    broken: 'Não Funciona',
    other: 'Outro'
  }
  return labels[category] || category
}
</script>

<template>
  <AppLayout>
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Moderação de Flows</h1>
        <p class="text-gray-600">Gerencie aprovações e reports de flows públicos</p>
      </div>

      <!-- Stats Cards -->
      <div v-if="stats" class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="glass-card backdrop-blur-xl bg-white/30 rounded-lg border border-white/20 p-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-600">Pendentes</span>
            <Icon icon="lucide:clock" class="w-5 h-5 text-yellow-400" />
          </div>
          <p class="text-3xl font-bold text-gray-900">{{ stats.pendingFlows || 0 }}</p>
        </div>

        <div class="glass-card backdrop-blur-xl bg-white/30 rounded-lg border border-white/20 p-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-600">Aprovados</span>
            <Icon icon="lucide:check-circle" class="w-5 h-5 text-green-400" />
          </div>
          <p class="text-3xl font-bold text-gray-900">{{ stats.approvedFlows || 0 }}</p>
        </div>

        <div class="glass-card backdrop-blur-xl bg-white/30 rounded-lg border border-white/20 p-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-600">Reports Pendentes</span>
            <Icon icon="lucide:flag" class="w-5 h-5 text-red-400" />
          </div>
          <p class="text-3xl font-bold text-gray-900">{{ stats.pendingReports || 0 }}</p>
        </div>

        <div class="glass-card backdrop-blur-xl bg-white/30 rounded-lg border border-white/20 p-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-600">Verificados</span>
            <Icon icon="lucide:shield-check" class="w-5 h-5 text-blue-400" />
          </div>
          <p class="text-3xl font-bold text-gray-900">{{ stats.verifiedFlows || 0 }}</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="mb-6 border-b border-gray-200">
        <nav class="-mb-px flex space-x-8">
          <button
            @click="switchTab('pending')"
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm',
              activeTab === 'pending'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            Flows Pendentes
          </button>
          <button
            @click="switchTab('reports')"
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm',
              activeTab === 'reports'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            Reports
          </button>
          <button
            @click="switchTab('allFlows')"
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm',
              activeTab === 'allFlows'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            All Flows
          </button>
        </nav>
      </div>

      <!-- Pending Flows Tab -->
      <div v-if="activeTab === 'pending'" class="space-y-4">
        <div v-if="loading" class="glass-card backdrop-blur-xl bg-white/30 rounded-lg border border-white/20 p-12 text-center">
          <Icon icon="lucide:loader-2" class="w-12 h-12 text-blue-600 animate-spin mx-auto" />
        </div>

        <div v-else-if="pendingFlows.length === 0" class="glass-card backdrop-blur-xl bg-white/30 rounded-lg border border-white/20 p-12 text-center">
          <Icon icon="lucide:check-circle" class="w-16 h-16 text-green-400 mx-auto mb-4" />
          <p class="text-gray-500">Nenhum flow pendente de aprovação</p>
        </div>

        <div
          v-else
          v-for="flow in pendingFlows"
          :key="flow._id"
          class="glass-card backdrop-blur-xl bg-white/30 rounded-lg border border-white/20 p-6 hover:border-blue-300 transition-colors"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <h3 class="text-lg font-semibold text-gray-900">{{ flow.name }}</h3>
                <span :class="['px-2 py-1 text-xs font-medium rounded-full', getCategoryColor(flow.category)]">
                  {{ flow.category }}
                </span>
                <span
                  v-if="flow.securityScan?.status === 'suspicious'"
                  class="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800"
                >
                  Suspeito
                </span>
              </div>
              <p class="text-gray-600 mb-3">{{ flow.description }}</p>

              <div class="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span class="flex items-center gap-1">
                  <Icon icon="lucide:user" class="w-4 h-4" />
                  {{ flow.publicMetadata?.author?.name || 'Unknown' }}
                </span>
                <span class="flex items-center gap-1">
                  <Icon icon="lucide:clock" class="w-4 h-4" />
                  {{ formatDate(flow.publicationData?.publishedAt) }}
                </span>
              </div>

              <!-- Security Warnings -->
              <div
                v-if="flow.securityScan?.warnings && flow.securityScan.warnings.length > 0"
                class="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
              >
                <p class="text-sm font-medium text-yellow-900 mb-2">⚠️ Avisos de Segurança:</p>
                <ul class="list-disc list-inside text-sm text-yellow-800 space-y-1">
                  <li v-for="warning in flow.securityScan.warnings" :key="warning">{{ warning }}</li>
                </ul>
              </div>
            </div>

            <div class="flex flex-col gap-2 ml-6">
              <button
                @click="handleApprove(flow)"
                class="px-4 py-2 bg-brand-green text-white rounded-lg hover:brightness-110 transition-all flex items-center gap-2 whitespace-nowrap"
              >
                <Icon icon="lucide:check" class="w-4 h-4" />
                Aprovar
              </button>
              <button
                @click="openRejectModal(flow)"
                class="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-2 whitespace-nowrap"
              >
                <Icon icon="lucide:x" class="w-4 h-4" />
                Rejeitar
              </button>
              <button
                @click="handleVerify(flow)"
                class="px-4 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 flex items-center gap-2 whitespace-nowrap"
              >
                <Icon icon="lucide:shield-check" class="w-4 h-4" />
                Verificar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- All Flows Tab -->
      <div v-if="activeTab === 'allFlows'" class="space-y-6">
        <!-- Filters -->
        <div class="glass-card backdrop-blur-xl bg-white/30 rounded-lg border border-white/20 p-4">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
              <input
                v-model="searchQuery"
                @input="loadAllFlows"
                type="text"
                placeholder="Nome, descrição ou autor..."
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <select
                v-model="selectedCategory"
                @change="loadAllFlows"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent"
              >
                <option value="">Todas</option>
                <option value="automation">Automação</option>
                <option value="data-processing">Processamento de Dados</option>
                <option value="api-integration">Integração de API</option>
                <option value="notification">Notificação</option>
                <option value="utility">Utilitário</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Verificado</label>
              <select
                v-model="selectedVerified"
                @change="loadAllFlows"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent"
              >
                <option value="">Todos</option>
                <option value="true">Verificados</option>
                <option value="false">Não Verificados</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
              <select
                v-model="selectedSort"
                @change="loadAllFlows"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent"
              >
                <option value="recent">Mais Recentes</option>
                <option value="popular">Mais Populares</option>
                <option value="rating">Melhor Avaliados</option>
                <option value="verified">Verificados</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Flows Grid -->
        <div v-if="loading" class="glass-card backdrop-blur-xl bg-white/30 rounded-lg border border-white/20 p-12 text-center">
          <Icon icon="lucide:loader-2" class="w-12 h-12 text-blue-600 animate-spin mx-auto" />
        </div>

        <div v-else-if="allFlows.length === 0" class="glass-card backdrop-blur-xl bg-white/30 rounded-lg border border-white/20 p-12 text-center">
          <Icon icon="lucide:search" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p class="text-gray-500">Nenhum flow encontrado</p>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="flow in allFlows"
            :key="flow._id"
            class="glass-card backdrop-blur-xl bg-white/30 rounded-lg border border-white/20 p-6 hover:border-blue-300 transition-colors"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h3 class="text-lg font-semibold text-gray-900">{{ flow.name }}</h3>
                  <span :class="['px-2 py-1 text-xs font-medium rounded-full', getCategoryColor(flow.category)]">
                    {{ flow.category }}
                  </span>
                  <span
                    v-if="flow.publicationData?.isVerified"
                    class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 flex items-center gap-1"
                  >
                    <Icon icon="lucide:shield-check" class="w-3 h-3" />
                    Verificado
                  </span>
                </div>

                <p class="text-gray-600 mb-3">{{ flow.description }}</p>

                <div class="flex items-center gap-4 text-sm text-gray-500">
                  <span class="flex items-center gap-1">
                    <Icon icon="lucide:user" class="w-4 h-4" />
                    {{ flow.publicMetadata?.author?.name || 'Unknown' }}
                  </span>
                  <span class="flex items-center gap-1">
                    <Icon icon="lucide:download" class="w-4 h-4" />
                    {{ flow.publicStats?.imports || 0 }} importações
                  </span>
                  <span class="flex items-center gap-1">
                    <Icon icon="lucide:star" class="w-4 h-4" />
                    {{ flow.publicStats?.averageRating?.toFixed(1) || '0.0' }}
                  </span>
                  <span class="flex items-center gap-1">
                    <Icon icon="lucide:clock" class="w-4 h-4" />
                    {{ formatDate(flow.publicationData?.publishedAt) }}
                  </span>
                </div>
              </div>

              <div class="flex flex-col gap-2 ml-6">
                <button
                  v-if="!flow.publicationData?.isVerified"
                  @click="handleVerify(flow)"
                  class="px-4 py-2 bg-brand-purple text-white rounded-lg hover:brightness-110 transition-all flex items-center gap-2 whitespace-nowrap"
                >
                  <Icon icon="lucide:shield-check" class="w-4 h-4" />
                  Verificar
                </button>
                <button
                  v-else
                  @click="handleUnverify(flow)"
                  class="px-4 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 flex items-center gap-2 whitespace-nowrap"
                >
                  <Icon icon="lucide:shield-off" class="w-4 h-4" />
                  Remover Verificação
                </button>
                <button
                  @click="openQuarantineModal(flow)"
                  class="px-4 py-2 border border-orange-300 text-orange-600 rounded-lg hover:bg-orange-50 flex items-center gap-2 whitespace-nowrap"
                >
                  <Icon icon="lucide:alert-triangle" class="w-4 h-4" />
                  Quarentena
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Reports Tab -->
      <div v-if="activeTab === 'reports'" class="space-y-4">
        <div v-if="loading" class="glass-card backdrop-blur-xl bg-white/30 rounded-lg border border-white/20 p-12 text-center">
          <Icon icon="lucide:loader-2" class="w-12 h-12 text-blue-600 animate-spin mx-auto" />
        </div>

        <div v-else-if="reports.length === 0" class="glass-card backdrop-blur-xl bg-white/30 rounded-lg border border-white/20 p-12 text-center">
          <Icon icon="lucide:shield-check" class="w-16 h-16 text-green-400 mx-auto mb-4" />
          <p class="text-gray-500">Nenhum report pendente</p>
        </div>

        <div
          v-else
          v-for="report in reports"
          :key="report._id"
          class="glass-card backdrop-blur-xl bg-white/30 rounded-lg border border-white/20 p-6 hover:border-blue-300 transition-colors"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <h3 class="text-lg font-semibold text-gray-900">{{ report.flowId?.name || 'Flow Deletado' }}</h3>
                <span class="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                  {{ getReportCategoryLabel(report.category) }}
                </span>
              </div>

              <p class="text-gray-700 mb-3">{{ report.reason }}</p>

              <div class="flex items-center gap-4 text-sm text-gray-500">
                <span class="flex items-center gap-1">
                  <Icon icon="lucide:user" class="w-4 h-4" />
                  Reportado por: {{ report.reportedBy?.name || 'Anônimo' }}
                </span>
                <span class="flex items-center gap-1">
                  <Icon icon="lucide:clock" class="w-4 h-4" />
                  {{ formatDate(report.createdAt) }}
                </span>
              </div>
            </div>

            <button
              @click="openResolveModal(report)"
              class="ml-6 px-4 py-2 bg-brand-purple text-white rounded-lg hover:brightness-110 transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <Icon icon="lucide:check-circle" class="w-4 h-4" />
              Resolver
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Reject Flow Modal -->
    <div v-if="showRejectModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" @click="showRejectModal = false"></div>

        <div class="relative inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div class="flex items-start justify-between mb-6">
            <div>
              <h3 class="text-xl font-bold text-gray-900">Rejeitar Flow</h3>
              <p class="text-sm text-gray-600 mt-1">{{ selectedFlow?.name }}</p>
            </div>
            <button @click="showRejectModal = false" class="text-gray-400 hover:text-gray-600">
              <Icon icon="lucide:x" class="w-6 h-6" />
            </button>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Motivo da Rejeição *</label>
            <textarea
              v-model="rejectReason"
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent"
              placeholder="Explique por que este flow está sendo rejeitado..."
            ></textarea>
          </div>

          <div class="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              @click="showRejectModal = false"
              class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              @click="handleReject"
              :disabled="loading || !rejectReason.trim()"
              class="px-4 py-2 bg-brand-red text-white rounded-lg hover:brightness-110 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <Icon :icon="loading ? 'lucide:loader-2' : 'lucide:x'" :class="['w-4 h-4', { 'animate-spin': loading }]" />
              Rejeitar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Quarantine Flow Modal -->
    <div v-if="showQuarantineModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" @click="showQuarantineModal = false"></div>

        <div class="relative inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div class="flex items-start justify-between mb-6">
            <div>
              <h3 class="text-xl font-bold text-gray-900">Mover para Quarentena</h3>
              <p class="text-sm text-gray-600 mt-1">{{ selectedFlow?.name }}</p>
            </div>
            <button @click="showQuarantineModal = false" class="text-gray-400 hover:text-gray-600">
              <Icon icon="lucide:x" class="w-6 h-6" />
            </button>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Motivo (opcional)</label>
            <textarea
              v-model="quarantineReason"
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent"
              placeholder="Explique por que este flow está sendo movido para quarentena..."
            ></textarea>
          </div>

          <div class="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              @click="showQuarantineModal = false"
              class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              @click="handleQuarantine"
              :disabled="loading"
              class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Icon :icon="loading ? 'lucide:loader-2' : 'lucide:alert-triangle'" :class="['w-4 h-4', { 'animate-spin': loading }]" />
              Mover para Quarentena
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Resolve Report Modal -->
    <div v-if="showResolveModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" @click="showResolveModal = false"></div>

        <div class="relative inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div class="flex items-start justify-between mb-6">
            <div>
              <h3 class="text-xl font-bold text-gray-900">Resolver Report</h3>
              <p class="text-sm text-gray-600 mt-1">{{ selectedReport?.flowId?.name }}</p>
            </div>
            <button @click="showResolveModal = false" class="text-gray-400 hover:text-gray-600">
              <Icon icon="lucide:x" class="w-6 h-6" />
            </button>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Ação *</label>
              <select
                v-model="resolveAction"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent"
              >
                <option value="no_action">Nenhuma ação (report inválido)</option>
                <option value="quarantine">Colocar em quarentena</option>
                <option value="delete">Deletar flow</option>
                <option value="warn_author">Avisar autor</option>
                <option value="ban_author">Banir autor</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Notas</label>
              <textarea
                v-model="resolveNotes"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                placeholder="Notas sobre a resolução..."
              ></textarea>
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              @click="showResolveModal = false"
              class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              @click="handleResolveReport"
              :disabled="loading"
              class="px-4 py-2 bg-brand-purple text-white rounded-lg hover:brightness-110 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <Icon :icon="loading ? 'lucide:loader-2' : 'lucide:check-circle'" :class="['w-4 h-4', { 'animate-spin': loading }]" />
              Resolver
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
