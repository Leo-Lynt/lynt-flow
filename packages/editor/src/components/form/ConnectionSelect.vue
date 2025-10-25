<template>
  <div class="connection-select space-y-2">
    <!-- Connection dropdown -->
    <div v-if="availableConnections.length > 0">
      <select
        :value="modelValue"
        @change="handleChange"
        class="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Selecione uma conexão...</option>
        <option
          v-for="conn in availableConnections"
          :key="conn.id"
          :value="conn.id"
        >
          {{ conn.email || conn.accountEmail || conn.name || `Conexão ${conn.id?.substring(0, 8)}` }}
        </option>
      </select>
    </div>

    <!-- No connections state -->
    <div v-else class="text-center py-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-dashed border-gray-300 dark:border-gray-600">
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
        Nenhuma conexão {{ serviceLabel }} disponível
      </p>
    </div>

    <!-- Add connection button -->
    <button
      @click="handleAddConnection"
      :disabled="connecting"
      type="button"
      class="w-full px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
    >
      <span class="mr-2">{{ availableConnections.length > 0 ? '➕' : '🔗' }}</span>
      {{ connecting ? 'Conectando...' : `${availableConnections.length > 0 ? 'Adicionar' : 'Conectar'} ${serviceLabel}` }}
    </button>

    <!-- Refresh button (if connections exist) -->
    <button
      v-if="availableConnections.length > 0"
      @click="refreshConnections"
      :disabled="refreshing"
      type="button"
      class="w-full px-2 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
    >
      {{ refreshing ? 'Atualizando...' : '🔄 Atualizar lista' }}
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useConnectionStore } from '../../stores/connectionStore'
import { useFlowStore } from '../../stores/flowStore'

const props = defineProps({
  serviceType: {
    type: String,
    required: true,
    validator: (value) => ['analytics', 'sheets'].includes(value)
  },
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const connectionStore = useConnectionStore()
const flowStore = useFlowStore()

const connecting = ref(false)
const refreshing = ref(false)

// Computed
const availableConnections = computed(() => {
  return props.serviceType === 'analytics'
    ? connectionStore.getAnalyticsConnections
    : connectionStore.getSheetsConnections
})

const serviceLabel = computed(() => {
  return props.serviceType === 'analytics'
    ? 'Google Analytics'
    : 'Google Sheets'
})

// Methods
const handleChange = (event) => {
  emit('update:modelValue', event.target.value)
}

const handleAddConnection = async () => {
  connecting.value = true
  try {
    await connectionStore.connectGoogle(props.serviceType, flowStore.apiConfig)
  } catch (error) {
    alert(`Erro ao conectar: ${error.message}`)
  } finally {
    connecting.value = false
  }
}

const refreshConnections = async () => {
  refreshing.value = true
  try {
    await connectionStore.fetchConnections(flowStore.apiConfig)
  } catch (error) {
  } finally {
    refreshing.value = false
  }
}

// Lifecycle
onMounted(async () => {
  // Load connections if not loaded yet
  if (connectionStore.connections.length === 0) {
    await connectionStore.fetchConnections(flowStore.apiConfig)
  }
})
</script>

<style scoped>
.connection-select {
  /* Custom styles if needed */
}
</style>
