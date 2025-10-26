/**
 * Connection Store
 * Gerencia conexões OAuth com serviços externos (Google Analytics, Sheets, etc)
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useConnectionStore = defineStore('connection', () => {
  // State
  const connections = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const getAnalyticsConnections = computed(() => {
    const filtered = connections.value.filter(conn => conn.serviceType === 'analytics')
    return filtered
  })

  const getSheetsConnections = computed(() => {
    const filtered = connections.value.filter(conn => conn.serviceType === 'sheets')
    return filtered
  })

  const hasAnalyticsConnection = computed(() => {
    return getAnalyticsConnections.value.length > 0
  })

  const hasSheetsConnection = computed(() => {
    return getSheetsConnections.value.length > 0
  })

  const getConnectionById = (id) => {
    return connections.value.find(conn => conn.id === id)
  }

  const getConnectionsByType = (serviceType) => {
    return connections.value.filter(conn => conn.serviceType === serviceType)
  }

  // Actions
  const fetchConnections = async (apiConfig) => {
    loading.value = true
    error.value = null

    try {
      const baseUrl = apiConfig?.baseUrl || import.meta.env.VITE_API_URL
      const token = apiConfig?.token

      if (!token) {
        connections.value = []
        return
      }

      const response = await fetch(`${baseUrl}/api/oauth/connections`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch connections: ${response.status}`)
      }

      const data = await response.json()

      // Backend pode retornar: { connections: [...] } ou { data: { connections: [...] } }
      let fetchedConnections = data.data?.connections || data.connections || []


      // Deduplicar por ID (caso a API retorne duplicadas)
      const uniqueConnections = []
      const seenIds = new Set()

      for (const conn of fetchedConnections) {
        // Tentar diferentes campos de ID
        const connId = conn.id || conn._id || conn.connectionId

        if (!connId) {
          uniqueConnections.push(conn) // Adicionar mesmo sem ID
          continue
        }

        if (!seenIds.has(connId)) {
          seenIds.add(connId)
          uniqueConnections.push(conn)
        } else {
        }
      }

      connections.value = uniqueConnections

    } catch (err) {
      error.value = err.message
      connections.value = []
    } finally {
      loading.value = false
    }
  }

  const connectGoogle = async (serviceType, apiConfig) => {
    loading.value = true
    error.value = null

    try {
      const baseUrl = apiConfig?.baseUrl || import.meta.env.VITE_API_URL
      const token = apiConfig?.token


      if (!token) {
        // Check localStorage fallback
        const fallbackToken = localStorage.getItem('LyntFlow_token')
        if (fallbackToken) {
          throw new Error('⚠️ Token não foi passado corretamente. Verifique que flowStore.apiConfig.token está configurado.')
        }
        throw new Error('⚠️ Token de autenticação não encontrado. Acesse a aplicação com ?accessToken=SEU_TOKEN&flowId=SEU_FLOW_ID')
      }

      // Mapear serviceType para scopes
      const scopesMap = {
        'analytics': 'analytics',
        'sheets': 'sheets'
      }

      const scopes = scopesMap[serviceType]
      if (!scopes) {
        throw new Error(`Tipo de serviço desconhecido: ${serviceType}`)
      }


      const url = `${baseUrl}/api/oauth/google/authorize?scopes=${scopes}&purpose=connection&serviceType=${serviceType}`

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

        if (response.status === 404) {
          throw new Error('❌ Rota OAuth não encontrada no backend. Verifique se o backend está atualizado e rodando.')
        } else if (response.status === 401) {
          throw new Error('❌ Token inválido ou expirado. Configure o token no flowStore.')
        } else {
          throw new Error(`❌ Falha ao iniciar OAuth: ${errorMessage}`)
        }
      }

      const data = await response.json()

      // Backend retorna: { success: true, data: { authUrl: "..." } }
      const authUrl = data.data?.authUrl || data.authUrl

      if (!authUrl) {
        throw new Error('⚠️ Backend não retornou URL de autorização. Verifique se a rota /api/oauth/google/authorize está implementada no backend.')
      }

      // Redirecionar para Google OAuth
      window.location.href = authUrl
    } catch (err) {
      error.value = err.message
      loading.value = false
      throw err
    }
  }

  const revokeConnection = async (connectionId, apiConfig) => {
    loading.value = true
    error.value = null

    try {
      const baseUrl = apiConfig?.baseUrl || import.meta.env.VITE_API_URL
      const token = apiConfig?.token

      if (!token) {
        throw new Error('Authentication token required')
      }

      const response = await fetch(`${baseUrl}/api/oauth/connections/${connectionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to revoke connection: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        // Remover da lista local
        connections.value = connections.value.filter(conn => conn.id !== connectionId)
      } else {
        throw new Error(data.error || 'Failed to revoke connection')
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const handleOAuthCallback = (queryParams) => {
    const success = queryParams.get('success') === 'true'
    const serviceType = queryParams.get('serviceType')
    const email = queryParams.get('email')
    const errorMsg = queryParams.get('error')

    if (success && serviceType && email) {
      return {
        success: true,
        message: `Google ${serviceType === 'analytics' ? 'Analytics' : 'Sheets'} conectado com sucesso!`,
        serviceType,
        email
      }
    } else if (errorMsg) {
      return {
        success: false,
        message: `Erro ao conectar: ${errorMsg}`
      }
    } else {
      return {
        success: false,
        message: 'Erro desconhecido ao conectar'
      }
    }
  }

  return {
    // State
    connections,
    loading,
    error,

    // Getters
    getAnalyticsConnections,
    getSheetsConnections,
    hasAnalyticsConnection,
    hasSheetsConnection,
    getConnectionById,
    getConnectionsByType,

    // Actions
    fetchConnections,
    connectGoogle,
    revokeConnection,
    handleOAuthCallback
  }
})
