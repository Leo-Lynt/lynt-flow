<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useTheme } from './composables/useTheme.js'

const { initTheme } = useTheme()

function handleTokenFromUrl() {
  // Verifica se há um authToken na URL
  const urlParams = new URLSearchParams(window.location.search)
  const authToken = urlParams.get('authToken')

  if (authToken) {
    // Salva o token no localStorage
    localStorage.setItem('accessToken', authToken)

    // Remove o authToken da URL sem recarregar a página
    urlParams.delete('authToken')
    const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '')
    window.history.replaceState({}, '', newUrl)
  }
}

onMounted(() => {
  initTheme()
  handleTokenFromUrl()
})
</script>

<template>
  <RouterView />
</template>
