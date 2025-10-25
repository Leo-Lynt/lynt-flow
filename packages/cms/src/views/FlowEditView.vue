<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import AppLayout from '../components/AppLayout.vue'
import { useFlows } from '../composables/useFlows.js'

const router = useRouter()
const route = useRoute()
const { getFlow, updateFlow, loading } = useFlows()

// Form data
const flowData = ref({
  name: '',
  description: '',
  category: 'automation',
  tags: [],
  isPublic: false,
  metadata: {
    requirements: []
  }
})

const tagInput = ref('')

const categories = [
  { value: 'automation', label: 'Automação', icon: 'lucide:workflow' },
  { value: 'data-processing', label: 'Processamento de Dados', icon: 'lucide:database' },
  { value: 'api-integration', label: 'Integração de API', icon: 'lucide:link' },
  { value: 'notification', label: 'Notificação', icon: 'lucide:bell' },
  { value: 'transformation', label: 'Transformação de Dados', icon: 'lucide:shuffle' },
  { value: 'utility', label: 'Utilidade', icon: 'lucide:wrench' }
]

// UI state
const saving = ref(false)
const loadingFlow = ref(true)
const loadError = ref(null)
const flowId = route.params.id
const originalFlowData = ref(null)

const canSave = computed(() => {
  return flowData.value.name && flowData.value.name.trim()
})

const hasChanges = computed(() => {
  if (!originalFlowData.value) return false
  return JSON.stringify(flowData.value) !== JSON.stringify(originalFlowData.value)
})

onMounted(async () => {
  await loadFlow()
})

async function loadFlow() {
  loadingFlow.value = true
  loadError.value = null

  const result = await getFlow(flowId)

  if (result.success) {
    const flow = result.data
    // Use _id instead of id
    const flowId = flow._id || flow.id
    flowData.value = {
      name: flow.name || '',
      description: flow.description || '',
      category: flow.category || 'automation',
      tags: flow.tags || [],
      isPublic: flow.isPublic || false,
      metadata: flow.metadata || { requirements: [] }
    }

    // Store original data for change detection
    originalFlowData.value = JSON.parse(JSON.stringify(flowData.value))
  } else {
    loadError.value = result.error || 'Failed to load flow. Please check if the flow exists.'

    // Wait 3 seconds before redirecting to give user time to see the error
    setTimeout(() => {
      router.push('/flows')
    }, 3000)
  }

  loadingFlow.value = false
}

function addTag() {
  const tag = tagInput.value.trim()
  if (tag && !flowData.value.tags.includes(tag)) {
    flowData.value.tags.push(tag)
    tagInput.value = ''
  }
}

async function saveFlow() {
  if (!canSave.value) return

  saving.value = true

  const flowPayload = {
    name: flowData.value.name,
    description: flowData.value.description,
    category: flowData.value.category,
    tags: flowData.value.tags,
    isPublic: flowData.value.isPublic,
    metadata: flowData.value.metadata
  }

  const result = await updateFlow(flowId, flowPayload)

  if (result.success) {
    router.push('/flows')
  }

  saving.value = false
}

function cancelEdit() {
  router.push('/flows')
}
</script>

