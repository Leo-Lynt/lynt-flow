import axios from 'axios'

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api`

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
})

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Não aplicar interceptor de renovação de token para rotas de autenticação
    const skipInterceptorRoutes = ['/auth/login', '/auth/register', '/auth/2fa/login', '/auth/refresh']
    const shouldSkipInterceptor = skipInterceptorRoutes.some(route => originalRequest.url?.includes(route))

    if (shouldSkipInterceptor) {
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = localStorage.getItem('refreshToken')

      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken
          })

          const { data } = response.data
          const { tokens } = data
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = tokens

          localStorage.setItem('accessToken', newAccessToken)
          localStorage.setItem('refreshToken', newRefreshToken)

          // Update the original request with new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

          return api(originalRequest)
        } catch (refreshError) {
          // Clear auth and redirect to login if refresh fails
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          window.location.href = '/login'
          return Promise.reject(refreshError)
        }
      } else {
        // No refresh token available, redirect to login
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default api