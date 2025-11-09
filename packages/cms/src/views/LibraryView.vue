<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import AppLayout from '../components/AppLayout.vue'
import ImportFlowModal from '../components/ImportFlowModal.vue'
import { usePublicFlows } from '../composables/usePublicFlows.js'

const router = useRouter()
const { listPublicFlows, getLibraryStats, loading } = usePublicFlows()

const publicFlows = ref([])
const stats = ref({
  totalFlows: 0,
  totalDownloads: 0,
  verifiedFlows: 0
})

const searchQuery = ref('')
const selectedCategory = ref('all')
const selectedDifficulty = ref('all')
const sortBy = ref('popular')
const showVerifiedOnly = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)

const showImportModal = ref(false)
const selectedFlow = ref(null)

const categories = [
  { value: 'all', label: 'Todas Categorias' },
  { value: 'automation', label: 'Automação' },
  { value: 'data-processing', label: 'Processamento de Dados' },
  { value: 'api-integration', label: 'Integração de API' },
  { value: 'notification', label: 'Notificação' },
  { value: 'utility', label: 'Utilidade' }
]

const difficulties = [
  { value: 'all', label: 'Todos Níveis' },
  { value: 'beginner', label: 'Iniciante' },
  { value: 'intermediate', label: 'Intermediário' },
  { value: 'advanced', label: 'Avançado' }
]

onMounted(async () => {
  await loadFlows()
  await loadStats()
})

watch([searchQuery, selectedCategory, selectedDifficulty, sortBy, showVerifiedOnly], () => {
  currentPage.value = 1
  loadFlows()
})

async function loadFlows() {
  const filters = {
    search: searchQuery.value || undefined,
    category: selectedCategory.value !== 'all' ? selectedCategory.value : undefined,
    difficulty: selectedDifficulty.value !== 'all' ? selectedDifficulty.value : undefined,
    verifiedOnly: showVerifiedOnly.value,
    sortBy: sortBy.value,
    page: currentPage.value,
    limit: 12
  }

  const result = await listPublicFlows(filters)
  if (result.success) {
    publicFlows.value = result.flows || []
    if (result.pagination) {
      totalPages.value = result.pagination.pages
    }
  }
}

async function loadStats() {
  const result = await getLibraryStats()
  if (result.success) {
    stats.value = result.data
  }
}

function viewFlowDetails(flow) {
  router.push(`/library/${flow._id}`)
}

function importFlow(flow) {
  selectedFlow.value = flow
  showImportModal.value = true
}

function handleFlowImported() {
  showImportModal.value = false
  selectedFlow.value = null
}

function getCategoryColor(category) {
  const colors = {
    'automation': 'bg-blue-500/10 text-blue-700 border border-blue-500/30',
    'data-processing': 'bg-green-500/10 text-green-700 border border-green-500/30',
    'api-integration': 'bg-cyan-500/10 text-cyan-700 border border-cyan-500/30',
    'notification': 'bg-orange-500/10 text-orange-700 border border-orange-500/30',
    'utility': 'bg-gray-100 text-gray-700 border border-gray-300'
  }
  return colors[category] || colors.utility
}

function getDifficultyColor(difficulty) {
  const colors = {
    'beginner': 'bg-green-500/10 text-green-700 border border-green-500/30',
    'intermediate': 'bg-orange-500/10 text-orange-700 border border-orange-500/30',
    'advanced': 'bg-red-500/10 text-red-700 border border-red-500/30'
  }
  return colors[difficulty] || colors.beginner
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function generateAvatar(name) {
  const initials = name?.split(' ').map(n => n[0]).join('').substring(0, 2) || '??'
  const colors = ['bg-blue-600', 'bg-green-600', 'bg-cyan-600', 'bg-orange-600', 'bg-red-600']
  const color = colors[name?.length % colors.length] || colors[0]
  return { initials, color }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    loadFlows()
  }
}

function previousPage() {
  if (currentPage.value > 1) {
    currentPage.value--
    loadFlows()
  }
}
</script>

