import { ref, computed } from 'vue'
import api from '../utils/api.js'

export function useSchedules() {
  const schedules = ref([])
  const currentSchedule = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // List all schedules with filters
  async function getSchedules(params = {}) {
    try {
      loading.value = true
      error.value = null
      const response = await api.get('/schedules', { params })

      schedules.value = response.data.data || []

      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination
      }
    } catch (err) {
      error.value = err.response?.data?.error?.message || 'Error fetching schedules'
      return {
        success: false,
        error: error.value
      }
    } finally {
      loading.value = false
    }
  }

  // Get single schedule by ID
  async function getSchedule(id) {
    try {
      loading.value = true
      error.value = null
      const response = await api.get(`/schedules/${id}`)

      currentSchedule.value = response.data.data

      return {
        success: true,
        data: response.data.data
      }
    } catch (err) {
      error.value = err.response?.data?.error?.message || 'Error fetching schedule'
      return {
        success: false,
        error: error.value
      }
    } finally {
      loading.value = false
    }
  }

  // Create new schedule
  async function createSchedule(scheduleData) {
    try {
      loading.value = true
      error.value = null

      const payload = prepareSchedulePayload(scheduleData)
      const response = await api.post('/schedules', payload)

      const newSchedule = response.data.data
      schedules.value.unshift(newSchedule)

      return {
        success: true,
        data: newSchedule
      }
    } catch (err) {
      error.value = err.response?.data?.error?.message || 'Error creating schedule'
      return {
        success: false,
        error: error.value
      }
    } finally {
      loading.value = false
    }
  }

  // Update schedule
  async function updateSchedule(id, scheduleData) {
    try {
      loading.value = true
      error.value = null

      const payload = prepareSchedulePayload(scheduleData)
      const response = await api.put(`/schedules/${id}`, payload)

      const updatedSchedule = response.data.data
      const index = schedules.value.findIndex(s => s._id === id)
      if (index !== -1) {
        schedules.value[index] = updatedSchedule
      }

      currentSchedule.value = updatedSchedule

      return {
        success: true,
        data: updatedSchedule
      }
    } catch (err) {
      error.value = err.response?.data?.error?.message || 'Error updating schedule'
      return {
        success: false,
        error: error.value
      }
    } finally {
      loading.value = false
    }
  }

  // Delete schedule
  async function deleteSchedule(id) {
    try {
      loading.value = true
      error.value = null

      await api.delete(`/schedules/${id}`)

      schedules.value = schedules.value.filter(s => s._id !== id)

      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.error?.message || 'Error deleting schedule'
      return {
        success: false,
        error: error.value
      }
    } finally {
      loading.value = false
    }
  }

  // Enable schedule
  async function enableSchedule(id) {
    try {
      loading.value = true
      error.value = null

      const response = await api.post(`/schedules/${id}/enable`)

      const updatedSchedule = response.data.data
      const index = schedules.value.findIndex(s => s._id === id)
      if (index !== -1) {
        schedules.value[index] = updatedSchedule
      }

      return {
        success: true,
        data: updatedSchedule
      }
    } catch (err) {
      error.value = err.response?.data?.error?.message || 'Error enabling schedule'
      return {
        success: false,
        error: error.value
      }
    } finally {
      loading.value = false
    }
  }

  // Disable schedule
  async function disableSchedule(id) {
    try {
      loading.value = true
      error.value = null

      const response = await api.post(`/schedules/${id}/disable`)

      const updatedSchedule = response.data.data
      const index = schedules.value.findIndex(s => s._id === id)
      if (index !== -1) {
        schedules.value[index] = updatedSchedule
      }

      return {
        success: true,
        data: updatedSchedule
      }
    } catch (err) {
      error.value = err.response?.data?.error?.message || 'Error disabling schedule'
      return {
        success: false,
        error: error.value
      }
    } finally {
      loading.value = false
    }
  }

  // Helper function to prepare schedule payload based on type
  function prepareSchedulePayload(data) {
    const payload = {
      flowId: data.flowId,
      scheduleType: data.scheduleType,
      inputData: data.inputData || {}
    }

    // Add optional fields if present
    if (data.maxExecutions) payload.maxExecutions = data.maxExecutions
    if (data.expiresAt) payload.expiresAt = data.expiresAt

    // Add type-specific fields
    switch (data.scheduleType) {
      case 'interval':
        payload.intervalValue = data.intervalValue
        payload.intervalUnit = data.intervalUnit
        break

      case 'daily':
        payload.time = data.time
        payload.timezone = data.timezone || 'UTC'
        break

      case 'weekly':
        payload.daysOfWeek = data.daysOfWeek
        payload.time = data.time
        payload.timezone = data.timezone || 'UTC'
        break

      case 'monthly':
        payload.dayOfMonth = data.dayOfMonth
        payload.time = data.time
        payload.timezone = data.timezone || 'UTC'
        break

      case 'cron':
        payload.cronExpression = data.cronExpression
        payload.timezone = data.timezone || 'UTC'
        break
    }

    return payload
  }

  // Computed properties
  const activeSchedules = computed(() =>
    schedules.value.filter(s => s.enabled)
  )

  const pausedSchedules = computed(() =>
    schedules.value.filter(s => !s.enabled)
  )

  const totalSchedules = computed(() => schedules.value.length)

  return {
    schedules: computed(() => schedules.value),
    currentSchedule: computed(() => currentSchedule.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    activeSchedules,
    pausedSchedules,
    totalSchedules,

    getSchedules,
    getSchedule,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    enableSchedule,
    disableSchedule
  }
}
