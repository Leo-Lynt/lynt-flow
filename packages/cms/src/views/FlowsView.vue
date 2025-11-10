<script setup>
import { ref, onMounted, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import AppLayout from '../components/AppLayout.vue'
import FlowExecutionModal from '../components/FlowExecutionModal.vue'
import { useFlows } from '../composables/useFlows.js'
import { useAuth } from '../composables/useAuth.js'

const router = useRouter()
const { user } = useAuth()
const { flows, loading, getFlows, deleteFlow, cloneFlow, executeFlow, getFlowInputs } = useFlows()

const showDeleteModal = ref(false)
const flowToDelete = ref(null)
const searchQuery = ref('')
const executingFlows = ref(new Set())
const openDropdownId = ref(null)

// Execution modal
const showExecutionModal = ref(false)
const executionFlow = ref(null)
const executionInputs = ref([])
const executionLoading = ref(false)

const filteredFlows = computed(() => {
  if (!searchQuery.value.trim()) {
    return flows.value
  }

  return flows.value.filter(flow =>
    flow.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    flow.description?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    flow.category?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    flow.tags?.some(tag => tag.toLowerCase().includes(searchQuery.value.toLowerCase()))
  )
})

onMounted(async () => {
  await getFlows({ page: 1, limit: 100 })
})

function createFlow() {
  router.push('/flows/create')
}

function editFlow(flow) {
  const flowId = flow.id || flow._id
  if (!flowId) {
    alert('Error: Flow ID is missing.')
    return
  }
  router.push(`/flows/${flowId}/edit`)
}

function viewFlow(flow) {
  const flowId = flow.id || flow._id
  if (!flowId) {
    alert('Error: Flow ID is missing.')
    return
  }
  router.push(`/flows/${flowId}`)
}


async function duplicateFlow(flow) {
  const flowId = flow._id || flow.id
  const result = await cloneFlow(flowId)
  if (result.success) {
    await getFlows({ page: 1, limit: 100 })
  }
}

function confirmDelete(flow) {
  flowToDelete.value = flow
  showDeleteModal.value = true
}

async function handleDelete() {
  if (!flowToDelete.value) return

  const flowId = flowToDelete.value._id || flowToDelete.value.id
  const result = await deleteFlow(flowId)
  if (result.success) {
    showDeleteModal.value = false
    flowToDelete.value = null
    await getFlows({ page: 1, limit: 100 })
  }
}

function openFlowEditor(flow) {
  // Pega o token do localStorage
  const authToken = localStorage.getItem('accessToken')
  const flowId = flow._id || flow.id

  if (!authToken) {
    return
  }

  // Abre em nova aba
  // Em produção usa caminho relativo, em dev usa variável de ambiente
  const editorUrl = import.meta.env.PROD
    ? `/editor/?flowId=${flowId}`
    : `${import.meta.env.VITE_EDITOR_URL || 'http://localhost:5173'}/?flowId=${flowId}`

  window.open(editorUrl, '_blank')
}

async function handleExecuteFlow(flow) {
  const flowId = flow._id || flow.id

  // Buscar inputs do flow
  const inputsResult = await getFlowInputs(flowId)

  if (!inputsResult.success) {
    alert(`Erro ao buscar inputs: ${inputsResult.error}`)
    return
  }

  const inputs = inputsResult.data.data?.inputs || []

  // Se tem inputs, mostrar modal
  if (inputs.length > 0) {
    executionFlow.value = flow
    executionInputs.value = inputs
    showExecutionModal.value = true
  } else {
    // Se não tem inputs, executar direto
    await executeFlowDirect(flowId)
  }
}

async function executeFlowDirect(flowId, inputData = {}) {
  executingFlows.value.add(flowId)
  executionLoading.value = true

  const result = await executeFlow(flowId, inputData)

  executingFlows.value.delete(flowId)
  executionLoading.value = false

  if (result.success) {
    showExecutionModal.value = false
    alert('Flow executado com sucesso!')
    await getFlows({ page: 1, limit: 100 })
  } else {
    alert(`Erro ao executar flow: ${result.error}`)
  }
}

function handleExecuteWithInputs(inputData) {
  const flowId = executionFlow.value?._id || executionFlow.value?.id
  if (flowId) {
    executeFlowDirect(flowId, inputData)
  }
}

function closeExecutionModal() {
  if (!executionLoading.value) {
    showExecutionModal.value = false
    executionFlow.value = null
    executionInputs.value = []
  }
}

function isExecuting(flow) {
  const flowId = flow._id || flow.id
  return executingFlows.value.has(flowId)
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function toggleDropdown(flowId, event) {
  event.stopPropagation()
  openDropdownId.value = openDropdownId.value === flowId ? null : flowId
}

function closeDropdown() {
  openDropdownId.value = null
}

function isDropdownOpen(flow) {
  const flowId = flow._id || flow.id
  return openDropdownId.value === flowId
}

// Fechar dropdown ao clicar fora
function handleClickOutside() {
  openDropdownId.value = null
}

// Adicionar/remover event listener baseado no estado do dropdown
watch(openDropdownId, (isOpen) => {
  if (isOpen) {
    nextTick(() => {
      document.addEventListener('click', handleClickOutside)
    })
  } else {
    document.removeEventListener('click', handleClickOutside)
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <AppLayout>
    <!-- Page Header -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-semibold text-gray-800 tracking-wide">Fluxos</h1>
          <p class="text-gray-600 mt-2 text-sm tracking-wide">Crie e gerencie seus fluxos de automação</p>
        </div>
        <button
          @click="createFlow"
          class="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-5 py-2.5 rounded-lg flex items-center space-x-2 transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 text-sm font-medium tracking-wide"
        >
          <Icon icon="lucide:plus" class="w-4 h-4" />
          <span>Criar Novo Fluxo</span>
        </button>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="mb-6">
      <div class="relative max-w-md">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon icon="lucide:search" class="w-5 h-5 text-gray-400" />
        </div>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar fluxos por nome, descrição, categoria ou tags..."
          class="block w-full pl-10 pr-3 py-2.5 bg-white/50 backdrop-blur-sm border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white/70 transition-all text-sm tracking-wide"
        />
      </div>
    </div>

    <!-- Flows Grid/List -->
    <div v-if="loading" class="flex justify-center py-12">
      <Icon icon="lucide:loader-2" class="w-8 h-8 animate-spin text-blue-600" />
    </div>

    <div v-else-if="filteredFlows.length === 0 && !searchQuery.trim()" class="text-center py-12 glass-card backdrop-blur-xl bg-white/30 rounded-lg border border-white/20">
      <Icon icon="lucide:workflow" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-semibold text-gray-800 mb-2">Nenhum fluxo encontrado</h3>
      <p class="text-gray-600 mb-6 text-sm tracking-wide">
        Crie seu primeiro fluxo para começar
      </p>
      <button
        @click="createFlow"
        class="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-5 py-2.5 rounded-lg transition-all inline-flex items-center space-x-2 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 text-sm font-medium tracking-wide"
      >
        <Icon icon="lucide:plus" class="w-4 h-4" />
        <span>Criar Primeiro Fluxo</span>
      </button>
    </div>

    <!-- No search results -->
    <div v-else-if="filteredFlows.length === 0 && searchQuery.trim()" class="text-center py-12 glass-card backdrop-blur-xl bg-white/30 rounded-lg border border-white/20">
      <Icon icon="lucide:search" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-semibold text-gray-800 mb-2">Nenhum fluxo encontrado</h3>
      <p class="text-gray-600 mb-6 text-sm tracking-wide">
        Nenhum fluxo corresponde aos seus critérios de busca. Tente ajustar os termos.
      </p>
      <button
        @click="searchQuery = ''"
        class="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors underline decoration-blue-600/30 hover:decoration-blue-600/60 underline-offset-2"
      >
        Limpar busca
      </button>
    </div>

    <!-- Grid View -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div
        v-for="flow in filteredFlows"
        :key="flow._id || flow.id"
        :class="[
          'glass-card backdrop-blur-xl bg-white/70 rounded-2xl border border-white/40 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative',
          { 'z-50': isDropdownOpen(flow) }
        ]"
      >
        <!-- Gradiente sutil no hover -->
        <div class="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/5 group-hover:to-cyan-500/5 transition-all duration-300 pointer-events-none rounded-2xl overflow-hidden"></div>

        <!-- Content -->
        <div class="relative p-5 space-y-4">
          <!-- Header -->
          <div class="flex items-start justify-between gap-3">
            <h3 class="text-base font-semibold text-gray-900 tracking-wide flex-1">
              {{ flow.name }}
            </h3>
            <Icon
              v-if="flow.isPublic"
              icon="lucide:globe"
              class="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5"
              title="Fluxo público"
            />
          </div>

          <!-- Description -->
          <p class="text-xs text-gray-600 line-clamp-2 min-h-[2.5rem] tracking-wide leading-relaxed">
            {{ flow.description || 'Sem descrição disponível' }}
          </p>

          <!-- Stats -->
          <div class="flex items-center gap-4 text-xs text-gray-600">
            <span class="flex items-center gap-1.5">
              <Icon icon="lucide:git-branch" class="w-3.5 h-3.5 text-blue-500" />
              {{ flow.totalNodes || 0 }} nós
            </span>
            <span class="flex items-center gap-1.5">
              <Icon icon="lucide:play" class="w-3.5 h-3.5 text-green-500" />
              {{ flow.executionStats?.totalExecutions || 0 }}
            </span>
          </div>

          <!-- Date -->
          <div class="flex items-center gap-1.5 text-xs text-gray-500">
            <Icon icon="lucide:clock" class="w-3.5 h-3.5" />
            {{ formatDate(flow.updatedAt || flow.createdAt) }}
          </div>

          <!-- Primary Actions -->
          <div class="flex items-center gap-2 pt-2 border-t border-gray-200/50">
            <button
              @click="handleExecuteFlow(flow)"
              :disabled="isExecuting(flow)"
              class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-green-500/10 text-green-700 hover:bg-green-500/20 rounded-lg transition-all text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              title="Executar Fluxo"
            >
              <Icon
                :icon="isExecuting(flow) ? 'lucide:loader-2' : 'lucide:play'"
                :class="['w-3.5 h-3.5', { 'animate-spin': isExecuting(flow) }]"
              />
              <span>Executar</span>
            </button>
            <button
              @click="openFlowEditor(flow)"
              class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 rounded-lg transition-all text-xs font-medium"
              title="Abrir Editor"
            >
              <Icon icon="lucide:square-pen" class="w-3.5 h-3.5" />
              <span>Editor</span>
            </button>

            <!-- Dropdown Menu -->
            <div class="relative">
              <button
                @click="toggleDropdown(flow._id || flow.id, $event)"
                class="p-2 text-gray-600 hover:bg-gray-500/10 rounded-lg transition-all"
                title="Mais opções"
              >
                <Icon icon="lucide:more-vertical" class="w-4 h-4" />
              </button>

              <!-- Dropdown content -->
              <div
                v-if="isDropdownOpen(flow)"
                @click.stop
                class="absolute right-0 top-full mt-1 w-40 backdrop-blur-xl bg-white/90 rounded-xl shadow-xl border border-white/40 py-1 z-50 overflow-hidden"
              >
                <button
                  @click="editFlow(flow); closeDropdown()"
                  class="w-full flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-500/10 transition-all text-xs"
                >
                  <Icon icon="lucide:settings" class="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>
                <button
                  @click="duplicateFlow(flow); closeDropdown()"
                  class="w-full flex items-center gap-2 px-3 py-2 text-cyan-600 hover:bg-cyan-500/10 transition-all text-xs"
                >
                  <Icon icon="lucide:copy" class="w-3.5 h-3.5" />
                  <span>Duplicar</span>
                </button>
                <div class="border-t border-gray-200/50 my-1"></div>
                <button
                  @click="confirmDelete(flow); closeDropdown()"
                  class="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-500/10 transition-all text-xs"
                >
                  <Icon icon="lucide:trash-2" class="w-3.5 h-3.5" />
                  <span>Excluir</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>


    <!-- Execution Modal -->
    <FlowExecutionModal
      :show="showExecutionModal"
      :flow-name="executionFlow?.name || ''"
      :inputs="executionInputs"
      :loading="executionLoading"
      @close="closeExecutionModal"
      @execute="handleExecuteWithInputs"
    />

    <!-- Delete Modal -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50"
      @click="showDeleteModal = false"
    >
      <div class="glass-card backdrop-blur-xl bg-white/70 rounded-lg border border-white/40 p-6 max-w-sm w-full mx-4 shadow-xl" @click.stop>
        <div class="flex items-center mb-4">
          <Icon icon="lucide:alert-triangle" class="w-6 h-6 text-red-600 mr-3" />
          <h3 class="text-lg font-semibold text-gray-900 tracking-wide">Excluir Fluxo</h3>
        </div>
        <p class="text-gray-700 mb-6 text-sm tracking-wide">
          Tem certeza que deseja excluir "{{ flowToDelete?.name }}"? Esta ação não pode ser desfeita.
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
