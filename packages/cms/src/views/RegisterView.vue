<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useAuth } from '../composables/useAuth.js'

const { register, loading } = useAuth()

const form = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const error = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)

async function handleSubmit() {
  error.value = ''

  // Validation
  if (!form.value.name || !form.value.email || !form.value.password || !form.value.confirmPassword) {
    error.value = 'Please fill in all fields'
    return
  }

  if (form.value.password !== form.value.confirmPassword) {
    error.value = 'Passwords do not match'
    return
  }

  if (form.value.password.length < 6) {
    error.value = 'Password must be at least 6 characters long'
    return
  }

  const result = await register(form.value.name, form.value.email, form.value.password)

  if (!result.success) {
    error.value = result.error
  }
}

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value
}

function toggleConfirmPasswordVisibility() {
  showConfirmPassword.value = !showConfirmPassword.value
}
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
        <h2 class="text-2xl font-semibold text-gray-800 mb-1">Crie sua conta</h2>
        <p class="text-sm text-gray-600">Preencha os dados para começar</p>
      </div>

      <!-- Glass card -->
      <div class="glass-card backdrop-blur-xl bg-white/30 px-10 py-12 rounded-lg shadow-lg border border-white/20">

        <!-- Error message -->
        <div
          v-if="error"
          class="mb-8 px-5 py-4 rounded flex items-start backdrop-blur-sm border-l-4 bg-red-50/60 border-red-400 text-red-900"
        >
          <Icon
            icon="lucide:alert-circle"
            class="w-5 h-5 mr-3 flex-shrink-0 mt-0.5"
          />
          <div class="flex-1">
            <p class="font-medium text-sm">{{ error }}</p>
          </div>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Name -->
          <div class="group">
            <label for="name" class="block text-xs font-medium text-gray-600 mb-2.5 uppercase tracking-wide">
              Nome completo
            </label>
            <div class="relative">
              <input
                id="name"
                v-model="form.name"
                type="text"
                autocomplete="name"
                required
                class="w-full px-4 py-2.5 pr-10 bg-white/50 backdrop-blur-sm border border-gray-300 rounded text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-purple focus:bg-white/70 transition-all text-sm tracking-wide"
                placeholder="Seu nome completo"
              />
              <Icon icon="lucide:user" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 opacity-60" />
            </div>
          </div>

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
                class="w-full px-4 py-2.5 pr-10 bg-white/50 backdrop-blur-sm border border-gray-300 rounded text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-purple focus:bg-white/70 transition-all text-sm tracking-wide"
                placeholder="seu@email.com"
              />
              <Icon icon="lucide:mail" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 opacity-60" />
            </div>
          </div>

          <!-- Password -->
          <div class="group">
            <label for="password" class="block text-xs font-medium text-gray-600 mb-2.5 uppercase tracking-wide">
              Senha
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password"
                required
                class="w-full px-4 py-2.5 pr-10 bg-white/50 backdrop-blur-sm border border-gray-300 rounded text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-purple focus:bg-white/70 transition-all text-sm tracking-wide"
                placeholder="Mínimo 6 caracteres"
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
            <p class="mt-1.5 text-xs text-gray-500">Mínimo de 6 caracteres</p>
          </div>

          <!-- Confirm Password -->
          <div class="group">
            <label for="confirmPassword" class="block text-xs font-medium text-gray-600 mb-2.5 uppercase tracking-wide">
              Confirmar senha
            </label>
            <div class="relative">
              <input
                id="confirmPassword"
                v-model="form.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                autocomplete="new-password"
                required
                class="w-full px-4 py-2.5 pr-10 bg-white/50 backdrop-blur-sm border border-gray-300 rounded text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-purple focus:bg-white/70 transition-all text-sm tracking-wide"
                placeholder="Digite a senha novamente"
              />
              <button
                type="button"
                @click="toggleConfirmPasswordVisibility"
                class="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:opacity-70 transition-opacity"
              >
                <Icon
                  :icon="showConfirmPassword ? 'lucide:eye-off' : 'lucide:eye'"
                  class="w-4 h-4 text-gray-500"
                />
              </button>
            </div>
          </div>

          <!-- Submit button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full mt-8 px-6 py-3.5 bg-brand-purple hover:brightness-110 rounded text-white text-sm font-medium tracking-wide transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center"
          >
            <span v-if="!loading" class="flex items-center">
              <Icon icon="lucide:user-plus" class="w-4 h-4 mr-2" />
              Criar conta
            </span>
            <span v-else class="flex items-center">
              <Icon icon="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
              Criando conta...
            </span>
          </button>
        </form>

        <!-- Terms -->
        <div class="mt-8">
          <p class="text-center text-xs text-gray-600">
            Ao criar uma conta, você concorda com nossos
            <a href="#" class="text-brand-purple hover:text-brand-purple/80 transition-colors underline decoration-brand-purple/30 hover:decoration-brand-purple/60 underline-offset-2">Termos de Serviço</a>
            e
            <a href="#" class="text-brand-purple hover:text-brand-purple/80 transition-colors underline decoration-brand-purple/30 hover:decoration-brand-purple/60 underline-offset-2">Política de Privacidade</a>
          </p>
        </div>

        <!-- Divider -->
        <div class="relative my-10">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300/30"></div>
          </div>
          <div class="relative flex justify-center text-xs">
            <span class="px-4 bg-white/40 text-gray-500 uppercase tracking-widest font-light">ou</span>
          </div>
        </div>

        <!-- Login link -->
        <div class="text-center">
          <p class="text-sm text-gray-600">
            Já tem uma conta?
            <RouterLink
              to="/login"
              class="font-medium text-brand-purple hover:text-brand-purple/80 transition-colors ml-1 underline decoration-brand-purple/30 hover:decoration-brand-purple/60 underline-offset-2"
            >
              Fazer login
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