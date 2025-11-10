import { ref, computed } from 'vue'
import { jwtDecode } from 'jwt-decode'

// URL do CMS - em produção usa caminho relativo, em dev usa VITE_CMS_URL
const CMS_URL = import.meta.env.PROD
  ? '/'
  : (import.meta.env.VITE_CMS_URL || 'http://localhost:5174')

// Global state
const accessToken = ref(null)
const refreshToken = ref(null)
const user = ref(null)
let initialized = false

// Initialize tokens from localStorage when first accessed
function initializeTokens() {
  if (!initialized && typeof window !== 'undefined' && window.localStorage) {
    accessToken.value = localStorage.getItem('accessToken')
    refreshToken.value = localStorage.getItem('refreshToken')
    initialized = true
  }
}

export function useAuth() {
  // Initialize tokens on first use
  initializeTokens()

  // Computed
  const isAuthenticated = computed(() => {
    return !!accessToken.value && !!refreshToken.value
  })

  // Functions
  function setTokens(newAccessToken, newRefreshToken) {
    accessToken.value = newAccessToken
    refreshToken.value = newRefreshToken
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('accessToken', newAccessToken)
      localStorage.setItem('refreshToken', newRefreshToken)
    }
  }

  function clearAuth() {
    user.value = null
    accessToken.value = null
    refreshToken.value = null
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    }
  }

  function getUserFromToken() {
    if (!accessToken.value) return null

    try {
      const decoded = jwtDecode(accessToken.value)
      return {
        id: decoded.userId || decoded.sub,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role
      }
    } catch (error) {
      console.error('Failed to decode token:', error)
      return null
    }
  }

  function checkTokenValidity() {
    if (!accessToken.value) return false

    try {
      const decoded = jwtDecode(accessToken.value)
      const currentTime = Date.now() / 1000

      // Check if token is expired
      if (decoded.exp && decoded.exp < currentTime) {
        console.warn('Access token is expired')
        return false
      }

      return true
    } catch (error) {
      console.error('Failed to validate token:', error)
      return false
    }
  }

  function redirectToLogin() {
    clearAuth()
    if (typeof window !== 'undefined') {
      // Salvar URL atual para retornar após login
      const returnUrl = encodeURIComponent(window.location.href)
      window.location.href = `${CMS_URL}/login?returnUrl=${returnUrl}`
    }
  }

  // Initialize user from token if available
  if (isAuthenticated.value && checkTokenValidity()) {
    user.value = getUserFromToken()
  }
  // IMPORTANTE: NÃO limpar tokens expirados aqui!
  // O axios interceptor vai tentar fazer refresh automaticamente
  // quando houver uma requisição 401. Se limparmos aqui, perdemos
  // o refreshToken e o user é deslogado sem chance de renovação.

  return {
    // State
    user,
    accessToken,
    refreshToken,

    // Computed
    isAuthenticated,

    // Methods
    setTokens,
    clearAuth,
    getUserFromToken,
    checkTokenValidity,
    redirectToLogin
  }
}
