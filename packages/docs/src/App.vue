<script setup>
import { onMounted } from 'vue'
import { useAuth } from './composables/useAuth'
import api from './utils/api'

const { setTokens, isAuthenticated } = useAuth()

// Function to handle token from URL (when coming from CMS login)
async function handleTokenFromUrl() {
  const urlParams = new URLSearchParams(window.location.search)
  const authToken = urlParams.get('authToken')
  const refreshToken = urlParams.get('refreshToken')

  if (authToken && refreshToken) {
    // Save the tokens in localStorage
    setTokens(authToken, refreshToken)

    // Remove the tokens from URL without reloading the page
    urlParams.delete('authToken')
    urlParams.delete('refreshToken')
    const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '')
    window.history.replaceState({}, '', newUrl)

    console.log('✅ Authentication tokens received and saved')

    // Validate token by making a lightweight API call
    try {
      await api.get('/auth/profile')
      console.log('✅ Token validated successfully')
    } catch (error) {
      console.warn('⚠️ Token validation failed, will be handled by interceptor')
    }
  }
}

onMounted(async () => {
  // Handle authentication token from URL
  await handleTokenFromUrl()

  // Detectar preferência de tema
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  if (isDark) {
    document.documentElement.classList.add('dark')
  }

  // Listener para mudanças de tema
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (e.matches) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  })
})
</script>

<template>
  <div id="app" class="text-flow-text dark:text-flow-text-dark transition-colors duration-200">
    <router-view />
  </div>
</template>

<style scoped>
/* App styles */
</style>
