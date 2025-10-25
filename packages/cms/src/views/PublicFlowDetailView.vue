<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import AppLayout from '../components/AppLayout.vue'
import ImportFlowModal from '../components/ImportFlowModal.vue'
import FlowReviews from '../components/FlowReviews.vue'
import { usePublicFlows } from '../composables/usePublicFlows.js'

const route = useRoute()
const router = useRouter()
const { getFlowDetails, importFlow, forkFlow, reportFlow, getUserReview, loading } = usePublicFlows()

const flow = ref(null)
const relatedFlows = ref([])
const userReview = ref(null)
const showImportModal = ref(false)
const showReportModal = ref(false)

const reportForm = ref({
  category: 'spam',
  reason: ''
})
const reportError = ref('')

onMounted(async () => {
  await loadFlowDetails()
  await loadUserReview()
})

async function loadFlowDetails() {
  const result = await getFlowDetails(route.params.flowId)
  if (result.success) {
    flow.value = result.flow
    relatedFlows.value = result.relatedFlows || []
  } else {
    // Flow not found or error
    router.push('/library')
  }
}

async function loadUserReview() {
  const result = await getUserReview(route.params.flowId)
  if (result.success && result.review) {
    userReview.value = result.review
  }
}

function handleImport() {
  showImportModal.value = true
}

function handleFlowImported() {
  showImportModal.value = false
  // Update import count
  if (flow.value) {
    flow.value.publicStats.imports = (flow.value.publicStats.imports || 0) + 1
  }
}

async function handleReport() {
  reportError.value = ''

  if (reportForm.value.reason.length < 20) {
    reportError.value = 'O motivo deve ter pelo menos 20 caracteres'
    return
  }

  const result = await reportFlow(route.params.flowId, reportForm.value)
  if (result.success) {
    showReportModal.value = false
    reportForm.value = { category: 'spam', reason: '' }
    alert('Report enviado com sucesso. Obrigado por ajudar a manter a qualidade da biblioteca.')
  } else {
    reportError.value = result.error
  }
}

function getCategoryColor(category) {
  const colors = {
    'automation': 'bg-brand-purple/10 text-brand-purple border border-brand-purple/30',
    'data-processing': 'bg-brand-green/10 text-brand-green border border-brand-green/30',
    'api-integration': 'bg-brand-pink/10 text-brand-pink border border-brand-pink/30',
    'notification': 'bg-brand-orange/10 text-brand-orange border border-brand-orange/30',
    'utility': 'bg-gray-100 text-gray-700 border border-gray-300'
  }
  return colors[category] || colors.utility
}