<template>
  <AppLayout>
    <!-- Loading state -->
    <div v-if="loadingFlow" class="flex justify-center items-center h-64">
      <div class="text-center">
        <Icon icon="lucide:loader-2" class="w-8 h-8 animate-spin text-brand-purple mx-auto mb-4" />
        <p class="text-gray-600 tracking-wide">Carregando fluxo...</p>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="loadError" class="flex justify-center items-center h-64">
      <div class="text-center max-w-md">
        <Icon icon="lucide:alert-circle" class="w-16 h-16 text-brand-red mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2 tracking-wide">Falha ao Carregar Fluxo</h3>
        <p class="text-gray-600 mb-4 tracking-wide">{{ loadError }}</p>
        <p class="text-sm text-gray-500 tracking-wide">Redirecionando para fluxos em 3 segundos...</p>
        <button
          @click="router.push('/flows')"
          class="mt-4 px-4 py-2 bg-brand-purple text-white rounded-lg hover:brightness-110 transition-all font-medium tracking-wide"
        >
          Voltar para Fluxos
        </button>
      </div>
    </div>

    <!-- Main content -->
    <div v-else>
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-semibold text-gray-800 tracking-wide">Editar Fluxo</h1>
          <p class="text-gray-600 mt-2 tracking-wide">Atualize os metadados e configurações do seu fluxo</p>
        </div>
        <div class="flex items-center space-x-3">
          <button
            @click="cancelEdit"
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex items-center space-x-2 font-medium tracking-wide"
          >
            <Icon icon="lucide:arrow-left" class="w-4 h-4" />
            <span>Cancelar</span>
          </button>
          <button
            @click="saveFlow"
            :disabled="!canSave || saving || !hasChanges"
            class="px-6 py-2 bg-brand-purple text-white rounded-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-2 shadow-sm font-medium tracking-wide"
          >
            <Icon
              :icon="saving ? 'lucide:loader-2' : 'lucide:save'"
              :class="['w-4 h-4', { 'animate-spin': saving }]"
            />
            <span>{{ saving ? 'Salvando...' : 'Salvar Alterações' }}</span>
          </button>
        </div>
      </div>

      <!-- Unsaved changes warning -->
      <div v-if="hasChanges" class="bg-brand-orange/10 border border-brand-orange/30 rounded-lg p-4 mb-6">
        <div class="flex items-center">
          <Icon icon="lucide:alert-triangle" class="w-5 h-5 text-brand-orange mr-2" />
          <span class="text-sm text-brand-orange font-medium tracking-wide">Você tem alterações não salvas</span>
        </div>
      </div>

      <!-- Flow details form -->
      <div class="glass-card backdrop-blur-xl bg-white/30 rounded-lg border border-white/20 p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center tracking-wide">
          <Icon icon="lucide:settings" class="w-5 h-5 mr-2 text-brand-purple" />
          Configuração do Fluxo
        </h2>

        <!-- Basic Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
              Nome do Fluxo *
            </label>
            <input
              id="name"
              v-model="flowData.name"
              type="text"
              placeholder="Digite o nome do fluxo (ex: 'Fluxo de Registro de Usuário')"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent"
            />
          </div>

          <div>
            <label for="category" class="block text-sm font-medium text-gray-700 mb-2">
              Categoria
            </label>
            <select
              id="category"
              v-model="flowData.category"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent"
            >
              <option v-for="cat in categories" :key="cat.value" :value="cat.value">
                {{ cat.label }}
              </option>
            </select>
          </div>
        </div>

        <div class="mb-6">
          <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
            Descrição
          </label>
          <textarea
            id="description"
            v-model="flowData.description"
            rows="3"
            placeholder="Descreva o que este fluxo faz, seu propósito e detalhes importantes..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent resize-none"
          ></textarea>
        </div>

        <!-- Tags -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <div class="flex flex-wrap gap-2 mb-2">
            <span
              v-for="(tag, index) in flowData.tags"
              :key="index"
              class="inline-flex items-center px-2 py-1 bg-brand-purple/10 text-brand-purple border border-brand-purple/30 text-xs rounded-full"
            >
              {{ tag }}
              <button
                @click="flowData.tags.splice(index, 1)"
                class="ml-1 text-brand-purple hover:text-brand-purple/80"
              >
                <Icon icon="lucide:x" class="w-3 h-3" />
              </button>
            </span>
          </div>
          <div class="flex gap-2">
            <input
              v-model="tagInput"
              @keyup.enter="addTag"
              type="text"
              placeholder="Adicionar tags (pressione Enter)"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent text-sm"
            />
            <button
              @click="addTag"
              type="button"
              class="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Icon icon="lucide:plus" class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Publishing Options -->
        <div class="border-t border-gray-200 pt-4">
          <h3 class="text-sm font-medium text-gray-900 mb-3">Opções de Publicação</h3>
          <div class="space-y-3">
            <label class="flex items-center">
              <input
                v-model="flowData.isPublic"
                type="checkbox"
                class="h-4 w-4 text-brand-purple focus:ring-brand-purple focus:border-transparent border-gray-300 rounded"
              />
              <span class="ml-2 text-sm text-gray-700">Tornar este fluxo público</span>
              <Icon icon="lucide:info" class="w-4 h-4 ml-2 text-gray-400" title="Fluxos públicos podem ser descobertos e importados por outros usuários" />
            </label>

            <div v-if="flowData.isPublic" class="ml-6 p-3 bg-brand-purple/10 border border-brand-purple/30 rounded-lg">
              <p class="text-sm text-brand-purple">
                <Icon icon="lucide:info" class="w-4 h-4 inline mr-1" />
                Este fluxo será publicado na biblioteca pública e ficará visível para todos os usuários. Uma varredura de segurança será realizada automaticamente.
              </p>
            </div>
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
