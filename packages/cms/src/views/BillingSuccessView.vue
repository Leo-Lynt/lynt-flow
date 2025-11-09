<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import AppLayout from '../components/AppLayout.vue'
import BaseCard from '../components/BaseCard.vue'

const router = useRouter()
const sessionId = ref('')
const loading = ref(true)

onMounted(() => {
  // Get session_id from URL
  const urlParams = new URLSearchParams(window.location.search)
  sessionId.value = urlParams.get('session_id') || ''

  // Small delay for better UX
  setTimeout(() => {
    loading.value = false
  }, 1000)
})

function goToProfile() {
  router.push('/profile?tab=plan')
}

function goToDashboard() {
  router.push('/dashboard')
}
</script>

<template>
  <AppLayout>
    <div class="min-h-[60vh] flex items-center justify-center">
      <BaseCard class="max-w-2xl mx-auto">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
          <Icon icon="lucide:loader-2" class="w-16 h-16 text-brand-purple mx-auto animate-spin mb-4" />
          <p class="text-gray-600">Processando seu pagamento...</p>
        </div>

        <!-- Success State -->
        <div v-else class="text-center py-12">
          <!-- Success Icon -->
          <div class="mb-6">
            <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Icon icon="lucide:check-circle" class="w-12 h-12 text-green-600" />
            </div>
          </div>

          <!-- Title -->
          <h1 class="text-3xl font-bold text-gray-900 mb-3">
            Pagamento Confirmado! 🎉
          </h1>

          <!-- Description -->
          <p class="text-lg text-gray-600 mb-6">
            Sua assinatura foi ativada com sucesso
          </p>

          <!-- Info Box -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
            <div class="flex items-start gap-3">
              <Icon icon="lucide:info" class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div class="text-sm text-blue-900">
                <p class="font-medium mb-2">O que acontece agora?</p>
                <ul class="space-y-1.5 list-disc list-inside">
                  <li>Seu plano foi atualizado e os novos limites já estão ativos</li>
                  <li>Você receberá um email de confirmação com os detalhes</li>
                  <li>Sua fatura está disponível no portal de cobrança</li>
                  <li>A cobrança será renovada automaticamente</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Session ID (for debugging) -->
          <p v-if="sessionId" class="text-xs text-gray-400 mb-6 font-mono">
            ID da sessão: {{ sessionId }}
          </p>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              @click="goToProfile"
              class="px-6 py-3 bg-brand-purple text-white rounded-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 font-medium"
            >
              <Icon icon="lucide:sparkles" class="w-5 h-5" />
              Ver Meu Plano
            </button>
            <button
              @click="goToDashboard"
              class="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2 font-medium"
            >
              <Icon icon="lucide:layout-dashboard" class="w-5 h-5" />
              Ir para Dashboard
            </button>
          </div>
        </div>
      </BaseCard>
    </div>
  </AppLayout>
</template>