<template>
  <AppLayout>
    <!-- Page Header -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-semibold text-gray-800 tracking-wide">Biblioteca Pública</h1>
          <p class="text-gray-600 mt-1 tracking-wide">Descubra e importe fluxos compartilhados pela comunidade</p>
        </div>
      </div>
    </div>

    <!-- Stats Bar -->
    <div class="grid grid-cols-3 gap-4 mb-6">
      <div class="glass-card backdrop-blur-xl bg-white/70 rounded-xl p-4 border border-white/40 shadow-sm hover:bg-white/80 transition-all">
        <div class="flex items-center">
          <Icon icon="lucide:users" class="w-8 h-8 text-blue-600 mr-3" />
          <div>
            <p class="text-sm text-gray-700 tracking-wide">Fluxos da Comunidade</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.totalFlows }}</p>
          </div>
        </div>
      </div>
      <div class="glass-card backdrop-blur-xl bg-white/70 rounded-xl p-4 border border-white/40 shadow-sm hover:bg-white/80 transition-all">
        <div class="flex items-center">
          <Icon icon="lucide:download" class="w-8 h-8 text-green-600 mr-3" />
          <div>
            <p class="text-sm text-gray-700 tracking-wide">Total de Downloads</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.totalDownloads?.toLocaleString() || 0 }}</p>
          </div>
        </div>
      </div>
      <div class="glass-card backdrop-blur-xl bg-white/70 rounded-xl p-4 border border-white/40 shadow-sm hover:bg-white/80 transition-all">
        <div class="flex items-center">
          <Icon icon="lucide:shield-check" class="w-8 h-8 text-cyan-600 mr-3" />
          <div>
            <p class="text-sm text-gray-700 tracking-wide">Fluxos Verificados</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.verifiedFlows }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="glass-card backdrop-blur-xl bg-white/70 rounded-xl border border-white/40 shadow-sm p-4 mb-6">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <div class="relative">
            <Icon icon="lucide:search" class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar fluxos públicos..."
              class="w-full pl-10 pr-3 py-2 border border-white/30 bg-white/50 backdrop-blur-sm rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
        <div class="flex gap-2 flex-wrap">
          <select
            v-model="selectedCategory"
            class="px-3 py-2 border border-white/30 bg-white/50 backdrop-blur-sm rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            <option v-for="cat in categories" :key="cat.value" :value="cat.value">
              {{ cat.label }}
            </option>
          </select>
          <select
            v-model="selectedDifficulty"
            class="px-3 py-2 border border-white/30 bg-white/50 backdrop-blur-sm rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            <option v-for="diff in difficulties" :key="diff.value" :value="diff.value">
              {{ diff.label }}
            </option>
          </select>
          <select
            v-model="sortBy"
            class="px-3 py-2 border border-white/30 bg-white/50 backdrop-blur-sm rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            <option value="popular">Mais Popular</option>
            <option value="recent">Adicionados Recentemente</option>
            <option value="rating">Melhor Avaliados</option>
            <option value="name">Nome A-Z</option>
          </select>
          <label class="flex items-center px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg text-sm cursor-pointer border border-white/30 hover:bg-white/70 transition-all">
            <input
              v-model="showVerifiedOnly"
              type="checkbox"
              class="mr-2 h-4 w-4 text-blue-600 accent-blue-600"
            />
            Apenas Verificados
          </label>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <Icon icon="lucide:loader-2" class="w-12 h-12 text-blue-600 animate-spin" />
    </div>

    <!-- Empty State -->
    <div v-else-if="publicFlows.length === 0" class="text-center py-12 glass-card backdrop-blur-xl bg-white/70 rounded-xl border border-white/40 shadow-sm">
      <Icon icon="lucide:search-x" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-semibold text-gray-900 mb-2 tracking-wide">Nenhum fluxo encontrado</h3>
      <p class="text-gray-600 tracking-wide">Tente ajustar seus termos de busca ou filtros</p>
    </div>

    <!-- Flows Grid -->
    <div v-else>
      <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
        <div
          v-for="flow in publicFlows"
          :key="flow._id"
          class="glass-card backdrop-blur-xl bg-white/70 rounded-xl border border-white/40 shadow-sm hover:shadow-xl hover:bg-white/80 transition-all duration-200 overflow-hidden relative"
        >
          <!-- Blue blur no topo -->
          <div class="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-blue-500/30 via-cyan-500/20 to-transparent blur-md pointer-events-none"></div>

          <!-- Flow Header -->
          <div class="p-6 relative z-10">
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <div class="flex items-center mb-2">
                  <h3 class="text-lg font-semibold text-gray-900 mr-2">{{ flow.name }}</h3>
                  <Icon
                    v-if="flow.publicationData?.isVerified"
                    icon="lucide:shield-check"
                    class="w-5 h-5 text-blue-600"
                    title="Fluxo Verificado"
                  />
                </div>
                <div class="flex gap-2 mb-2">
                  <span :class="['px-2 py-1 text-xs font-medium rounded-full', getCategoryColor(flow.category)]">
                    {{ categories.find(c => c.value === flow.category)?.label || flow.category }}
                  </span>
                  <span v-if="flow.publicMetadata?.difficulty" :class="['px-2 py-1 text-xs font-medium rounded-full', getDifficultyColor(flow.publicMetadata.difficulty)]">
                    {{ difficulties.find(d => d.value === flow.publicMetadata.difficulty)?.label || flow.publicMetadata.difficulty }}
                  </span>
                </div>
              </div>
            </div>

            <p class="text-sm text-gray-600 mb-4 line-clamp-3">
              {{ flow.description }}
            </p>

            <!-- Author -->
            <div class="flex items-center mb-4">
              <div
                :class="['w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium mr-3', generateAvatar(flow.publicMetadata?.author?.name).color]"
              >
                {{ generateAvatar(flow.publicMetadata?.author?.name).initials }}
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">{{ flow.publicMetadata?.author?.name || 'Unknown' }}</p>
                <p class="text-xs text-gray-500">Updated {{ formatDate(flow.updatedAt) }}</p>
              </div>
            </div>

            <!-- Tags -->
            <div v-if="flow.publicMetadata?.tags && flow.publicMetadata.tags.length > 0" class="flex flex-wrap gap-1 mb-4">
              <span
                v-for="tag in flow.publicMetadata.tags.slice(0, 5)"
                :key="tag"
                class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
              >
                {{ tag }}
              </span>
            </div>

            <!-- Stats -->
            <div class="flex items-center justify-between text-sm text-gray-500">
              <div class="flex items-center space-x-4">
                <span class="flex items-center">
                  <Icon icon="lucide:download" class="w-4 h-4 mr-1" />
                  {{ flow.publicStats?.imports?.toLocaleString() || 0 }}
                </span>
                <span class="flex items-center">
                  <Icon icon="lucide:star" class="w-4 h-4 mr-1 text-yellow-500" />
                  {{ flow.publicStats?.averageRating?.toFixed(1) || '0.0' }}
                </span>
                <span class="flex items-center">
                  <Icon icon="lucide:message-circle" class="w-4 h-4 mr-1" />
                  {{ flow.publicStats?.totalReviews || 0 }}
                </span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="px-6 py-4 bg-white/20 backdrop-blur-sm border-t border-white/20 relative z-10">
            <div class="flex items-center justify-between">
              <button
                @click="viewFlowDetails(flow)"
                class="text-gray-700 hover:text-blue-600 flex items-center text-sm font-medium tracking-wide transition-all"
              >
                <Icon icon="lucide:eye" class="w-4 h-4 mr-1" />
                Ver Detalhes
              </button>
              <button
                @click="importFlow(flow)"
                class="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-4 py-2 rounded-lg text-sm transition-all flex items-center space-x-1 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 font-medium tracking-wide"
              >
                <Icon icon="lucide:download" class="w-4 h-4" />
                <span>Importar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-center gap-2">
        <button
          @click="previousPage"
          :disabled="currentPage === 1"
          class="px-4 py-2 backdrop-blur-sm bg-white/70 border border-white/40 rounded-lg hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          <Icon icon="lucide:chevron-left" class="w-5 h-5" />
        </button>
        <span class="text-sm text-gray-700 font-medium tracking-wide">
          Página {{ currentPage }} de {{ totalPages }}
        </span>
        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="px-4 py-2 backdrop-blur-sm bg-white/70 border border-white/40 rounded-lg hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          <Icon icon="lucide:chevron-right" class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Import Modal -->
    <ImportFlowModal
      :show="showImportModal"
      :flow="selectedFlow"
      @close="showImportModal = false"
      @imported="handleFlowImported"
    />
  </AppLayout>
</template>

<style scoped>
.glass-card {
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}
</style>
