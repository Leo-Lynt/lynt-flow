<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useAuth } from '../composables/useAuth.js'

const { verifyEmail } = useAuth()
const router = useRouter()
const route = useRoute()

const verifying = ref(true)
const success = ref(false)
const error = ref('')

onMounted(async () => {
  const token = route.query.token

  if (!token) {
    error.value = 'Token de verificação não encontrado'
    verifying.value = false
    return
  }

  const result = await verifyEmail(token)
  verifying.value = false

  if (result.success) {
    success.value = true
    setTimeout(() => {
      router.push('/dashboard')
    }, 3000)
  } else {
    error.value = result.error
  }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
    <!-- Animated gradient background -->
    <div class="absolute inset-0 bg-gradient-animated"></div>

    <!-- Subtle animated shapes -->
    <div class="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-blue-200/40 to-purple-200/40 rounded-full blur-3xl animate-float-slow"></div>
    <div class="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-purple-200/40 to-pink-200/40 rounded-full blur-3xl animate-float-slow animation-delay-2000"></div>
    <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-200/30 to-blue-200/30 rounded-full blur-3xl animate-float-slow animation-delay-4000"></div>

    <!-- Main container -->
    <div class="relative w-full max-w-md">
      <!-- Logo -->
      <div class="flex justify-center mb-6">
        <img src="/Logo.svg" alt="LyntFlow" class="h-16 object-contain" />
      </div>

      <!-- Welcome message -->
      <div class="text-center mb-8">
        <h2 class="text-2xl font-semibold text-gray-800 mb-1">Verificação de E-mail</h2>
        <p class="text-sm text-gray-600">Aguarde enquanto confirmamos seu e-mail</p>
      </div>

      <!-- Glass card -->
      <div class="glass-card backdrop-blur-xl bg-white/30 px-10 py-12 rounded-lg shadow-lg border border-white/20">
        <!-- Loading State -->
        <div v-if="verifying" class="text-center">
          <div class="flex justify-center mb-6">
            <Icon icon="lucide:loader-2" class="w-16 h-16 text-brand-purple animate-spin" />
          </div>
          <p class="text-gray-700 text-sm tracking-wide">Verificando seu e-mail...</p>
        </div>

        <!-- Success State -->
        <div v-if="!verifying && success" class="text-center">
          <div class="flex justify-center mb-6">
            <div class="flex items-center justify-center h-20 w-20 rounded-full bg-brand-green/20 backdrop-blur-sm">
              <Icon icon="lucide:check-circle" class="w-12 h-12 text-brand-green" />
            </div>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-3">E-mail verificado com sucesso!</h3>
          <p class="text-gray-600 text-sm mb-6 tracking-wide">
            Seu e-mail foi confirmado. Você será redirecionado em alguns segundos...
          </p>
          <button
            @click="router.push('/dashboard')"
            class="text-brand-purple hover:text-brand-purple/80 font-medium text-sm transition-colors underline decoration-brand-purple/30 hover:decoration-brand-purple/60 underline-offset-2"
          >
            Ir para o dashboard agora
          </button>
        </div>

        <!-- Error State -->
        <div v-if="!verifying && error" class="text-center">
          <div class="flex justify-center mb-6">
            <div class="flex items-center justify-center h-20 w-20 rounded-full bg-brand-red/20 backdrop-blur-sm">
              <Icon icon="lucide:alert-circle" class="w-12 h-12 text-brand-red" />
            </div>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-3">Erro na verificação</h3>
          <p class="text-brand-red text-sm mb-8 tracking-wide">{{ error }}</p>
          <div class="space-y-3">
            <button
              @click="router.push('/profile')"
              class="w-full px-6 py-3 bg-brand-purple hover:brightness-110 rounded text-white text-sm font-medium tracking-wide transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              Ir para o perfil
            </button>
            <button
              @click="router.push('/login')"
              class="w-full px-6 py-3 bg-white/50 backdrop-blur-sm border border-gray-300 rounded text-gray-700 text-sm font-medium tracking-wide hover:bg-white/70 hover:brightness-95 transition-all"
            >
              Voltar para o login
            </button>
          </div>
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

/* Animated gradient background */
.bg-gradient-animated {
  background: linear-gradient(
    -45deg,
    #f8e8f3,
    #ede8f5,
    #f0f4e8,
    #fef3ed,
    #fef0f0
  );
  background-size: 400% 400%;
  animation: gradient-shift 15s ease infinite;
}

@keyframes gradient-shift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* Floating animation for blobs */
@keyframes float-slow {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -30px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

.animate-float-slow {
  animation: float-slow 20s ease-in-out infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}
</style>
