<script setup>
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import AppLayout from '../components/AppLayout.vue'
import BaseCard from '../components/BaseCard.vue'

const router = useRouter()

function goToPlans() {
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
        <div class="text-center py-12">
          <!-- Info Icon -->
          <div class="mb-6">
            <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <Icon icon="lucide:x-circle" class="w-12 h-12 text-gray-600" />
            </div>
          </div>

          <!-- Title -->
          <h1 class="text-3xl font-bold text-gray-900 mb-3">
            Pagamento Cancelado
          </h1>

          <!-- Description -->
          <p class="text-lg text-gray-600 mb-8">
            Você cancelou o processo de pagamento. Nenhuma cobrança foi realizada.
          </p>

          <!-- Info Box -->
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8 text-left">
            <div class="flex items-start gap-3">
              <Icon icon="lucide:info" class="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
              <div class="text-sm text-gray-700">
                <p class="font-medium mb-2">Mudou de ideia?</p>
                <ul class="space-y-1.5">
                  <li>• Você pode assinar um plano a qualquer momento</li>
                  <li>• Seus dados estão seguros e não foram compartilhados</li>
                  <li>• Você continua com acesso ao plano FREE</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              @click="goToPlans"
              class="px-6 py-3 bg-brand-purple text-white rounded-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 font-medium"
            >
              <Icon icon="lucide:sparkles" class="w-5 h-5" />
              Ver Planos Novamente
            </button>
            <button
              @click="goToDashboard"
              class="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2 font-medium"
            >
              <Icon icon="lucide:layout-dashboard" class="w-5 h-5" />
              Ir para Dashboard
            </button>
          </div>

          <!-- Help Text -->
          <p class="text-sm text-gray-500 mt-8">
            Precisa de ajuda para escolher o plano ideal?
            <a href="#" class="text-brand-purple hover:underline ml-1">Entre em contato</a>
          </p>
        </div>
      </BaseCard>
    </div>
  </AppLayout>
</template>
