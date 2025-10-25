import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '../utils/api.js'

// Global state
const user = ref(null)
const accessToken = ref(localStorage.getItem('accessToken'))
const refreshToken = ref(localStorage.getItem('refreshToken'))
const loading = ref(false)
let profilePromise = null

export function useAuth() {
  const router = useRouter()

  const isAuthenticated = computed(() => !!accessToken.value)

  function setTokens(newAccessToken, newRefreshToken) {
    accessToken.value = newAccessToken
    refreshToken.value = newRefreshToken
    localStorage.setItem('accessToken', newAccessToken)
    localStorage.setItem('refreshToken', newRefreshToken)
  }

  function clearAuth() {
    user.value = null
    accessToken.value = null
    refreshToken.value = null
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }

  async function login(email, password) {
    try {
      loading.value = true
      const response = await api.post('/auth/login', { email, password })

      // Extract data from the correct API response structure
      const { data } = response.data

      // Verificar se 2FA é necessário
      if (data.requires2FA) {
        return {
          success: true,
          requires2FA: true,
          tempToken: data.tempToken
        }
      }

      // Login normal (sem 2FA)
      const { user: userData, tokens } = data
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = tokens

      user.value = userData
      setTokens(newAccessToken, newRefreshToken)

      router.push('/dashboard')
      return { success: true }
    } catch (error) {
      const errorData = error.response?.data?.error || {}
      const errorMessage = error.response?.data?.message || errorData.message || 'Erro ao fazer login'
      const attemptsInfo = errorData.data || null

      return {
        success: false,
        error: errorMessage,
        attemptsInfo
      }
    } finally {
      loading.value = false
    }
  }

  async function verify2FALogin(tempToken, code) {
    try {
      loading.value = true
      const response = await api.post('/auth/2fa/login', {
        tempToken,
        token: code
      })

      // Extract data from the correct API response structure
      const { data } = response.data
      const { user: userData, tokens } = data
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = tokens

      user.value = userData
      setTokens(newAccessToken, newRefreshToken)

      // Aguardar um momento para garantir que localStorage foi atualizado
      await new Promise(resolve => setTimeout(resolve, 50))

      // Usar window.location para forçar navegação e evitar problemas com guards
      window.location.href = '/dashboard'
      return { success: true }
    } catch (error) {
      const errorData = error.response?.data?.error || {}
      const errorMessage = error.response?.data?.message || errorData.message || 'Código inválido ou expirado'
      const attemptsInfo = errorData.data || null

      return {
        success: false,
        error: errorMessage,
        attemptsInfo
      }
    } finally {
      loading.value = false
    }
  }

  async function register(name, email, password) {
    try {
      loading.value = true
      const response = await api.post('/auth/register', { name, email, password })

      // Extract data from the correct API response structure
      const { data } = response.data
      const { user: userData, tokens } = data
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = tokens

      user.value = userData
      setTokens(newAccessToken, newRefreshToken)

      router.push('/dashboard')
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao criar conta'
      }
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      // Skip API call for now since there's no backend
      // await api.post('/auth/logout')
    } catch (error) {
    } finally {
      clearAuth()
      router.push('/login')
    }
  }

  async function getProfile(force = false) {
    if (!force && user.value) {
      return { success: true, data: user.value }
    }

    if (!force && profilePromise) {
      return profilePromise
    }

    if (force) {
      profilePromise = null
    }

    profilePromise = (async () => {
      try {
        loading.value = true
        const response = await api.get('/auth/profile')
        // Extract data from the correct API response structure
        const userData = response.data.data || response.data
        user.value = userData
        return { success: true, data: userData }
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.message || 'Erro ao buscar perfil'
        }
      } finally {
        loading.value = false
        profilePromise = null
      }
    })()

    return profilePromise
  }

  async function updateProfile(data) {
    try {
      loading.value = true
      const response = await api.put('/auth/profile', data)
      // Extract data from the correct API response structure
      const userData = response.data.data || response.data
      user.value = userData
      return { success: true, data: userData }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao atualizar perfil'
      }
    } finally {
      loading.value = false
    }
  }

  async function changePassword(currentPassword, newPassword) {
    try {
      loading.value = true
      await api.put('/auth/change-password', { currentPassword, newPassword })
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao alterar senha'
      }
    } finally {
      loading.value = false
    }
  }

  // Verificação de email
  async function sendVerificationEmail() {
    try {
      loading.value = true
      const response = await api.post('/auth/send-verification')
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao enviar email de verificação'
      }
    } finally {
      loading.value = false
    }
  }

  async function verifyEmail(token) {
    try {
      loading.value = true
      const response = await api.post('/auth/verify-email', { token })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao verificar email'
      }
    } finally {
      loading.value = false
    }
  }

  // Recuperação de senha
  async function forgotPassword(email) {
    try {
      loading.value = true
      const response = await api.post('/auth/forgot-password', { email })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao solicitar reset de senha'
      }
    } finally {
      loading.value = false
    }
  }

  async function resetPassword(token, newPassword) {
    try {
      loading.value = true
      const response = await api.post('/auth/reset-password', { token, newPassword })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao redefinir senha'
      }
    } finally {
      loading.value = false
    }
  }

  // Preferências
  async function getPreferences() {
    try {
      const response = await api.get('/auth/preferences')
      return { success: true, data: response.data.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao obter preferências'
      }
    }
  }

  async function updatePreferences(preferences) {
    try {
      loading.value = true
      const response = await api.put('/auth/preferences', preferences)
      return { success: true, data: response.data.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao atualizar preferências'
      }
    } finally {
      loading.value = false
    }
  }

  // Estatísticas
  async function getProfileStats() {
    try {
      const response = await api.get('/auth/profile/stats')
      return { success: true, data: response.data.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao obter estatísticas'
      }
    }
  }

  // Sessões
  async function getActiveSessions() {
    try {
      const response = await api.get('/auth/sessions')
      return { success: true, data: response.data.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao obter sessões'
      }
    }
  }

  async function revokeSession(sessionId) {
    try {
      loading.value = true
      const response = await api.delete(`/auth/sessions/${sessionId}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao revogar sessão'
      }
    } finally {
      loading.value = false
    }
  }

  async function revokeAllSessions() {
    try {
      loading.value = true
      // Enviar refreshToken para manter a sessão atual
      const response = await api.delete('/auth/sessions/all', {
        data: { refreshToken: refreshToken.value }
      })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao revogar todas as sessões'
      }
    } finally {
      loading.value = false
    }
  }

  // Contas conectadas
  async function getConnectedAccounts() {
    try {
      const response = await api.get('/auth/connected-accounts')
      return { success: true, data: response.data.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao obter contas conectadas'
      }
    }
  }

  // 2FA
  async function enable2FA(password) {
    try {
      loading.value = true
      const response = await api.post('/auth/2fa/enable', { password })
      return { success: true, data: response.data.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao ativar 2FA'
      }
    } finally {
      loading.value = false
    }
  }

  async function verify2FA(token) {
    try {
      loading.value = true
      const response = await api.post('/auth/2fa/verify', { token })
      return { success: true, data: response.data.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao verificar 2FA'
      }
    } finally {
      loading.value = false
    }
  }

  async function disable2FA(password, token) {
    try {
      loading.value = true
      const response = await api.post('/auth/2fa/disable', { password, token })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao desativar 2FA'
      }
    } finally {
      loading.value = false
    }
  }

  // Deletar conta
  async function deleteAccount(password, confirmation) {
    try {
      loading.value = true
      const response = await api.delete('/auth/account', {
        data: { password, confirmation }
      })
      clearAuth()
      router.push('/login')
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao deletar conta'
      }
    } finally {
      loading.value = false
    }
  }

  // Initialize user if token exists
  if (accessToken.value && !user.value) {
    getProfile()
  }

  return {
    user: computed(() => user.value),
    isAuthenticated,
    loading: computed(() => loading.value),
    login,
    verify2FALogin,
    register,
    logout,
    getProfile,
    updateProfile,
    changePassword,
    // Email verification
    sendVerificationEmail,
    verifyEmail,
    // Password reset
    forgotPassword,
    resetPassword,
    // Preferences
    getPreferences,
    updatePreferences,
    // Stats
    getProfileStats,
    // Sessions
    getActiveSessions,
    revokeSession,
    revokeAllSessions,
    // Connected accounts
    getConnectedAccounts,
    // 2FA
    enable2FA,
    verify2FA,
    disable2FA,
    // Delete account
    deleteAccount
  }
}
