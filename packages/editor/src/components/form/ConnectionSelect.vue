<template>
  <div class="connection-select space-y-2">
    <!-- Connection dropdown + Refresh Button -->
    <div class="flex items-center gap-2">
      <!-- Connection dropdown -->
      <select
        v-if="availableConnections.length > 0"
        :value="modelValue"
        @change="handleChange"
        class="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Selecione uma conexão...</option>
        <option
          v-for="conn in availableConnections"
          :key="conn.id || conn._id || Math.random()"
          :value="conn.id || conn._id || conn.connectionId"
        >
          {{ conn.email || conn.accountEmail || conn.name || `Conexão ${(conn.id || conn._id)?.substring(0, 8)}` }}
          {{ !conn.id && !conn._id ? ' (⚠️ SEM ID)' : '' }}
        </option>
      </select>

      <!-- No connections placeholder -->
      <div v-else class="flex-1 text-center py-2 bg-gray-50 dark:bg-gray-800 rounded-md border border-dashed border-gray-300 dark:border-gray-600">
        <p class="text-xs text-gray-600 dark:text-gray-400">
          Nenhuma conexão disponível
        </p>
      </div>

      <!-- Refresh Icon Button -->
      <button
        v-if="availableConnections.length > 0"
        @click="refreshConnections"
        type="button"
        :disabled="refreshing"
        class="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        :class="{ 'animate-spin': refreshing }"
        title="Recarregar conexões"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
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
  const value = event.target.value
  console.log('🔌 ConnectionSelect: Emitindo valor:', { value, type: typeof value })
  emit('update:modelValue', value)
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

  console.log('🔌 Conexões disponíveis:', availableConnections.value.map(c => ({
    id: c.id,
    email: c.email,
    serviceType: c.serviceType
  })))
})
</script>

<style scoped>
.connection-select {
  /* Custom styles if needed */
}
</style>