function getDifficultyColor(difficulty) {
  const colors = {
    'beginner': 'bg-brand-green/10 text-brand-green border border-brand-green/30',
    'intermediate': 'bg-brand-orange/10 text-brand-orange border border-brand-orange/30',
    'advanced': 'bg-brand-red/10 text-brand-red border border-brand-red/30'
  }
  return colors[difficulty] || colors.beginner
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function generateAvatar(name) {
  const initials = name?.split(' ').map(n => n[0]).join('').substring(0, 2) || '??'
  const colors = ['bg-brand-purple', 'bg-brand-green', 'bg-brand-pink', 'bg-brand-orange', 'bg-brand-red']
  const color = colors[name?.length % colors.length] || colors[0]
  return { initials, color }
}

function getStars(rating) {
  return Array.from({ length: 5 }, (_, i) => i < rating)
}

const categories = [
  { value: 'automation', label: 'Automação' },
  { value: 'data-processing', label: 'Processamento de Dados' },
  { value: 'api-integration', label: 'Integração de API' },
  { value: 'notification', label: 'Notificação' },
  { value: 'utility', label: 'Utilidade' }
]

const reportCategories = [
  { value: 'spam', label: 'Spam' },
  { value: 'malicious_code', label: 'Código Malicioso' },
  { value: 'inappropriate_content', label: 'Conteúdo Inapropriado' },
  { value: 'copyright_violation', label: 'Violação de Copyright' },
  { value: 'misleading', label: 'Enganoso' },
  { value: 'broken', label: 'Não Funciona' },
  { value: 'other', label: 'Outro' }
]

const forkChainFlows = computed(() => {
  if (!flow.value?.publicMetadata?.forkChain || flow.value.publicMetadata.forkChain.length === 0) {
    return []
  }
  return flow.value.publicMetadata.forkChain
})

const hasWarnings = computed(() => {
  return flow.value?.securityScan?.warnings && flow.value.securityScan.warnings.length > 0
})
</script>

<template>
  <AppLayout>
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <Icon icon="lucide:loader-2" class="w-12 h-12 text-brand-purple animate-spin" />
    </div>

    <!-- Flow Details -->
    <div v-else-if="flow" class="max-w-7xl mx-auto">
      <!-- Back Button -->
      <div class="mb-6">
        <button
          @click="router.push('/library')"
          class="text-gray-700 hover:text-gray-900 flex items-center gap-2 font-medium tracking-wide transition-all"
        >
          <Icon icon="lucide:arrow-left" class="w-5 h-5" />
          Voltar para a Biblioteca
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Flow Header -->
          <div class="glass-card backdrop-blur-xl bg-white/30 rounded-lg border border-white/20 p-6">
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-3">
                  <h1 class="text-3xl font-bold text-gray-900 tracking-wide">{{ flow.name }}</h1>
                  <Icon
                    v-if="flow.publicationData?.isVerified"
                    icon="lucide:shield-check"
                    class="w-6 h-6 text-brand-purple"
                    title="Fluxo Verificado"
                  />
                </div>
                <div class="flex flex-wrap gap-2 mb-4">
                  <span :class="['px-3 py-1 text-sm font-medium rounded-full', getCategoryColor(flow.category)]">
                    {{ categories.find(c => c.value === flow.category)?.label || flow.category }}
                  </span>
                  <span v-if="flow.publicMetadata?.difficulty" :class="['px-3 py-1 text-sm font-medium rounded-full', getDifficultyColor(flow.publicMetadata.difficulty)]">
                    {{ flow.publicMetadata.difficulty }}
                  </span>
                  <span class="px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-700 border border-gray-300">
                    {{ flow.publicMetadata?.license || 'MIT' }}
                  </span>
                </div>
              </div>
            </div>

            <p class="text-gray-600 mb-6">{{ flow.description }}</p>

            <!-- Stats -->
            <div class="flex items-center gap-6 pb-6 border-b border-gray-200">
              <div class="flex items-center gap-2">
                <Icon icon="lucide:eye" class="w-5 h-5 text-gray-400" />
                <span class="text-sm text-gray-600">{{ flow.publicStats?.views?.toLocaleString() || 0 }} visualizações</span>
              </div>
              <div class="flex items-center gap-2">
                <Icon icon="lucide:download" class="w-5 h-5 text-gray-400" />
                <span class="text-sm text-gray-600">{{ flow.publicStats?.imports?.toLocaleString() || 0 }} imports</span>
              </div>
              <div class="flex items-center gap-2">
                <Icon icon="lucide:git-fork" class="w-5 h-5 text-gray-400" />
                <span class="text-sm text-gray-600">{{ flow.publicStats?.forks || 0 }} forks</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="flex">
                  <Icon
                    v-for="(filled, index) in getStars(Math.round(flow.publicStats?.averageRating || 0))"
                    :key="index"
                    icon="lucide:star"
                    :class="['w-4 h-4', filled ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300']"
                  />
                </div>
                <span class="text-sm text-gray-600">{{ flow.publicStats?.averageRating?.toFixed(1) || '0.0' }} ({{ flow.publicStats?.totalReviews || 0 }})</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-3 pt-6">
              <button
                @click="handleImport"
                class="bg-brand-purple text-white px-6 py-3 rounded-lg hover:brightness-110 flex items-center gap-2 font-medium tracking-wide transition-all"
              >
                <Icon icon="lucide:download" class="w-5 h-5" />
                Importar Flow
              </button>
              <button
                @click="showReportModal = true"
                class="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 flex items-center gap-2 font-medium tracking-wide transition-all"
              >
                <Icon icon="lucide:flag" class="w-5 h-5" />
                Reportar
              </button>
            </div>
          </div>

          <!-- Security Warnings -->
          <div v-if="hasWarnings" class="bg-brand-orange/10 border border-brand-orange/30 rounded-lg p-4">
            <div class="flex items-start">
              <Icon icon="lucide:alert-triangle" class="w-5 h-5 text-brand-orange mt-0.5 mr-3 flex-shrink-0" />
              <div class="flex-1">
                <h4 class="font-medium text-yellow-900 mb-2">Avisos de Segurança</h4>
                <ul class="list-disc list-inside space-y-1 text-sm text-yellow-800">
                  <li v-for="warning in flow.securityScan.warnings" :key="warning">{{ warning }}</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Detailed Description -->
          <div v-if="flow.publicMetadata?.detailedDescription" class="glass-card backdrop-blur-xl bg-white/30 rounded-lg border border-white/20 p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Descrição Detalhada</h2>
            <div class="prose max-w-none text-gray-700 whitespace-pre-wrap">{{ flow.publicMetadata.detailedDescription }}</div>
          </div>

          <!-- Tags -->
          <div v-if="flow.publicMetadata?.tags && flow.publicMetadata.tags.length > 0" class="glass-card backdrop-blur-xl bg-white/30 rounded-lg border border-white/20 p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Tags</h2>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="tag in flow.publicMetadata.tags"
                :key="tag"
                class="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <!-- Fork Chain -->
          <div v-if="forkChainFlows.length > 0" class="glass-card backdrop-blur-xl bg-white/30 rounded-lg border border-white/20 p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Icon icon="lucide:git-fork" class="w-5 h-5" />
              Fork de
            </h2>
            <div class="text-sm text-gray-600">
              Este flow é um fork. Veja a cadeia de atribuição original.
            </div>
          </div>

          <!-- Reviews Section -->
          <div class="glass-card backdrop-blur-xl bg-white/30 rounded-lg border border-white/20 p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Avaliações</h2>
            <FlowReviews :flow-id="flow._id" :user-review="userReview" />
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Author Card -->
          <div class="glass-card backdrop-blur-xl bg-white/30 rounded-lg border border-white/20 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Autor</h3>
            <div class="flex items-start gap-3 mb-4">
              <div
                :class="['w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold', generateAvatar(flow.publicMetadata?.author?.name).color]"
              >
                {{ generateAvatar(flow.publicMetadata?.author?.name).initials }}
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <p class="font-medium text-gray-900">{{ flow.publicMetadata?.author?.name || 'Unknown' }}</p>
                  <Icon
                    v-if="flow.publicMetadata?.author?.isVerifiedCreator"
                    icon="lucide:shield-check"
                    class="w-4 h-4 text-blue-500"
                    title="Criador Verificado"
                  />
                </div>
                <p v-if="flow.publicMetadata?.author?.bio" class="text-sm text-gray-600">{{ flow.publicMetadata.author.bio }}</p>
              </div>
            </div>
            <div class="text-sm text-gray-600 space-y-2">
              <div class="flex items-center gap-2">
                <Icon icon="lucide:package" class="w-4 h-4" />
                <span>{{ flow.publicMetadata?.author?.totalPublicFlows || 0 }} flows públicos</span>
              </div>
              <div class="flex items-center gap-2">
                <Icon icon="lucide:star" class="w-4 h-4" />
                <span>{{ flow.publicMetadata?.author?.averageRating?.toFixed(1) || '0.0' }} avaliação média</span>
              </div>
            </div>
          </div>

          <!-- Metadata -->
          <div class="glass-card backdrop-blur-xl bg-white/30 rounded-lg border border-white/20 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Informações</h3>
            <div class="space-y-3 text-sm">
              <div>
                <p class="text-gray-600">Publicado em</p>
                <p class="font-medium text-gray-900">{{ formatDate(flow.publicationData?.publishedAt) }}</p>
              </div>
              <div>
                <p class="text-gray-600">Última atualização</p>
                <p class="font-medium text-gray-900">{{ formatDate(flow.updatedAt) }}</p>
              </div>
              <div>
                <p class="text-gray-600">Licença</p>
                <p class="font-medium text-gray-900">{{ flow.publicMetadata?.license || 'MIT' }}</p>
              </div>
              <div v-if="flow.publicMetadata?.requireAttribution">
                <div class="flex items-start gap-2 p-3 bg-blue-50 rounded">
                  <Icon icon="lucide:info" class="w-4 h-4 text-blue-600 mt-0.5" />
                  <p class="text-xs text-blue-800">Requer atribuição ao autor</p>
                </div>
              </div>
              <div v-if="flow.publicMetadata?.allowForking">
                <div class="flex items-start gap-2 p-3 bg-green-50 rounded">
                  <Icon icon="lucide:git-fork" class="w-4 h-4 text-green-600 mt-0.5" />
                  <p class="text-xs text-green-800">Fork permitido</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Related Flows -->
          <div v-if="relatedFlows.length > 0" class="glass-card backdrop-blur-xl bg-white/30 rounded-lg border border-white/20 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Flows Relacionados</h3>
            <div class="space-y-3">
              <div
                v-for="relatedFlow in relatedFlows"
                :key="relatedFlow._id"
                @click="router.push(`/library/${relatedFlow._id}`)"
                class="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all"
              >
                <h4 class="font-medium text-gray-900 text-sm mb-1">{{ relatedFlow.name }}</h4>
                <p class="text-xs text-gray-600 line-clamp-2 mb-2">{{ relatedFlow.description }}</p>
                <div class="flex items-center gap-3 text-xs text-gray-500">
                  <span class="flex items-center gap-1">
                    <Icon icon="lucide:download" class="w-3 h-3" />
                    {{ relatedFlow.publicStats?.imports || 0 }}
                  </span>
                  <span class="flex items-center gap-1">
                    <Icon icon="lucide:star" class="w-3 h-3" />
                    {{ relatedFlow.publicStats?.averageRating?.toFixed(1) || '0.0' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Import Modal -->
    <ImportFlowModal
      :show="showImportModal"
      :flow="flow"
      @close="showImportModal = false"
      @imported="handleFlowImported"
    />

    <!-- Report Modal -->
    <div v-if="showReportModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <!-- Overlay -->
        <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" @click="showReportModal = false"></div>

        <!-- Modal -->
        <div class="relative inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <!-- Header -->
          <div class="flex items-start justify-between mb-6">
            <div>
              <h3 class="text-xl font-bold text-gray-900">Reportar Flow</h3>
              <p class="text-sm text-gray-600 mt-1">Ajude-nos a manter a qualidade da biblioteca</p>
            </div>
            <button @click="showReportModal = false" class="text-gray-400 hover:text-gray-600">
              <Icon icon="lucide:x" class="w-6 h-6" />
            </button>
          </div>

          <!-- Error Message -->
          <div v-if="reportError" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-red-800 text-sm">{{ reportError }}</p>
          </div>

          <!-- Form -->
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Categoria *
              </label>
              <select
                v-model="reportForm.category"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option v-for="cat in reportCategories" :key="cat.value" :value="cat.value">
                  {{ cat.label }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Motivo *
              </label>
              <textarea
                v-model="reportForm.reason"
                rows="4"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descreva o problema em detalhes..."
              ></textarea>
              <p class="mt-1 text-xs text-gray-500">{{ reportForm.reason.length }} / 1000 caracteres (mínimo 20)</p>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              @click="showReportModal = false"
              class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              @click="handleReport"
              :disabled="loading"
              class="px-4 py-2 bg-brand-red text-white rounded-lg hover:brightness-110 disabled:opacity-50 flex items-center gap-2"
            >
              <Icon :icon="loading ? 'lucide:loader-2' : 'lucide:flag'" :class="['w-4 h-4', { 'animate-spin': loading }]" />
              {{ loading ? 'Enviando...' : 'Enviar Report' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.glass-card {
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}
</style>
