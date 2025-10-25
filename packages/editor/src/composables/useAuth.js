import { ref, computed } from 'vue'
import { jwtDecode } from 'jwt-decode'
import { CMS_URL } from '../utils/api'

// Global state - Initialize without accessing localStorage at module scope
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
      window.location.href = `${CMS_URL}/login`
    }
  }

  // Initialize user from token if available
  if (isAuthenticated.value && checkTokenValidity()) {
    user.value = getUserFromToken()
  } else if (accessToken.value && !checkTokenValidity()) {
    // Token exists but is invalid/expired, clear it
    clearAuth()
  }

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
