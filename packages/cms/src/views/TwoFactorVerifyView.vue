<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useAuth } from '../composables/useAuth.js'

const { verify2FALogin, loading } = useAuth()
const router = useRouter()
const route = useRoute()

const code = ref('')
const error = ref('')
const tempToken = ref('')
const attemptsInfo = ref(null)

onMounted(() => {
  // Obter tempToken da rota
  tempToken.value = route.query.tempToken

  if (!tempToken.value) {
    error.value = 'Sessão inválida. Por favor, faça login novamente.'
    setTimeout(() => {
      router.push('/login')
    }, 3000)
  }
})

async function handleSubmit() {
  error.value = ''
  attemptsInfo.value = null

  if (!code.value || code.value.length !== 6) {
    error.value = 'Please enter a valid 6-digit code'
    return
  }

  const result = await verify2FALogin(tempToken.value, code.value)

  if (!result.success) {
    error.value = result.error
    attemptsInfo.value = result.attemptsInfo
    code.value = '' // Limpar código para tentar novamente
  }
  // Se success for true, o verify2FALogin já faz o redirecionamento
}

function handleCodeInput(event) {
  // Permitir apenas números
  const value = event.target.value.replace(/[^0-9]/g, '')
  code.value = value.slice(0, 6)
}

function goBack() {
  router.push('/login')
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
        <h2 class="text-2xl font-semibold text-gray-800 mb-1">Autenticação de Dois Fatores</h2>
        <p class="text-sm text-gray-600">Digite o código de 6 dígitos do seu app autenticador</p>
      </div>

      <!-- Glass card -->
      <div class="glass-card backdrop-blur-xl bg-white/30 px-10 py-12 rounded-lg shadow-lg border border-white/20">
        <!-- Error message -->
        <div
          v-if="error"
          class="mb-8 px-5 py-4 rounded flex items-start backdrop-blur-sm border-l-4"
          :class="[
            attemptsInfo?.attemptsLeft > 0
              ? 'bg-brand-orange/10 border-brand-orange text-brand-orange'
              : 'bg-brand-red/10 border-brand-red text-brand-red'
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

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Code input -->
          <div class="group">
            <label for="code" class="block text-xs font-medium text-gray-600 mb-2.5 uppercase tracking-wide">
              Código de Verificação
            </label>
            <input
              id="code"
              v-model="code"
              @input="handleCodeInput"
              type="text"
              inputmode="numeric"
              pattern="[0-9]*"
              autocomplete="one-time-code"
              maxlength="6"
              required
              class="appearance-none block w-full px-4 py-3 text-center text-2xl font-mono tracking-[0.5em] bg-white/50 backdrop-blur-sm border border-gray-300 rounded text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-purple focus:bg-white/70 transition-all"
              placeholder="000000"
            />
            <p class="mt-2 text-xs text-gray-600 text-center tracking-wide">
              Abra seu app autenticador para visualizar o código
            </p>
          </div>

          <!-- Submit button -->
          <div>
            <button
              type="submit"
              :disabled="loading || code.length !== 6"
              class="w-full mt-8 px-6 py-3.5 bg-brand-purple hover:brightness-110 rounded text-white text-sm font-medium tracking-wide transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center"
            >
              <span v-if="!loading" class="flex items-center">
                <Icon icon="lucide:shield-check" class="w-4 h-4 mr-2" />
                Verificar Código
              </span>
              <span v-else class="flex items-center">
                <Icon icon="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
                Verificando...
              </span>
            </button>
          </div>

          <!-- Back to login -->
          <div class="text-center pt-2">
            <button
              type="button"
              @click="goBack"
              class="text-sm text-gray-600 hover:opacity-70 transition-opacity flex items-center justify-center w-full"
            >
              <Icon icon="lucide:arrow-left" class="w-4 h-4 mr-1.5" />
              Voltar para o login
            </button>
          </div>
        </form>

        <!-- Help text -->
        <div class="mt-8 bg-brand-purple/10 backdrop-blur-sm border border-brand-purple/20 rounded p-4">
          <div class="flex items-start">
            <Icon icon="lucide:info" class="w-5 h-5 text-brand-purple mr-3 flex-shrink-0 mt-0.5" />
            <div class="text-sm text-gray-700">
              <p class="font-medium mb-1">Precisa de ajuda?</p>
              <p class="text-gray-600 text-xs tracking-wide">
                Se você perdeu o acesso ao seu app autenticador, entre em contato com o suporte para recuperar sua conta.
              </p>
            </div>
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
