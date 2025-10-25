<script setup>
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { usePublicFlows } from '../composables/usePublicFlows.js'

const props = defineProps({
  show: Boolean,
  flow: Object
})

const emit = defineEmits(['close', 'published'])

const { publishFlow, loading } = usePublicFlows()

const currentStep = ref(1)
const error = ref('')
const warnings = ref([])

const formData = ref({
  detailedDescription: '',
  tags: [],
  difficulty: 'beginner',
  license: 'MIT',
  allowForking: true,
  requireAttribution: true
})

const tagInput = ref('')

const categories = [
  { value: 'automation', label: 'Automation' },
  { value: 'data-processing', label: 'Data Processing' },
  { value: 'api-integration', label: 'API Integration' },
  { value: 'notification', label: 'Notification' },
  { value: 'utility', label: 'Utility' }
]

const licenses = [
  { value: 'MIT', label: 'MIT License', description: 'Permissivo - permite uso comercial' },
  { value: 'Apache-2.0', label: 'Apache 2.0', description: 'Permissivo com proteção de patentes' },
  { value: 'CC-BY-4.0', label: 'Creative Commons BY 4.0', description: 'Requer atribuição' },
  { value: 'All-Rights-Reserved', label: 'All Rights Reserved', description: 'Todos os direitos reservados' }
]

const checklist = ref({
  noCredentials: false,
  tested: false,
  documented: false
})

const allChecklistItems = computed(() => {
  return checklist.value.noCredentials && checklist.value.tested && checklist.value.documented
})

function addTag() {
  const tag = tagInput.value.trim().toLowerCase()
  if (tag && !formData.value.tags.includes(tag) && formData.value.tags.length < 10) {
    formData.value.tags.push(tag)
    tagInput.value = ''
  }
}

function removeTag(index) {
  formData.value.tags.splice(index, 1)
}

function nextStep() {
  error.value = ''

  if (currentStep.value === 1) {
    if (!allChecklistItems.value) {
      error.value = 'Por favor, confirme todos os itens do checklist'
      return
    }
  }

  if (currentStep.value === 2) {
    if (!formData.value.detailedDescription || formData.value.detailedDescription.length < 50) {
      error.value = 'Descrição detalhada deve ter pelo menos 50 caracteres'
      return
    }
    if (formData.value.tags.length === 0) {
      error.value = 'Adicione pelo menos 1 tag'
      return
    }
  }

  currentStep.value++
}

function previousStep() {
  error.value = ''
  currentStep.value--
}

async function handlePublish() {
  error.value = ''
  warnings.value = []

  const result = await publishFlow(props.flow._id, formData.value)

  if (result.success) {
    if (result.validationWarnings && result.validationWarnings.length > 0) {
      warnings.value = result.validationWarnings
    }
    emit('published', result.data)
    setTimeout(() => {
      close()
    }, 2000)
  } else {
    error.value = result.error
    if (result.errors) {
      warnings.value = result.errors
    }
  }
}

