<template>
  <div class="connections-view min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Conexões Google
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Gerencie suas conexões com Google Analytics e Google Sheets
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="connectionStore.loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="mt-4 text-gray-600 dark:text-gray-400">Carregando conexões...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="connectionStore.error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
        <div class="flex items-center">
          <span class="text-red-600 dark:text-red-400 text-xl mr-3">⚠️</span>
          <div>
            <h3 class="text-red-800 dark:text-red-300 font-semibold">Erro ao carregar conexões</h3>
            <p class="text-red-600 dark:text-red-400 text-sm">{{ connectionStore.error }}</p>
          </div>
        </div>
      </div>

      <!-- Success Message -->
      <div v-if="callbackMessage" class="mb-6 p-4 rounded-lg" :class="callbackSuccess ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'">
        <div class="flex items-center">
          <span class="text-2xl mr-3">{{ callbackSuccess ? '✅' : '❌' }}</span>
          <p :class="callbackSuccess ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'">
            {{ callbackMessage }}
          </p>
        </div>
      </div>

      <!-- Google Analytics Section -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center">
            <span class="text-3xl mr-3">📊</span>
            <div>
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Google Analytics</h2>
              <p class="text-sm text-gray-600 dark:text-gray-400">Conecte suas propriedades do GA4</p>
            </div>
          </div>
        </div>

        <!-- Analytics Connections List -->
        <div v-if="analyticsConnections.length > 0" class="space-y-3 mb-4">
          <div
            v-for="conn in analyticsConnections"
            :key="conn.id"
            class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md"
          >
            <div class="flex items-center">
              <span class="text-green-500 mr-3">✓</span>
              <div>
                <p class="font-medium text-gray-900 dark:text-white">{{ conn.email || conn.accountEmail || conn.name || `Conexão ${conn.id?.substring(0, 8)}` }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  Conectado em {{ formatDate(conn.createdAt || conn.createdDate) }}
                </p>
              </div>
            </div>
            <button
              @click="handleRevoke(conn.id)"
              :disabled="revoking"
              class="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50"
            >
              Desconectar
            </button>
          </div>
        </div>

        <div v-else class="text-center py-6 text-gray-500 dark:text-gray-400 text-sm mb-4">
          Nenhuma conta conectada
        </div>

        <!-- Add Connection Button -->
        <button
          @click="handleConnect('analytics')"
          :disabled="connecting"
          class="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-md transition-colors disabled:cursor-not-allowed flex items-center justify-center"
        >
          <span class="mr-2">➕</span>
          {{ connecting ? 'Conectando...' : 'Adicionar conta Google Analytics' }}
        </button>
      </div>

      <!-- Google Sheets Section -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center">
            <span class="text-3xl mr-3">📗</span>
            <div>
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Google Sheets</h2>
              <p class="text-sm text-gray-600 dark:text-gray-400">Acesse suas planilhas do Google</p>
            </div>
          </div>
        </div>

        <!-- Sheets Connections List -->
        <div v-if="sheetsConnections.length > 0" class="space-y-3 mb-4">
          <div
            v-for="conn in sheetsConnections"
            :key="conn.id"
            class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md"
          >
            <div class="flex items-center">
              <span class="text-green-500 mr-3">✓</span>
              <div>
                <p class="font-medium text-gray-900 dark:text-white">{{ conn.email || conn.accountEmail || conn.name || `Conexão ${conn.id?.substring(0, 8)}` }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  Conectado em {{ formatDate(conn.createdAt || conn.createdDate) }}
                </p>
              </div>
            </div>
            <button
              @click="handleRevoke(conn.id)"
              :disabled="revoking"
              class="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50"
            >
              Desconectar
            </button>
          </div>
        </div>

        <div v-else class="text-center py-6 text-gray-500 dark:text-gray-400 text-sm mb-4">
          Nenhuma conta conectada
        </div>

        <!-- Add Connection Button -->
        <button
          @click="handleConnect('sheets')"
          :disabled="connecting"
          class="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-md transition-colors disabled:cursor-not-allowed flex items-center justify-center"
        >
          <span class="mr-2">➕</span>
          {{ connecting ? 'Conectando...' : 'Adicionar conta Google Sheets' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useConnectionStore } from '../stores/connectionStore'
import { useFlowStore } from '../stores/flowStore'

const connectionStore = useConnectionStore()
const flowStore = useFlowStore()
const route = useRoute()

const connecting = ref(false)
const revoking = ref(false)
const callbackMessage = ref('')
const callbackSuccess = ref(false)

// Computed
const analyticsConnections = computed(() => connectionStore.getAnalyticsConnections)
const sheetsConnections = computed(() => connectionStore.getSheetsConnections)

// Methods
const handleConnect = async (serviceType) => {
  connecting.value = true
  try {
    await connectionStore.connectGoogle(serviceType, flowStore.apiConfig)
  } catch (error) {
    alert(`Erro ao conectar: ${error.message}`)
  } finally {
    connecting.value = false
  }
}

const handleRevoke = async (connectionId) => {
  if (!confirm('Tem certeza que deseja desconectar esta conta?')) {
    return
  }

  revoking.value = true
  try {
    await connectionStore.revokeConnection(connectionId, flowStore.apiConfig)
    callbackMessage.value = 'Conexão removida com sucesso!'
    callbackSuccess.value = true
    setTimeout(() => {
      callbackMessage.value = ''
    }, 3000)
  } catch (error) {
    alert(`Erro ao desconectar: ${error.message}`)
  } finally {
    revoking.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'Data desconhecida'
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Lifecycle
onMounted(async () => {
  // Check for OAuth callback
  const queryParams = new URLSearchParams(window.location.search)
  const hasCallback = queryParams.has('success') || queryParams.has('error')

  if (hasCallback) {
    const result = connectionStore.handleOAuthCallback(queryParams)
    callbackMessage.value = result.message
    callbackSuccess.value = result.success

    // Limpar query params da URL
    window.history.replaceState({}, document.title, window.location.pathname)

    // Auto-hide message após 5s
    setTimeout(() => {
      callbackMessage.value = ''
    }, 5000)

    // Se houve callback de sucesso, aguardar 1s antes de buscar (para dar tempo do backend salvar)
    if (result.success) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  // Load connections (apenas uma vez)
  await connectionStore.fetchConnections(flowStore.apiConfig)
})
</script>

<style scoped>
/* Animação de entrada */
.connections-view {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
