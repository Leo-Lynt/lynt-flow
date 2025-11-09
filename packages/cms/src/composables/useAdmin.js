import { ref } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

export function useAdmin() {
  const loading = ref(false)
  const error = ref(null)

  // ==================== USER MANAGEMENT ====================

  /**
   * Lista todos os usuários
   */
  async function listUsers(filters = {}) {
    loading.value = true
    error.value = null

    try {
      const token = localStorage.getItem('accessToken')
      const params = new URLSearchParams()

      if (filters.page) params.append('page', filters.page)
      if (filters.limit) params.append('limit', filters.limit)
      if (filters.role) params.append('role', filters.role)
      if (filters.search) params.append('search', filters.search)

      const response = await axios.get(`${API_URL}/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      return { success: true, ...response.data }
    } catch (err) {
      error.value = err.response?.data?.error?.message || 'Erro ao listar usuários'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtém estatísticas de usuários
   */
  async function getUserStats() {
    loading.value = true
    error.value = null

    try {
      const token = localStorage.getItem('accessToken')
      const response = await axios.get(`${API_URL}/api/admin/users/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      return { success: true, ...response.data }
    } catch (err) {
      error.value = err.response?.data?.error?.message || 'Erro ao buscar estatísticas'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtém detalhes de um usuário
   */
  async function getUserDetails(userId) {
    loading.value = true
    error.value = null

    try {
      const token = localStorage.getItem('accessToken')
      const response = await axios.get(`${API_URL}/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      return { success: true, ...response.data }
    } catch (err) {
      error.value = err.response?.data?.error?.message || 'Erro ao buscar usuário'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Atualiza o role de um usuário
   */
  async function updateUserRole(userId, role) {
    loading.value = true
    error.value = null

    try {
      const token = localStorage.getItem('accessToken')
      const response = await axios.put(
        `${API_URL}/api/admin/users/${userId}/role`,
        { role },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      return { success: true, ...response.data }
    } catch (err) {
      error.value = err.response?.data?.error?.message || 'Erro ao atualizar role'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Ativa ou desativa um usuário
   */
  async function toggleUserStatus(userId, isActive) {
    loading.value = true
    error.value = null

    try {
      const token = localStorage.getItem('accessToken')
      const response = await axios.put(
        `${API_URL}/api/admin/users/${userId}/status`,
        { isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      return { success: true, ...response.data }
    } catch (err) {
      error.value = err.response?.data?.error?.message || 'Erro ao alterar status'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Marca/desmarca usuário como criador verificado
   */
  async function toggleVerifiedCreator(userId, isVerified) {
    loading.value = true
    error.value = null

    try {
      const token = localStorage.getItem('accessToken')
      const response = await axios.put(
        `${API_URL}/api/admin/users/${userId}/verified-creator`,
        { isVerified },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      return { success: true, ...response.data }
    } catch (err) {
      error.value = err.response?.data?.error?.message || 'Erro ao alterar status de criador'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Atualiza o plano de um usuário
   */
  async function updateUserPlan(userId, planId) {
    loading.value = true
    error.value = null

    try {
      const token = localStorage.getItem('accessToken')
      const response = await axios.put(
        `${API_URL}/api/admin/users/${userId}/plan`,
        { planId },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      return { success: true, ...response.data }
    } catch (err) {
      error.value = err.response?.data?.error?.message || 'Erro ao atualizar plano'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // ==================== FLOW MODERATION ====================

  /**
   * Lista flows pendentes de aprovação
   */
  async function listPendingFlows(page = 1, limit = 20) {
    loading.value = true
    error.value = null

    try {
      const token = localStorage.getItem('accessToken')
      const response = await axios.get(
        `${API_URL}/api/public-flows/moderation/pending?page=${page}&limit=${limit}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      return { success: true, ...response.data }
    } catch (err) {
      error.value = err.response?.data?.error?.message || 'Erro ao listar flows pendentes'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Lista reports de flows
   */
  async function listReports(filters = {}) {
    loading.value = true
    error.value = null

    try {
      const token = localStorage.getItem('accessToken')
      const params = new URLSearchParams()

      if (filters.status) params.append('status', filters.status)
      if (filters.page) params.append('page', filters.page)
      if (filters.limit) params.append('limit', filters.limit)

      const response = await axios.get(
        `${API_URL}/api/public-flows/moderation/reports?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      return { success: true, ...response.data }
    } catch (err) {
      error.value = err.response?.data?.error?.message || 'Erro ao listar reports'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Aprova um flow
   */
  async function approveFlow(flowId, notes = '') {
    loading.value = true
    error.value = null

    try {
      const token = localStorage.getItem('accessToken')
      const response = await axios.post(
        `${API_URL}/api/public-flows/moderation/${flowId}/approve`,
        { notes },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      return { success: true, ...response.data }
    } catch (err) {
      error.value = err.response?.data?.error?.message || 'Erro ao aprovar flow'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Rejeita um flow
   */
  async function rejectFlow(flowId, reason) {
    loading.value = true
    error.value = null

    try {
      const token = localStorage.getItem('accessToken')
      const response = await axios.post(
        `${API_URL}/api/public-flows/moderation/${flowId}/reject`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      return { success: true, ...response.data }
    } catch (err) {
      error.value = err.response?.data?.error?.message || 'Erro ao rejeitar flow'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Verifica um flow (adiciona badge verificado)
   */
  async function verifyFlow(flowId) {
    loading.value = true
    error.value = null

    try {
      const token = localStorage.getItem('accessToken')
      const response = await axios.post(
        `${API_URL}/api/public-flows/moderation/${flowId}/verify`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )

      return { success: true, ...response.data }
    } catch (err) {
      error.value = err.response?.data?.error?.message || 'Erro ao verificar flow'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Resolve um report
   */
  async function resolveReport(reportId, action, reviewNotes = '') {
    loading.value = true
    error.value = null

    try {
      const token = localStorage.getItem('accessToken')
      const response = await axios.post(
        `${API_URL}/api/public-flows/moderation/reports/${reportId}/resolve`,
        { action, reviewNotes },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      return { success: true, ...response.data }
    } catch (err) {
      error.value = err.response?.data?.error?.message || 'Erro ao resolver report'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtém estatísticas de moderação
   */
  async function getModerationStats() {
    loading.value = true
    error.value = null

    try {
      const token = localStorage.getItem('accessToken')
      const response = await axios.get(
        `${API_URL}/api/public-flows/moderation/stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      return { success: true, ...response.data }
    } catch (err) {
      error.value = err.response?.data?.error?.message || 'Erro ao buscar estatísticas'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Lista todos os flows públicos aprovados (moderadores)
   */
  async function listAllPublicFlows(filters = {}) {
    loading.value = true
    error.value = null

    try {
      const token = localStorage.getItem('accessToken')
      const params = new URLSearchParams()

      if (filters.search) params.append('search', filters.search)
      if (filters.category) params.append('category', filters.category)
      if (filters.verified !== undefined) params.append('verified', filters.verified)
      if (filters.sortBy) params.append('sortBy', filters.sortBy)
      if (filters.page) params.append('page', filters.page)
      if (filters.limit) params.append('limit', filters.limit)

      const response = await axios.get(
        `${API_URL}/api/public-flows/moderation/all-flows?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      return { success: true, ...response.data }
    } catch (err) {
      error.value = err.response?.data?.error?.message || 'Erro ao listar flows'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Remove verificação de um flow (moderadores)
   */
  async function unverifyFlow(flowId) {
    loading.value = true
    error.value = null

    try {
      const token = localStorage.getItem('accessToken')
      const response = await axios.post(
        `${API_URL}/api/public-flows/moderation/${flowId}/unverify`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )

      return { success: true, ...response.data }
    } catch (err) {
      error.value = err.response?.data?.error?.message || 'Erro ao remover verificação'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Move flow para quarentena (moderadores)
   */
  async function quarantineFlow(flowId, reason = '') {
    loading.value = true
    error.value = null

    try {
      const token = localStorage.getItem('accessToken')
      const response = await axios.post(
        `${API_URL}/api/public-flows/moderation/${flowId}/quarantine`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      return { success: true, ...response.data }
    } catch (err) {
      error.value = err.response?.data?.error?.message || 'Erro ao mover para quarentena'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,

    // User management
    listUsers,
    getUserStats,
    getUserDetails,
    updateUserRole,
    toggleUserStatus,
    toggleVerifiedCreator,
    updateUserPlan,

    // Flow moderation
    listPendingFlows,
    listReports,
    listAllPublicFlows,
    approveFlow,
    rejectFlow,
    verifyFlow,
    unverifyFlow,
    quarantineFlow,
    resolveReport,
    getModerationStats
  }
}