function close() {
  currentStep.value = 1
  error.value = ''
  warnings.value = []
  formData.value = {
    detailedDescription: '',
    tags: [],
    difficulty: 'beginner',
    license: 'MIT',
    allowForking: true,
    requireAttribution: true
  }
  checklist.value = {
    noCredentials: false,
    tested: false,
    documented: false
  }
  emit('close')
}
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
      <!-- Overlay -->
      <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" @click="close"></div>

      <!-- Modal -->
      <div class="relative inline-block w-full max-w-3xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-2xl font-bold text-gray-900">
            Publicar Flow na Biblioteca
          </h3>
          <button @click="close" class="text-gray-400 hover:text-gray-600">
            <Icon icon="lucide:x" class="w-6 h-6" />
          </button>
        </div>

        <!-- Progress Steps -->
        <div class="flex items-center justify-between mb-8">
          <div v-for="step in 4" :key="step" class="flex items-center flex-1">
            <div class="flex items-center">
              <div :class="[
                'w-10 h-10 rounded-full flex items-center justify-center font-semibold',
                currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              ]">
                {{ step }}
              </div>
              <div v-if="step < 4" :class="[
                'h-1 w-full mx-2',
                currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
              ]"></div>
            </div>
          </div>
        </div>

        <!-- Error/Warning Messages -->
        <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div class="flex items-start">
            <Icon icon="lucide:alert-circle" class="w-5 h-5 text-red-600 mt-0.5 mr-2" />
            <p class="text-red-800">{{ error }}</p>
          </div>
        </div>

        <div v-if="warnings.length > 0" class="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div class="flex items-start">
            <Icon icon="lucide:alert-triangle" class="w-5 h-5 text-yellow-600 mt-0.5 mr-2" />
            <div class="flex-1">
              <p class="font-medium text-yellow-900 mb-2">Avisos:</p>
              <ul class="list-disc list-inside space-y-1 text-yellow-800 text-sm">
                <li v-for="(warning, index) in warnings" :key="index">{{ warning }}</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Step 1: Checklist de Segurança -->
        <div v-if="currentStep === 1" class="space-y-6">
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 class="font-semibold text-blue-900 mb-2">⚠️ Checklist de Segurança</h4>
            <p class="text-sm text-blue-800 mb-4">
              Antes de publicar, certifique-se de que seu flow está seguro para compartilhar
            </p>
          </div>

          <div class="space-y-4">
            <label class="flex items-start space-x-3 cursor-pointer">
              <input
                v-model="checklist.noCredentials"
                type="checkbox"
                class="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <p class="font-medium text-gray-900">Removi todas as credenciais</p>
                <p class="text-sm text-gray-600">API keys, tokens, senhas, connection strings foram removidos</p>
              </div>
            </label>

            <label class="flex items-start space-x-3 cursor-pointer">
              <input
                v-model="checklist.tested"
                type="checkbox"
                class="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <p class="font-medium text-gray-900">Testei o flow e funciona corretamente</p>
                <p class="text-sm text-gray-600">O flow foi executado com sucesso e produz os resultados esperados</p>
              </div>
            </label>

            <label class="flex items-start space-x-3 cursor-pointer">
              <input
                v-model="checklist.documented"
                type="checkbox"
                class="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <p class="font-medium text-gray-900">Documentei como usar o flow</p>
                <p class="text-sm text-gray-600">Incluí instruções claras sobre configuração e uso</p>
              </div>
            </label>
          </div>

          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p class="text-sm text-yellow-800">
              <strong>Nota:</strong> Flows com código malicioso, credenciais expostas ou informações enganosas serão rejeitados e podem resultar em banimento.
            </p>
          </div>
        </div>

        <!-- Step 2: Metadados -->
        <div v-if="currentStep === 2" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Descrição Detalhada *
            </label>
            <textarea
              v-model="formData.detailedDescription"
              rows="6"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descreva detalhadamente o que seu flow faz, como configurá-lo e quando usá-lo..."
            ></textarea>
            <p class="mt-1 text-xs text-gray-500">
              {{ formData.detailedDescription.length }} / 5000 caracteres (mínimo 50)
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Tags * (máximo 10)
            </label>
            <div class="flex gap-2 mb-2">
              <input
                v-model="tagInput"
                @keypress.enter.prevent="addTag"
                type="text"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Digite uma tag e pressione Enter"
                :disabled="formData.tags.length >= 10"
              />
              <button
                @click="addTag"
                type="button"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                :disabled="formData.tags.length >= 10"
              >
                Adicionar
              </button>
            </div>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="(tag, index) in formData.tags"
                :key="index"
                class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2"
              >
                {{ tag }}
                <button @click="removeTag(index)" class="hover:text-blue-900">
                  <Icon icon="lucide:x" class="w-3 h-3" />
                </button>
              </span>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Nível de Dificuldade *
            </label>
            <select
              v-model="formData.difficulty"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="beginner">Iniciante</option>
              <option value="intermediate">Intermediário</option>
              <option value="advanced">Avançado</option>
            </select>
          </div>
        </div>

        <!-- Step 3: Licenciamento -->
        <div v-if="currentStep === 3" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">
              Licença *
            </label>
            <div class="space-y-3">
              <label
                v-for="license in licenses"
                :key="license.value"
                class="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:border-blue-300 transition-colors"
                :class="formData.license === license.value ? 'border-blue-600 bg-blue-50' : 'border-gray-200'"
              >
                <input
                  v-model="formData.license"
                  type="radio"
                  :value="license.value"
                  class="mt-1 w-5 h-5 text-blue-600"
                />
                <div class="ml-3 flex-1">
                  <p class="font-medium text-gray-900">{{ license.label }}</p>
                  <p class="text-sm text-gray-600">{{ license.description }}</p>
                </div>
              </label>
            </div>
          </div>

          <div class="space-y-3">
            <label class="flex items-start space-x-3 cursor-pointer">
              <input
                v-model="formData.allowForking"
                type="checkbox"
                class="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <p class="font-medium text-gray-900">Permitir que outros façam fork</p>
                <p class="text-sm text-gray-600">Outros usuários poderão criar cópias modificadas do seu flow</p>
              </div>
            </label>

            <label class="flex items-start space-x-3 cursor-pointer">
              <input
                v-model="formData.requireAttribution"
                type="checkbox"
                class="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <p class="font-medium text-gray-900">Requerer atribuição</p>
                <p class="text-sm text-gray-600">Usuários devem dar crédito ao autor original</p>
              </div>
            </label>
          </div>
        </div>

        <!-- Step 4: Revisão Final -->
        <div v-if="currentStep === 4" class="space-y-6">
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-4">
            <h4 class="font-semibold text-gray-900">Revisão Final</h4>

            <div>
              <p class="text-sm font-medium text-gray-700">Flow:</p>
              <p class="text-gray-900">{{ flow?.name }}</p>
            </div>

            <div>
              <p class="text-sm font-medium text-gray-700">Descrição:</p>
              <p class="text-gray-900 text-sm">{{ formData.detailedDescription.substring(0, 200) }}{{ formData.detailedDescription.length > 200 ? '...' : '' }}</p>
            </div>

            <div>
              <p class="text-sm font-medium text-gray-700">Tags:</p>
              <div class="flex flex-wrap gap-2 mt-1">
                <span v-for="tag in formData.tags" :key="tag" class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  {{ tag }}
                </span>
              </div>
            </div>

            <div>
              <p class="text-sm font-medium text-gray-700">Dificuldade:</p>
              <p class="text-gray-900 capitalize">{{ formData.difficulty }}</p>
            </div>

            <div>
              <p class="text-sm font-medium text-gray-700">Licença:</p>
              <p class="text-gray-900">{{ licenses.find(l => l.value === formData.license)?.label }}</p>
            </div>
          </div>

          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p class="text-sm text-blue-800">
              <strong>Importante:</strong> Seu flow será enviado para revisão. Após aprovação por um moderador, ele ficará visível na biblioteca pública.
            </p>
          </div>
        </div>

        <!-- Footer Buttons -->
        <div class="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            v-if="currentStep > 1"
            @click="previousStep"
            type="button"
            class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Icon icon="lucide:arrow-left" class="w-4 h-4" />
            Voltar
          </button>
          <div v-else></div>

          <div class="flex items-center gap-3">
            <button
              @click="close"
              type="button"
              class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>

            <button
              v-if="currentStep < 4"
              @click="nextStep"
              type="button"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              Próximo
              <Icon icon="lucide:arrow-right" class="w-4 h-4" />
            </button>

            <button
              v-else
              @click="handlePublish"
              type="button"
              :disabled="loading"
              class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Icon :icon="loading ? 'lucide:loader-2' : 'lucide:upload'" :class="['w-4 h-4', { 'animate-spin': loading }]" />
              {{ loading ? 'Publicando...' : 'Publicar Flow' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
