import { ref, computed } from 'vue'
import api from '../utils/api.js'

const loading = ref(false)
const error = ref(null)

export function usePublicFlows() {
  /**
   * Lista flows públicos
   */
  async function listPublicFlows(filters = {}) {
    try {
      loading.value = true
      error.value = null

      const params = new URLSearchParams()

      if (filters.search) params.append('search', filters.search)
      if (filters.category) params.append('category', filters.category)
      if (filters.difficulty) params.append('difficulty', filters.difficulty)
      if (filters.tags && filters.tags.length > 0) params.append('tags', filters.tags.join(','))
      if (filters.verifiedOnly) params.append('verifiedOnly', 'true')
      if (filters.sortBy) params.append('sortBy', filters.sortBy)
      if (filters.page) params.append('page', filters.page)
      if (filters.limit) params.append('limit', filters.limit)

      const response = await api.get(`/public-flows?${params.toString()}`)
      return { success: true, ...response.data.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Erro ao carregar flows públicos'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtém detalhes de um flow público
   */
  async function getFlowDetails(flowId) {
    try {
      loading.value = true
      error.value = null

      const response = await api.get(`/public-flows/${flowId}`)
      return { success: true, ...response.data.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Erro ao carregar detalhes do flow'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Publica um flow
   */
  async function publishFlow(flowId, publicationData) {
    try {
      loading.value = true
      error.value = null

      const response = await api.post(`/public-flows/${flowId}/publish`, publicationData)
      return { success: true, data: response.data.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Erro ao publicar flow'
      const errorData = err.response?.data?.error?.data || {}
      return { success: false, error: error.value, ...errorData }
    } finally {
      loading.value = false
    }
  }

  /**
   * Despublica um flow
   */
  async function unpublishFlow(flowId) {
    try {
      loading.value = true
      error.value = null

      const response = await api.post(`/public-flows/${flowId}/unpublish`)
      return { success: true, data: response.data.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Erro ao despublicar flow'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Importa um flow público
   */
  async function importFlow(flowId) {
    try {
      loading.value = true
      error.value = null

      const response = await api.post(`/public-flows/${flowId}/import`)
      return { success: true, data: response.data.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Erro ao importar flow'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Cria um fork de um flow
   */
  async function forkFlow(flowId) {
    try {
      loading.value = true
      error.value = null

      const response = await api.post(`/public-flows/${flowId}/fork`)
      return { success: true, data: response.data.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Erro ao criar fork'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtém estatísticas da biblioteca pública
   */
  async function getLibraryStats() {
    try {
      const response = await api.get('/public-flows/stats')
      return { success: true, data: response.data.data }
    } catch (err) {
      return { success: false, error: 'Erro ao carregar estatísticas' }
    }
  }

  // ==================== REVIEWS ====================

  /**
   * Lista reviews de um flow
   */
  async function listReviews(flowId, options = {}) {
    try {
      const params = new URLSearchParams()
      if (options.sortBy) params.append('sortBy', options.sortBy)
      if (options.page) params.append('page', options.page)
      if (options.limit) params.append('limit', options.limit)
      if (options.minRating) params.append('minRating', options.minRating)

      const response = await api.get(`/public-flows/${flowId}/reviews?${params.toString()}`)
      return { success: true, ...response.data.data }
    } catch (err) {
      return { success: false, error: 'Erro ao carregar reviews' }
    }
  }

  /**
   * Cria uma review
   */
  async function createReview(flowId, reviewData) {
    try {
      loading.value = true
      error.value = null

      const response = await api.post(`/public-flows/${flowId}/reviews`, reviewData)
      return { success: true, data: response.data.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Erro ao criar review'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Atualiza uma review
   */
  async function updateReview(reviewId, reviewData) {
    try {
      loading.value = true
      error.value = null

      const response = await api.put(`/public-flows/reviews/${reviewId}`, reviewData)
      return { success: true, data: response.data.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Erro ao atualizar review'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Deleta uma review
   */
  async function deleteReview(reviewId) {
    try {
      loading.value = true
      error.value = null

      await api.delete(`/public-flows/reviews/${reviewId}`)
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || 'Erro ao deletar review'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Marca review como útil
   */
  async function markReviewHelpful(reviewId) {
    try {
      const response = await api.post(`/public-flows/reviews/${reviewId}/helpful`)
      return { success: true, data: response.data.data }
    } catch (err) {
      return { success: false, error: 'Erro ao marcar review' }
    }
  }

  /**
   * Obtém review do usuário para um flow
   */
  async function getUserReview(flowId) {
    try {
      const response = await api.get(`/public-flows/${flowId}/reviews/me`)
      return { success: true, data: response.data.data }
    } catch (err) {
      return { success: false, error: 'Erro ao carregar review' }
    }
  }

  // ==================== REPORTS ====================

  /**
   * Reporta um flow
   */
  async function reportFlow(flowId, reportData) {
    try {
      loading.value = true
      error.value = null

      const response = await api.post(`/public-flows/${flowId}/report`, reportData)
      return { success: true, data: response.data.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Erro ao reportar flow'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  return {
    loading: computed(() => loading.value),
    error: computed(() => error.value),

    // Public flows
    listPublicFlows,
    getFlowDetails,
    publishFlow,
    unpublishFlow,
    importFlow,
    forkFlow,
    getLibraryStats,

    // Reviews
    listReviews,
    createReview,
    updateReview,
    deleteReview,
    markReviewHelpful,
    getUserReview,

    // Reports
    reportFlow
  }
}
