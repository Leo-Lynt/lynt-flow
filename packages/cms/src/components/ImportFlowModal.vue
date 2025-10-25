<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { usePublicFlows } from '../composables/usePublicFlows.js'

const props = defineProps({
  show: Boolean,
  flow: Object
})

const emit = defineEmits(['close', 'imported'])

const router = useRouter()
const { importFlow, forkFlow, loading } = usePublicFlows()

const importType = ref('import') // 'import' or 'fork'
const error = ref('')
const success = ref(false)

async function handleImport() {
  error.value = ''
  success.value = false

  let result
  if (importType.value === 'fork') {
    result = await forkFlow(props.flow._id)
  } else {
    result = await importFlow(props.flow._id)
  }

  if (result.success) {
    success.value = true
    emit('imported', result.data)
    setTimeout(() => {
      router.push(`/flows/${result.data._id}/edit`)
    }, 1500)
  } else {
    error.value = result.error
  }
}

function close() {
  importType.value = 'import'
  error.value = ''
  success.value = false
  emit('close')
}
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
      <!-- Overlay -->
      <div class="fixed inset-0 transition-opacity bg-gray-900/50 backdrop-blur-sm" @click="close"></div>

      <!-- Modal -->
      <div class="relative inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl">
        <!-- Success State -->
        <div v-if="success" class="text-center py-8">
          <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-brand-green/10 border border-brand-green/30 mb-4">
            <Icon icon="lucide:check-circle" class="w-10 h-10 text-brand-green" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2 tracking-wide">
            {{ importType === 'fork' ? 'Fork criado com sucesso!' : 'Flow importado com sucesso!' }}
          </h3>
          <p class="text-gray-600 tracking-wide">
            Redirecionando para o editor...
          </p>
        </div>

        <!-- Main Content -->
        <div v-else>
          <!-- Header -->
          <div class="flex items-start justify-between mb-6">
            <div>
              <h3 class="text-2xl font-bold text-gray-900 mb-2 tracking-wide">
                Importar Flow
              </h3>
              <p class="text-gray-600 tracking-wide">{{ flow?.name }}</p>
            </div>
            <button @click="close" class="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-1 rounded transition-all">
              <Icon icon="lucide:x" class="w-6 h-6" />
            </button>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="mb-6 p-4 bg-brand-red/10 border border-brand-red/30 rounded-lg">
            <div class="flex items-start">
              <Icon icon="lucide:alert-circle" class="w-5 h-5 text-brand-red mt-0.5 mr-2" />
              <p class="text-brand-red">{{ error }}</p>
            </div>
          </div>

          <!-- Flow Preview -->
          <div class="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-gradient-to-br from-brand-purple to-brand-pink rounded-lg flex items-center justify-center">
                  <Icon icon="lucide:workflow" class="w-6 h-6 text-white" />
                </div>
              </div>
              <div class="flex-1">
                <h4 class="font-semibold text-gray-900 mb-1">{{ flow?.name }}</h4>
                <p class="text-sm text-gray-600 mb-2">{{ flow?.description }}</p>
                <div class="flex items-center gap-4 text-sm text-gray-500">
                  <span class="flex items-center gap-1">
                    <Icon icon="lucide:user" class="w-4 h-4" />
                    {{ flow?.publicMetadata?.author?.name }}
                  </span>
                  <span class="flex items-center gap-1">
                    <Icon icon="lucide:download" class="w-4 h-4" />
                    {{ flow?.publicStats?.imports || 0 }} imports
                  </span>
                  <span class="flex items-center gap-1">
                    <Icon icon="lucide:star" class="w-4 h-4 text-yellow-500" />
                    {{ flow?.publicStats?.averageRating?.toFixed(1) || 0 }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Import Type Selection -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-3">
              Escolha o tipo de importação:
            </label>
            <div class="space-y-3">
              <label
                class="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:border-brand-purple/50 transition-colors"
                :class="importType === 'import' ? 'border-brand-purple bg-brand-purple/5' : 'border-gray-200'"
              >
                <input
                  v-model="importType"
                  type="radio"
                  value="import"
                  class="mt-1 w-5 h-5 text-brand-purple accent-brand-purple"
                />
                <div class="ml-3 flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <Icon icon="lucide:download" class="w-5 h-5 text-brand-purple" />
                    <p class="font-medium text-gray-900">Importar (recomendado)</p>
                  </div>
                  <p class="text-sm text-gray-600">
                    Cria uma cópia independente do flow. Você não receberá atualizações do original.
                  </p>
                </div>
              </label>

              <label
                v-if="flow?.publicMetadata?.allowForking"
                class="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:border-brand-pink/50 transition-colors"
                :class="importType === 'fork' ? 'border-brand-pink bg-brand-pink/5' : 'border-gray-200'"
              >
                <input
                  v-model="importType"
                  type="radio"
                  value="fork"
                  class="mt-1 w-5 h-5 text-brand-pink accent-brand-pink"
                />
                <div class="ml-3 flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <Icon icon="lucide:git-fork" class="w-5 h-5 text-brand-pink" />
                    <p class="font-medium text-gray-900">Fork</p>
                  </div>
                  <p class="text-sm text-gray-600">
                    Cria um fork mantendo referência ao original. Você será notificado de atualizações.
                  </p>
                </div>
              </label>

              <div v-if="!flow?.publicMetadata?.allowForking" class="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p class="text-sm text-gray-600 flex items-center gap-2">
                  <Icon icon="lucide:info" class="w-4 h-4" />
                  Este flow não permite forks. Apenas importação está disponível.
                </p>
              </div>
            </div>
          </div>

          <!-- Warnings/Info -->
          <div class="mb-6 space-y-3">
            <div class="bg-brand-orange/10 border border-brand-orange/30 rounded-lg p-4">
              <div class="flex items-start">
                <Icon icon="lucide:alert-triangle" class="w-5 h-5 text-brand-orange mt-0.5 mr-2 flex-shrink-0" />
                <div class="text-sm text-gray-700">
                  <p class="font-medium mb-1 text-brand-orange">Importante:</p>
                  <ul class="list-disc list-inside space-y-1">
                    <li>Você precisará configurar suas próprias credenciais (API keys, senhas, etc.)</li>
                    <li>O flow importado será privado e não afetará o original</li>
                    <li v-if="flow?.publicMetadata?.requireAttribution">Este flow requer atribuição ao autor original</li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="bg-brand-purple/10 border border-brand-purple/30 rounded-lg p-4">
              <div class="flex items-start">
                <Icon icon="lucide:scale" class="w-5 h-5 text-brand-purple mt-0.5 mr-2 flex-shrink-0" />
                <div class="text-sm text-gray-700">
                  <p class="font-medium mb-1 text-brand-purple">Licença: {{ flow?.publicMetadata?.license || 'MIT' }}</p>
                  <p>Este flow está licenciado sob {{ flow?.publicMetadata?.license || 'MIT License' }}.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer Buttons -->
          <div class="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              @click="close"
              type="button"
              class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-all"
            >
              Cancelar
            </button>
            <button
              @click="handleImport"
              type="button"
              :disabled="loading"
              class="px-6 py-2 bg-brand-purple text-white rounded-lg hover:brightness-110 disabled:opacity-50 flex items-center gap-2 font-medium transition-all"
            >
              <Icon
                :icon="loading ? 'lucide:loader-2' : (importType === 'fork' ? 'lucide:git-fork' : 'lucide:download')"
                :class="['w-4 h-4', { 'animate-spin': loading }]"
              />
              {{ loading ? 'Importando...' : (importType === 'fork' ? 'Criar Fork' : 'Importar Flow') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
