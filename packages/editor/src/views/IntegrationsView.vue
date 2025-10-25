<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Integrations</h1>
        <p class="text-gray-600 dark:text-gray-400">Connect external services to use in your flows</p>
      </div>

      <!-- OAuth Success/Error Messages -->
      <div v-if="showSuccessMessage" class="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
            <FlowIcon icon="material-symbols:check-circle" :size="24" class="text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p class="font-medium text-green-900 dark:text-green-100">Successfully connected!</p>
            <p class="text-sm text-green-700 dark:text-green-300">{{ successEmail }}</p>
          </div>
        </div>
        <button @click="showSuccessMessage = false" class="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200">
          <FlowIcon icon="material-symbols:close" :size="20" />
        </button>
      </div>

      <div v-if="showErrorMessage" class="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center">
            <FlowIcon icon="material-symbols:error" :size="24" class="text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p class="font-medium text-red-900 dark:text-red-100">Connection failed</p>
            <p class="text-sm text-red-700 dark:text-red-300">{{ errorMessage }}</p>
          </div>
        </div>
        <button @click="showErrorMessage = false" class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200">
          <FlowIcon icon="material-symbols:close" :size="20" />
        </button>
      </div>

      <!-- Available Integrations -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Available Integrations</h2>

        <div class="space-y-3">
          <!-- Google Analytics -->
          <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                <FlowIcon icon="logos:google-analytics" :size="28" />
              </div>
              <div>
                <h3 class="font-medium text-gray-900 dark:text-gray-100">Google Analytics</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">Connect your Google Analytics properties</p>
              </div>
            </div>
            <button
              @click="connectGoogleAnalytics"
              :disabled="isConnecting"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <FlowIcon
                :icon="isConnecting ? 'material-symbols:hourglass-empty' : 'material-symbols:link'"
                :size="18"
              />
              {{ isConnecting ? 'Connecting...' : 'Connect' }}
            </button>
          </div>

          <!-- Google Sheets (disabled for now) -->
          <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 opacity-60">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
                <FlowIcon icon="logos:google-sheets" :size="28" />
              </div>
              <div>
                <h3 class="font-medium text-gray-900 dark:text-gray-100">Google Sheets</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">Coming soon</p>
              </div>
            </div>
            <button disabled class="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 rounded-lg font-medium cursor-not-allowed">
              Coming Soon
            </button>
          </div>
        </div>
      </div>

      <!-- Active Connections -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Your Connections</h2>

        <div v-if="loading" class="text-center py-8">
          <FlowIcon icon="material-symbols:hourglass-empty" :size="32" class="text-gray-400 animate-spin mx-auto mb-2" />
          <p class="text-gray-500 dark:text-gray-400">Loading connections...</p>
        </div>

        <div v-else-if="connections.length === 0" class="text-center py-8">
          <FlowIcon icon="material-symbols:cloud-off" :size="48" class="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p class="text-gray-500 dark:text-gray-400 mb-1">No connections yet</p>
          <p class="text-sm text-gray-400 dark:text-gray-500">Connect your first service above!</p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="connection in connections"
            :key="connection._id"
            class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
          >
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                <FlowIcon icon="logos:google-analytics" :size="28" />
              </div>
              <div>
                <h3 class="font-medium text-gray-900 dark:text-gray-100">{{ connection.name }}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">{{ connection.email }}</p>
                <div class="flex items-center gap-3 mt-1">
                  <span
                    :class="connection.isActive
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'"
                    class="text-xs font-medium flex items-center gap-1"
                  >
                    <span class="w-2 h-2 rounded-full" :class="connection.isActive ? 'bg-green-500' : 'bg-red-500'"></span>
                    {{ connection.isActive ? 'Active' : 'Inactive' }}
                  </span>
                  <span class="text-xs text-gray-500 dark:text-gray-400">
                    Expires: {{ formatDate(connection.expiresAt) }}
                  </span>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="testConnection(connection._id)"
                class="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded text-sm font-medium transition-colors"
              >
                Test
              </button>
              <button
                @click="disconnectConnection(connection._id)"
                class="px-3 py-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 rounded text-sm font-medium transition-colors"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFlowStore } from '../stores/flowStore'
import FlowIcon from '../components/Icon.vue'

const route = useRoute()
const router = useRouter()
const flowStore = useFlowStore()

const connections = ref([])
const loading = ref(true)
const isConnecting = ref(false)

const showSuccessMessage = ref(false)
const successEmail = ref('')
const showErrorMessage = ref(false)
const errorMessage = ref('')

onMounted(async () => {
  // Check for OAuth callback
  const success = route.query.success
  const error = route.query.error
  const email = route.query.email

  if (success === 'true') {
    showSuccessMessage.value = true
    successEmail.value = email || 'Unknown'

    // Clean URL
    router.replace({ query: {} })
  }

  if (error) {
    showErrorMessage.value = true
    errorMessage.value = error

    // Clean URL
    router.replace({ query: {} })
  }

  // Load connections
  await loadConnections()
})

const loadConnections = async () => {
  loading.value = true

  try {
    const apiUrl = flowStore.apiConfig.baseUrl || 'http://localhost:3001'
    const response = await fetch(`${apiUrl}/api/oauth/connections`, {
      headers: {
        'Authorization': `Bearer ${flowStore.apiConfig.token || localStorage.getItem('flowforge_token')}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to load connections')
    }

    const result = await response.json()
    connections.value = result.data?.connections || []

  } catch (error) {
  } finally {
    loading.value = false
  }
}

const connectGoogleAnalytics = async () => {
  isConnecting.value = true

  try {
    const apiUrl = flowStore.apiConfig.baseUrl || 'http://localhost:3001'
    const response = await fetch(`${apiUrl}/api/oauth/google_analytics/authorize`, {
      headers: {
        'Authorization': `Bearer ${flowStore.apiConfig.token || localStorage.getItem('flowforge_token')}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to get authorization URL')
    }

    const result = await response.json()

    // Redirect to Google OAuth
    window.location.href = result.data.authUrl

  } catch (error) {
    showErrorMessage.value = true
    errorMessage.value = error.message
    isConnecting.value = false
  }
}

const testConnection = async (connectionId) => {
  try {
    const apiUrl = flowStore.apiConfig.baseUrl || 'http://localhost:3001'
    const response = await fetch(`${apiUrl}/api/oauth/connections/${connectionId}/test`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${flowStore.apiConfig.token || localStorage.getItem('flowforge_token')}`
      }
    })

    const result = await response.json()

    if (result.success) {
      alert('✅ Connection is working!')
    } else {
      alert('❌ Connection test failed: ' + (result.error?.message || 'Unknown error'))
    }

  } catch (error) {
    alert('❌ Error: ' + error.message)
  }
}

const disconnectConnection = async (connectionId) => {
  if (!confirm('Are you sure you want to disconnect this service?')) return

  try {
    const apiUrl = flowStore.apiConfig.baseUrl || 'http://localhost:3001'
    const response = await fetch(`${apiUrl}/api/oauth/connections/${connectionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${flowStore.apiConfig.token || localStorage.getItem('flowforge_token')}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to disconnect')
    }

    // Reload connections
    await loadConnections()

  } catch (error) {
    alert('❌ Error: ' + error.message)
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>