import { computed, ref } from 'vue'
import api from '../utils/api.js'

const overview = ref(null)
const loading = ref(false)
const error = ref(null)
let overviewPromise = null

export function useDashboard() {
  async function getOverview(force = false) {
    if (!force && overview.value) {
      return { success: true, data: overview.value }
    }

    if (!force && overviewPromise) {
      return overviewPromise
    }

    if (force) {
      overviewPromise = null
    }

    overviewPromise = (async () => {
      try {
        loading.value = true
        error.value = null
        const response = await api.get('/dashboard/overview')
        const data = response.data.data || response.data
        overview.value = data
        return { success: true, data }
      } catch (err) {
        error.value = err.response?.data?.message || 'Erro ao carregar dashboard'
        return {
          success: false,
          error: error.value
        }
      } finally {
        loading.value = false
        overviewPromise = null
      }
    })()

    return overviewPromise
  }

  return {
    overview: computed(() => overview.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    getOverview
  }
}
