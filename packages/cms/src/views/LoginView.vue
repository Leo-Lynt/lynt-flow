<script setup>
import { ref, computed } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useAuth } from '../composables/useAuth.js'

const { login, loginWithGoogle, loading } = useAuth()
const router = useRouter()
const route = useRoute()

const form = ref({
  email: '',
  password: ''
})

const error = ref('')
const showPassword = ref(false)
const attemptsInfo = ref(null)
const googleLoading = ref(false)

// Capturar returnUrl da query string
const returnUrl = computed(() => route.query.returnUrl || null)

async function handleSubmit() {
  error.value = ''
  attemptsInfo.value = null

  if (!form.value.email || !form.value.password) {
    error.value = 'Please fill in all fields'
    return
  }

  const result = await login(form.value.email, form.value.password, returnUrl.value)

  if (!result.success) {
    error.value = result.error
    attemptsInfo.value = result.attemptsInfo
    return
  }

  // Se requer 2FA, redirecionar para página de verificação
  if (result.requires2FA) {
    router.push({
      name: 'verify-2fa',
      query: {
        tempToken: result.tempToken,
        ...(returnUrl.value && { returnUrl: returnUrl.value })
      }
    })
  }
  // Se não requer 2FA, o login já redirecionou
}

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value
}

async function handleGoogleLogin() {
  error.value = ''
  googleLoading.value = true

  const result = await loginWithGoogle()

  if (!result.success) {
    error.value = result.error
    googleLoading.value = false
  }
  // No need to set loading to false on success because we're redirecting
}
</script>

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
      <!-- Logo - fora do card -->
      <div class="flex justify-center mb-6">
        <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-xl shadow-blue-500/30">
          <Icon icon="lucide:workflow" class="w-8 h-8 text-white" />
        </div>
      </div>

      <!-- Welcome message -->
      <div class="text-center mb-8">
        <h2 class="text-2xl font-semibold text-gray-800 mb-1">Bem-vindo de volta!</h2>
        <p class="text-sm text-gray-600">Entre com suas credenciais para continuar</p>
      </div>

      <!-- Glass card -->
      <div class="glass-card backdrop-blur-xl bg-white/70 px-10 py-12 rounded-2xl shadow-xl border border-white/40">

        <!-- Error message -->
        <div
          v-if="error"
          class="mb-8 px-5 py-4 rounded flex items-start backdrop-blur-sm border-l-4"
          :class="[
            attemptsInfo?.attemptsLeft > 0
              ? 'bg-yellow-50/60 border-yellow-400 text-yellow-900'
              : 'bg-red-50/60 border-red-400 text-red-900'
          ]"
        >
          <Icon
            :icon="attemptsInfo?.attemptsLeft > 0 ? 'lucide:alert-triangle' : 'lucide:alert-circle'"
            class="w-5 h-5 mr-3 flex-shrink-0 mt-0.5"
          />
          <div class="flex-1">
            <p class="font-medium text-sm">{{ error }}</p>
            <p v-if="attemptsInfo?.attemptsLeft > 0" class="text-xs mt-1.5 opacity-90">
              {{ attemptsInfo.attemptsLeft }} {{ attemptsInfo.attemptsLeft === 1 ? 'tentativa' : 'tentativas' }} restante{{ attemptsInfo.attemptsLeft === 1 ? '' : 's' }}
            </p>
            <p v-else-if="attemptsInfo?.remainingMinutes" class="text-xs mt-1.5 opacity-90">
              Aguarde {{ attemptsInfo.remainingMinutes }} minuto{{ attemptsInfo.remainingMinutes === 1 ? '' : 's' }} para tentar novamente
            </p>
          </div>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Email -->
          <div class="group">
            <label for="email" class="block text-xs font-medium text-gray-600 mb-2.5 uppercase tracking-wide">
              E-mail
            </label>
            <div class="relative">
              <input
                id="email"
                v-model="form.email"
                type="email"
                autocomplete="email"
                required
                class="w-full px-4 py-2.5 pr-10 bg-white/50 backdrop-blur-sm border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-sm tracking-wide"
                placeholder="seu@email.com"
              />
              <Icon icon="lucide:mail" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 opacity-60" />
            </div>
          </div>

          <!-- Password -->
          <div class="group">
            <div class="flex items-center justify-between mb-2.5">
              <label for="password" class="block text-xs font-medium text-gray-600 uppercase tracking-wide">
                Senha
              </label>
              <RouterLink
                to="/forgot-password"
                class="text-xs font-medium text-blue-600/80 hover:text-blue-600 transition-colors"
              >
                Esqueceu?
              </RouterLink>
            </div>
            <div class="relative">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                required
                class="w-full px-4 py-2.5 pr-10 bg-white/50 backdrop-blur-sm border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-sm tracking-wide"
                placeholder="••••••••"
              />
              <button
                type="button"
                @click="togglePasswordVisibility"
                class="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:opacity-70 transition-opacity"
              >
                <Icon
                  :icon="showPassword ? 'lucide:eye-off' : 'lucide:eye'"
                  class="w-4 h-4 text-gray-500"
                />
              </button>
            </div>
          </div>

          <!-- Submit button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full mt-8 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-xl text-white text-sm font-medium tracking-wide transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center"
          >
            <span v-if="!loading" class="flex items-center">
              <Icon icon="lucide:log-in" class="w-4 h-4 mr-2" />
              Entrar
            </span>
            <span v-else class="flex items-center">
              <Icon icon="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
              Entrando...
            </span>
          </button>
        </form>

        <!-- Google Sign-In -->
        <button
          @click="handleGoogleLogin"
          :disabled="googleLoading || loading"
          type="button"
          class="w-full mt-4 px-6 py-3 bg-white hover:bg-gray-50 border border-gray-300 rounded text-gray-700 text-sm font-medium tracking-wide transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center"
        >
          <span v-if="!googleLoading" class="flex items-center">
            <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Entrar com Google
          </span>
          <span v-else class="flex items-center">
            <Icon icon="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
            Conectando...
          </span>
        </button>

        <!-- Divider -->
        <div class="relative my-10">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300/30"></div>
          </div>
          <div class="relative flex justify-center text-xs">
            <span class="px-4 text-gray-500 uppercase tracking-widest font-light">ou</span>
          </div>
        </div>

        <!-- Register link -->
        <div class="text-center">
          <p class="text-sm text-gray-600">
            Não tem uma conta?
            <RouterLink
              to="/register"
              class="font-medium text-blue-600 hover:text-blue-700 transition-colors ml-1 underline decoration-blue-600/30 hover:decoration-blue-600/60 underline-offset-2"
            >
              Criar conta
            </RouterLink>
          </p>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
/* Glass card effect */
.glass-card {
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}
</style>