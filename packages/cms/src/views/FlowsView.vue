<script setup>
import { ref, onMounted, computed } from 'vue'
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
  const editorUrl = `${import.meta.env.VITE_CMS_URL || 'http://localhost:5174'}/editor/?flowId=${flowId}`
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
          class="bg-brand-purple hover:brightness-110 text-white px-5 py-2.5 rounded flex items-center space-x-2 transition-all shadow-sm hover:shadow-lg text-sm font-medium tracking-wide"
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
          class="block w-full pl-10 pr-3 py-2.5 bg-white/50 backdrop-blur-sm border border-gray-300 rounded text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-purple focus:bg-white/70 transition-all text-sm tracking-wide"
        />
      </div>
    </div>

    <!-- Flows Grid/List -->
    <div v-if="loading" class="flex justify-center py-12">
      <Icon icon="lucide:loader-2" class="w-8 h-8 animate-spin text-brand-purple" />
    </div>

    <div v-else-if="filteredFlows.length === 0 && !searchQuery.trim()" class="text-center py-12 glass-card backdrop-blur-xl bg-white/30 rounded-lg border border-white/20">
      <Icon icon="lucide:workflow" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-semibold text-gray-800 mb-2">Nenhum fluxo encontrado</h3>
      <p class="text-gray-600 mb-6 text-sm tracking-wide">
        Crie seu primeiro fluxo para começar
      </p>
      <button
        @click="createFlow"
        class="bg-brand-purple hover:brightness-110 text-white px-5 py-2.5 rounded transition-all inline-flex items-center space-x-2 text-sm font-medium tracking-wide"
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
        class="text-brand-purple hover:text-brand-purple/80 text-sm font-medium transition-colors underline decoration-brand-purple/30 hover:decoration-brand-purple/60 underline-offset-2"
      >
        Limpar busca
      </button>
    </div>

    <!-- Grid View -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div
        v-for="flow in filteredFlows"
        :key="flow._id || flow.id"
        @click="openFlowEditor(flow)"
        class="glass-card backdrop-blur-xl bg-white/30 rounded-lg border border-white/20 hover:shadow-xl hover:bg-white/40 transition-all duration-200 overflow-hidden group cursor-pointer"
      >
        <!-- Flow Header -->
        <div class="p-4 border-b border-gray-200/30">
          <div class="mb-2 flex items-center justify-between">
            <h3 class="text-base font-semibold text-gray-900 group-hover:text-brand-purple transition-colors tracking-wide">
              {{ flow.name }}
            </h3>
            <Icon
              v-if="flow.isPublic"
              icon="lucide:globe"
              class="w-4 h-4 text-brand-green flex-shrink-0"
              title="Fluxo público"
            />
          </div>
          <p class="text-xs text-gray-600 line-clamp-2 min-h-[2.5rem] tracking-wide">
            {{ flow.description || 'Sem descrição disponível' }}
          </p>
        </div>

        <!-- Flow Info -->
        <div class="px-4 py-3 bg-white/20 backdrop-blur-sm text-xs text-gray-600 space-y-1.5">
          <div class="flex items-center justify-between">
            <span class="flex items-center">
              <Icon icon="lucide:git-branch" class="w-3 h-3 mr-1.5 text-brand-purple" />
              {{ flow.totalNodes || 0 }} nós
            </span>
            <span class="flex items-center">
              <Icon icon="lucide:play" class="w-3 h-3 mr-1.5 text-brand-green" />
              {{ flow.executionStats?.totalExecutions || 0 }} execuções
            </span>
          </div>
          <div class="flex items-center">
            <Icon icon="lucide:clock" class="w-3 h-3 mr-1.5 text-brand-orange" />
            Atualizado {{ formatDate(flow.updatedAt || flow.createdAt) }}
          </div>
        </div>

        <!-- Flow Actions -->
        <div class="p-3 bg-white/10 backdrop-blur-sm border-t border-gray-200/30">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-1">
              <button
                @click.stop="handleExecuteFlow(flow)"
                :disabled="isExecuting(flow)"
                class="p-1.5 text-brand-green hover:bg-white/30 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title="Executar Fluxo"
              >
                <Icon
                  :icon="isExecuting(flow) ? 'lucide:loader-2' : 'lucide:play'"
                  :class="['w-4 h-4', { 'animate-spin': isExecuting(flow) }]"
                />
              </button>
              <button
                @click.stop="editFlow(flow)"
                class="p-1.5 text-brand-purple hover:bg-white/30 rounded transition-all"
                title="Editar"
              >
                <Icon icon="lucide:edit" class="w-4 h-4" />
              </button>
              <button
                @click.stop="duplicateFlow(flow)"
                class="p-1.5 text-brand-pink hover:bg-white/30 rounded transition-all"
                title="Duplicar"
              >
                <Icon icon="lucide:copy" class="w-4 h-4" />
              </button>
            </div>
            <button
              @click.stop="confirmDelete(flow)"
              class="p-1.5 text-brand-red hover:bg-white/30 rounded transition-all"
              title="Excluir"
            >
              <Icon icon="lucide:trash-2" class="w-4 h-4" />
            </button>
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
      <div class="glass-card backdrop-blur-xl bg-white/30 rounded-lg border border-white/20 p-6 max-w-sm w-full mx-4" @click.stop>
        <div class="flex items-center mb-4">
          <Icon icon="lucide:alert-triangle" class="w-6 h-6 text-brand-red mr-3" />
          <h3 class="text-lg font-semibold text-gray-900 tracking-wide">Excluir Fluxo</h3>
        </div>
        <p class="text-gray-700 mb-6 text-sm tracking-wide">
          Tem certeza que deseja excluir "{{ flowToDelete?.name }}"? Esta ação não pode ser desfeita.
        </p>
        <div class="flex space-x-3">
          <button
            @click="showDeleteModal = false"
            class="flex-1 px-4 py-2.5 bg-white/50 backdrop-blur-sm border border-gray-300 text-gray-700 rounded hover:bg-white/70 hover:brightness-95 transition-all text-sm font-medium tracking-wide"
          >
            Cancelar
          </button>
          <button
            @click="handleDelete"
            class="flex-1 px-4 py-2.5 bg-brand-red text-white rounded hover:brightness-110 transition-all text-sm font-medium tracking-wide"
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
