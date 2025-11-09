<template>
  <div class="property-select space-y-2">
    <!-- Property Dropdown + Refresh Button -->
    <div class="flex items-center gap-2">
      <!-- Property Dropdown -->
      <select
        v-if="properties.length > 0 && !loading"
        :value="modelValue"
        @change="handleChange"
        class="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Selecione uma propriedade...</option>
        <option
          v-for="property in properties"
          :key="property.id"
          :value="property.id"
        >
          {{ property.name }} ({{ property.accountName }}) - ID: {{ property.id }}
        </option>
      </select>

      <!-- Loading State -->
      <div v-else-if="loading" class="flex-1 text-center py-2 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-600">
        <p class="text-xs text-gray-600 dark:text-gray-400">
          Carregando...
        </p>
      </div>

      <!-- No Properties State -->
      <div v-else-if="!loading && properties.length === 0 && connectionId" class="flex-1 text-center py-2 bg-gray-50 dark:bg-gray-800 rounded-md border border-dashed border-gray-300 dark:border-gray-600">
        <p class="text-xs text-gray-600 dark:text-gray-400">
          Nenhuma propriedade encontrada
        </p>
      </div>

      <!-- No Connection State -->
      <div v-else-if="!connectionId" class="flex-1 text-center py-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-md border border-yellow-200 dark:border-yellow-800">
        <p class="text-xs text-yellow-700 dark:text-yellow-400">
          Conecte uma conta primeiro
        </p>
      </div>

      <!-- Refresh Icon Button -->
      <button
        v-if="properties.length > 0 && !loading"
        @click="loadProperties"
        type="button"
        :disabled="refreshing"
        class="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        :class="{ 'animate-spin': refreshing }"
        title="Recarregar propriedades"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>

    <!-- Error State -->
    <div v-if="error" class="py-3 px-4 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800">
      <p class="text-sm text-red-600 dark:text-red-400 mb-2">
        {{ error }}
      </p>

      <!-- Instruções específicas para API não habilitada -->
      <div v-if="error.includes('não está habilitada') || error.includes('has not been used')" class="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-xs text-blue-800 dark:text-blue-300">
        <p class="font-semibold mb-2">🔧 Como habilitar a Google Analytics Admin API:</p>
        <ol class="list-decimal list-inside space-y-1 ml-2">
          <li>Acesse o <strong>Google Cloud Console</strong> no link do erro acima</li>
          <li>Faça login com sua conta Google</li>
          <li>Clique no botão <strong>"ENABLE"</strong> (Ativar)</li>
          <li>Aguarde <strong>5 minutos</strong> para propagação</li>
          <li>Volte aqui e clique em "Tentar novamente"</li>
        </ol>
        <p class="mt-2 text-xs italic">
          💡 Isso é necessário apenas uma vez. Após habilitar, você poderá selecionar propriedades automaticamente.
        </p>
      </div>

      <!-- Instruções específicas para erro de permissão -->
      <div v-else-if="error.includes('reconectada') || error.includes('Permissão')" class="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs text-yellow-800 dark:text-yellow-300">
        <p class="font-semibold mb-2">ℹ️ Como reconectar sua conta:</p>
        <ol class="list-decimal list-inside space-y-1 ml-2">
          <li>Vá para a página de <strong>Integrações</strong></li>
          <li>Encontre sua conta Google Analytics</li>
          <li>Clique em <strong>Desconectar</strong></li>
          <li>Clique em <strong>Conectar Google Analytics</strong> novamente</li>
          <li>Autorize as novas permissões</li>
          <li>Volte aqui e tente novamente</li>
        </ol>
      </div>

      <button
        @click="loadProperties"
        class="mt-3 text-xs text-red-700 dark:text-red-400 underline hover:no-underline"
      >
        🔄 Tentar novamente
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useFlowStore } from '../../stores/flowStore'

const props = defineProps({
  connectionId: {
    type: String,
    default: ''
  },
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const flowStore = useFlowStore()

const properties = ref([])
const loading = ref(false)
const refreshing = ref(false)
const error = ref(null)

// Methods
const handleChange = (event) => {
  emit('update:modelValue', event.target.value)
}

const loadProperties = async () => {
  if (!props.connectionId) {
    properties.value = []
    return
  }

  loading.value = true
  refreshing.value = true
  error.value = null

  try {
    const baseUrl = flowStore.apiConfig?.baseUrl || import.meta.env.VITE_API_URL
    const token = flowStore.apiConfig?.token

    console.log('🔍 Carregando propriedades GA:', {
      connectionId: props.connectionId,
      baseUrl,
      hasToken: !!token
    })

    if (!token) {
      throw new Error('Token de autenticação não encontrado')
    }

    const url = `${baseUrl}/api/connectors/ga/properties?connectionId=${props.connectionId}`
    console.log('📡 Fazendo request para:', url)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      let errorMessage = `Erro HTTP ${response.status}`
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch (e) {
        // Ignore JSON parse error
      }
      throw new Error(errorMessage)
    }

    const data = await response.json()
    console.log('✅ Resposta recebida:', data)

    // Backend retorna: { success: true, data: { properties: [...] } }
    properties.value = data.data?.properties || []
    console.log('📊 Propriedades carregadas:', properties.value.length)

    // Se havia uma propriedade selecionada mas ela não existe mais na lista, limpar seleção
    if (props.modelValue && !properties.value.find(p => p.id === props.modelValue)) {
      emit('update:modelValue', '')
    }

  } catch (err) {
    // Garantir que error seja sempre uma string legível
    if (err instanceof Error) {
      error.value = err.message
    } else if (typeof err === 'string') {
      error.value = err
    } else if (err && err.message) {
      error.value = err.message
    } else {
      error.value = 'Erro ao carregar propriedades. Tente novamente.'
    }
    properties.value = []
    console.error('Erro ao carregar propriedades GA:', err)
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

// Watch connectionId changes
watch(() => props.connectionId, (newConnectionId, oldConnectionId) => {
  console.log('🔄 ConnectionId mudou:', { old: oldConnectionId, new: newConnectionId, type: typeof newConnectionId })

  if (newConnectionId !== oldConnectionId) {
    // Limpar seleção quando a conexão muda
    emit('update:modelValue', '')

    // Carregar novas propriedades
    if (newConnectionId) {
      loadProperties()
    } else {
      properties.value = []
    }
  }
})

// Load on mount if connectionId is already set
onMounted(() => {
  if (props.connectionId) {
    loadProperties()
  }
})
</script>

<style scoped>
.property-select {
  /* Custom styles if needed */
}
</style>
