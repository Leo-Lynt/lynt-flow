<template>
  <div class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
    <!-- Background base -->
    <div class="fixed inset-0 bg-[#f2f7ff] -z-10"></div>

    <!-- Gradient Orbs (sutis, estáticos) -->
    <div class="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div class="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-blue-300/20 rounded-full blur-3xl"></div>
      <div class="absolute top-1/3 left-1/4 w-[450px] h-[450px] bg-cyan-300/15 rounded-full blur-3xl"></div>
      <div class="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-purple-300/10 rounded-full blur-3xl"></div>
    </div>

    <!-- Grid pattern sutil -->
    <div class="fixed inset-0 opacity-[0.02] -z-5 pointer-events-none">
      <div class="absolute inset-0" style="background-image: radial-gradient(circle, #3B82F6 1px, transparent 1px); background-size: 40px 40px;"></div>
    </div>

    <!-- Main container -->
    <div class="relative w-full max-w-md">
      <!-- Logo -->
      <div class="flex justify-center mb-6">
        <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-xl shadow-blue-500/30">
          <Icon icon="lucide:workflow" class="w-8 h-8 text-white" />
        </div>
      </div>

      <!-- Glass card -->
      <div class="glass-card backdrop-blur-xl bg-white/70 px-10 py-12 rounded-2xl shadow-xl border border-white/40">

        <!-- Success State -->
        <div v-if="!error" class="text-center">
          <!-- Animated spinner -->
          <div class="flex justify-center mb-6">
            <Icon icon="lucide:loader-2" class="w-16 h-16 text-blue-600 animate-spin" />
          </div>

          <!-- Message -->
          <h2 class="text-2xl font-semibold text-gray-800 mb-2">{{ message }}</h2>
          <p class="text-sm text-gray-600">Aguarde um momento...</p>

          <!-- Progress steps -->
          <div class="mt-8 space-y-3">
            <div class="flex items-center justify-center space-x-3" :class="step >= 1 ? 'opacity-100' : 'opacity-30'">
              <Icon
                :icon="step > 1 ? 'lucide:check-circle-2' : 'lucide:circle'"
                class="w-5 h-5"
                :class="step > 1 ? 'text-green-600' : 'text-blue-600'"
              />
              <span class="text-sm text-gray-700">Salvando credenciais</span>
            </div>
            <div class="flex items-center justify-center space-x-3" :class="step >= 2 ? 'opacity-100' : 'opacity-30'">
              <Icon
                :icon="step > 2 ? 'lucide:check-circle-2' : 'lucide:circle'"
                class="w-5 h-5"
                :class="step > 2 ? 'text-green-600' : 'text-blue-600'"
              />
              <span class="text-sm text-gray-700">Carregando perfil</span>
            </div>
            <div class="flex items-center justify-center space-x-3" :class="step >= 3 ? 'opacity-100' : 'opacity-30'">
              <Icon
                :icon="step > 3 ? 'lucide:check-circle-2' : 'lucide:circle'"
                class="w-5 h-5"
                :class="step > 3 ? 'text-green-600' : 'text-blue-600'"
              />
              <span class="text-sm text-gray-700">Redirecionando</span>
            </div>
          </div>
        </div>

        <!-- Error State -->
        <div v-else class="text-center">
          <!-- Error icon -->
          <div class="flex justify-center mb-6">
            <div class="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <Icon icon="lucide:alert-circle" class="w-8 h-8 text-red-600" />
            </div>
          </div>

          <!-- Error message -->
          <h2 class="text-2xl font-semibold text-gray-800 mb-2">Erro no Login</h2>
          <p class="text-sm text-gray-600 mb-6">{{ error }}</p>

          <!-- Back button -->
          <button
            @click="redirectToLogin"
            class="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-xl text-white text-sm font-medium tracking-wide transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
          >
            <Icon icon="lucide:arrow-left" class="w-4 h-4 mr-2" />
            Voltar ao Login
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useAuth } from '../composables/useAuth.js'

const router = useRouter()
const route = useRoute()
const { getProfile } = useAuth()

const message = ref('Autenticando com Google...')
const error = ref(null)
const step = ref(0)

onMounted(async () => {
  try {
    // Extract token and email from URL query params
    const { token, email } = route.query

    if (!token) {
      throw new Error('Token não encontrado. Por favor, tente novamente.')
    }

    // Step 1: Saving credentials
    step.value = 1
    message.value = 'Salvando suas credenciais...'
    await new Promise(resolve => setTimeout(resolve, 300))

    // Save tokens to localStorage
    localStorage.setItem('accessToken', token)

    // Save refresh token
    if (route.query.refreshToken) {
      localStorage.setItem('refreshToken', route.query.refreshToken)
    } else {
      console.warn('⚠️ No refreshToken received from OAuth callback')
    }

    // Step 2: Loading profile
    step.value = 2
    message.value = 'Carregando seu perfil...'
    await new Promise(resolve => setTimeout(resolve, 300))

    // Get user profile to update the state
    const result = await getProfile(true)

    if (!result.success) {
      throw new Error(result.error || 'Erro ao carregar perfil do usuário')
    }

    // Step 3: Success
    step.value = 3
    message.value = 'Login realizado com sucesso!'
    await new Promise(resolve => setTimeout(resolve, 500))

    // Step 4: Redirect
    step.value = 4
    message.value = 'Redirecionando para o dashboard...'
    await new Promise(resolve => setTimeout(resolve, 500))

    // Redirect to dashboard
    window.location.href = '/dashboard'
  } catch (err) {
    console.error('OAuth callback error:', err)
    error.value = err.message || 'Erro desconhecido ao processar autenticação'
  }
})

function redirectToLogin() {
  router.push('/login')
}
</script>

<style scoped>
/* Glass card effect */
.glass-card {
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}
</style>
