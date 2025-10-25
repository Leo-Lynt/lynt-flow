<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import AppLayout from '../components/AppLayout.vue'
import { useFlows } from '../composables/useFlows.js'

const router = useRouter()
const { createFlow, loading } = useFlows()

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
const saving = ref(false)

const categories = [
  { value: 'automation', label: 'Automação', icon: 'lucide:workflow' },
  { value: 'data-processing', label: 'Processamento de Dados', icon: 'lucide:database' },
  { value: 'api-integration', label: 'Integração de API', icon: 'lucide:link' },
  { value: 'notification', label: 'Notificação', icon: 'lucide:bell' },
  { value: 'transformation', label: 'Transformação de Dados', icon: 'lucide:shuffle' },
  { value: 'utility', label: 'Utilidade', icon: 'lucide:wrench' }
]

const canSave = computed(() => {
  return flowData.value.name.trim()
})

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
    metadata: flowData.value.metadata,
    status: 'draft'
  }

  const result = await createFlow(flowPayload)

  if (result.success) {
    router.push('/flows')
  }

  saving.value = false
}

function cancelFlow() {
  router.push('/flows')
}

</script>

<template>
  <AppLayout>
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-semibold text-gray-800 tracking-wide">Criar Novo Fluxo</h1>
        <p class="text-gray-600 mt-2 tracking-wide">Configure os metadados e configurações do seu fluxo. O design visual será feito no Flow Builder.</p>
      </div>
      <div class="flex items-center space-x-3">
        <button
          @click="cancelFlow"
          class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex items-center space-x-2 font-medium tracking-wide"
        >
          <Icon icon="lucide:arrow-left" class="w-4 h-4" />
          <span>Voltar</span>
        </button>
        <button
          @click="saveFlow"
          :disabled="!canSave || saving"
          class="px-6 py-2 bg-brand-purple text-white rounded-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-2 shadow-sm font-medium tracking-wide"
        >
          <Icon
            :icon="saving ? 'lucide:loader-2' : 'lucide:save'"
            :class="['w-4 h-4', { 'animate-spin': saving }]"
          />
          <span>{{ saving ? 'Salvando...' : 'Salvar Fluxo' }}</span>
        </button>
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
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent focus:border-transparent"
          />
        </div>

        <div>
          <label for="category" class="block text-sm font-medium text-gray-700 mb-2">
            Categoria
          </label>
          <select
            id="category"
            v-model="flowData.category"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent focus:border-transparent"
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
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent focus:border-transparent resize-none"
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
              class="ml-1 text-blue-600 hover:text-blue-800"
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
            placeholder="Add tags (press Enter)"
            class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent focus:border-transparent text-sm"
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
        <h3 class="text-sm font-medium text-gray-900 mb-3">Publishing Options</h3>
        <div class="space-y-3">
          <label class="flex items-center">
            <input
              v-model="flowData.isPublic"
              type="checkbox"
              class="h-4 w-4 text-blue-600 focus:ring-brand-purple focus:border-transparent border-gray-300 rounded"
            />
            <span class="ml-2 text-sm text-gray-700">Make this flow public</span>
            <Icon icon="lucide:info" class="w-4 h-4 ml-2 text-gray-400" title="Public flows can be discovered and imported by other users" />
          </label>

          <div v-if="flowData.isPublic" class="ml-6 p-3 bg-yellow-50 rounded-lg">
            <p class="text-sm text-yellow-800">
              <Icon icon="lucide:alert-triangle" class="w-4 h-4 inline mr-1" />
              Public flows will be visible in the community library. Ensure you don't include sensitive information.
            </p>
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