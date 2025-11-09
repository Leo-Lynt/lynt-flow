<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Icon from '../../components/Icon.vue'
import api from '../../utils/api'

const router = useRouter()

// State
const loading = ref(true)
const error = ref(null)
const searchQuery = ref('')
const selectedCategory = ref(null)
const nodeCatalog = ref({ categories: [], nodes: [] })

// Computed
const filteredNodes = computed(() => {
  let nodes = nodeCatalog.value.nodes || []

  // Filter by category
  if (selectedCategory.value) {
    nodes = nodes.filter(node => node.category === selectedCategory.value)
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    nodes = nodes.filter(node =>
      node.label.toLowerCase().includes(query) ||
      node.description.toLowerCase().includes(query) ||
      node.type.toLowerCase().includes(query)
    )
  }

  return nodes
})

const nodesByCategory = computed(() => {
  const grouped = {}
  const categories = nodeCatalog.value.categories || []

  // Initialize all categories
  categories.forEach(cat => {
    grouped[cat.id] = {
      ...cat,
      nodes: []
    }
  })

  // Group filtered nodes by category
  filteredNodes.value.forEach(node => {
    if (grouped[node.category]) {
      grouped[node.category].nodes.push(node)
    }
  })

  // Remove empty categories
  return Object.values(grouped).filter(cat => cat.nodes.length > 0)
})

const totalNodes = computed(() => filteredNodes.value.length)

// Methods
async function loadNodeCatalog() {
  try {
    loading.value = true
    error.value = null
    const response = await api.get('/nodes')

    // A API retorna { success: true, data: { categories: [...], nodes: [...] } }
    if (response.data && response.data.data) {
      nodeCatalog.value = response.data.data
    } else {
      // Fallback se o formato for diferente
      nodeCatalog.value = response.data
    }

    console.log('Loaded nodes:', nodeCatalog.value.nodes?.length || 0)
  } catch (err) {
    console.error('Failed to load node catalog:', err)
    error.value = 'Falha ao carregar o catálogo de nodes. Tente novamente.'
  } finally {
    loading.value = false
  }
}

function getNodeRoute(nodeType) {
  // Map node types to their documentation routes
  const routeMap = {
    'input': '/nodes/input-output/input-overview',
    'output': '/nodes/input-output/output-overview',
    'constant': '/nodes/constant',
    'variable': '/nodes/variable',
    'connector': '/nodes/data-connector',
    'filter': '/nodes/filter',
    'sort': '/nodes/sort',
    'map': '/nodes/map',
    'add': '/nodes/math/add',
    'subtract': '/nodes/math/subtract',
    'multiply': '/nodes/math/multiply',
    'divide': '/nodes/math/divide',
    'round': '/nodes/math/round',
    'comparison': '/nodes/condition/compare',
    'conditionalBranch': '/nodes/condition/branch',
    'logic': '/nodes/condition/logic'
  }

  return routeMap[nodeType] || null
}

function navigateToNode(nodeType) {
  const route = getNodeRoute(nodeType)
  if (route) {
    router.push(route)
  }
}

function clearFilters() {
  searchQuery.value = ''
  selectedCategory.value = null
}

onMounted(() => {
  loadNodeCatalog()
})
</script>

<template>
  <div class="max-w-5xl mx-auto">
    <!-- Header -->
    <div class="mb-12">
      <h1 class="text-4xl font-light text-gray-800 tracking-wide mb-4">
        Todos os Nodes
      </h1>
      <p class="text-xl text-gray-600 font-light leading-relaxed">
        Catálogo completo de nodes disponíveis no Lynt Flow.
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="backdrop-blur-xl bg-white/30 rounded-2xl border border-white/20 p-12 text-center">
      <Icon icon="material-symbols:refresh" class="w-12 h-12 text-brand-purple animate-spin mx-auto mb-4" />
      <p class="text-gray-600 font-light">Carregando catálogo de nodes...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="backdrop-blur-xl bg-red-50 rounded-2xl border border-red-200 p-8 text-center">
      <Icon icon="material-symbols:error" class="w-12 h-12 text-red-500 mx-auto mb-4" />
      <p class="text-red-700 font-medium mb-4">{{ error }}</p>
      <button
        @click="loadNodeCatalog"
        class="px-4 py-2 bg-brand-purple text-white rounded-lg hover:bg-brand-purple/90 transition-colors"
      >
        Tentar Novamente
      </button>
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Search & Filters -->
      <div class="backdrop-blur-xl bg-white/30 rounded-2xl border border-white/20 p-6 mb-8 shadow-lg">
        <div class="flex flex-col md:flex-row gap-4 mb-4">
          <!-- Search Input -->
          <div class="flex-1 relative">
            <Icon icon="material-symbols:search" class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar nodes..."
              class="w-full pl-10 pr-4 py-2.5 bg-white/60 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple/50 transition-all"
            />
          </div>

          <!-- Category Filter -->
          <select
            v-model="selectedCategory"
            class="px-4 py-2.5 bg-white/60 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple/50 transition-all"
          >
            <option :value="null">Todas as Categorias</option>
            <option
              v-for="category in nodeCatalog.categories"
              :key="category.id"
              :value="category.id"
            >
              {{ category.label }}
            </option>
          </select>

          <!-- Clear Button -->
          <button
            v-if="searchQuery || selectedCategory"
            @click="clearFilters"
            class="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <Icon icon="material-symbols:close" class="w-4 h-4" />
            Limpar
          </button>
        </div>

        <!-- Results Count -->
        <p class="text-sm text-gray-600 font-light">
          {{ totalNodes }} {{ totalNodes === 1 ? 'node encontrado' : 'nodes encontrados' }}
        </p>
      </div>

      <!-- No Results -->
      <div v-if="totalNodes === 0" class="backdrop-blur-xl bg-white/30 rounded-2xl border border-white/20 p-12 text-center">
        <Icon icon="material-symbols:search-off" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-600 font-light text-lg mb-2">Nenhum node encontrado</p>
        <p class="text-gray-500 text-sm">Tente ajustar os filtros ou termo de busca</p>
      </div>

      <!-- Nodes by Category -->
      <div v-else class="space-y-8">
        <div
          v-for="category in nodesByCategory"
          :key="category.id"
          class="backdrop-blur-xl bg-white/30 rounded-2xl border border-white/20 p-8 shadow-lg"
        >
          <!-- Category Header -->
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 bg-gradient-to-br from-brand-purple to-purple-600 rounded-lg flex items-center justify-center">
              <Icon :icon="category.icon" class="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 class="text-2xl font-medium text-gray-800">{{ category.label }}</h2>
              <p class="text-sm text-gray-600 font-light">{{ category.description }}</p>
            </div>
          </div>

          <!-- Nodes Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="node in category.nodes"
              :key="node.type"
              @click="navigateToNode(node.type)"
              :class="[
                'bg-white/40 rounded-lg p-4 transition-all',
                getNodeRoute(node.type)
                  ? 'cursor-pointer hover:bg-white/60 hover:shadow-md hover:scale-[1.02]'
                  : 'opacity-75'
              ]"
            >
              <div class="flex items-start gap-3">
                <div
                  class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  :style="{ backgroundColor: node.color + '20' }"
                >
                  <Icon :icon="node.icon" class="w-5 h-5" :style="{ color: node.color }" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <h3 class="font-medium text-gray-800">{{ node.label }}</h3>
                    <Icon
                      v-if="getNodeRoute(node.type)"
                      icon="material-symbols:arrow-forward"
                      class="w-4 h-4 text-brand-purple opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                  <p class="text-sm text-gray-600 font-light line-clamp-2">{{ node.description }}</p>
                  <p class="text-xs text-gray-500 font-mono mt-1">{{ node.type }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Legend -->
      <div class="backdrop-blur-xl bg-blue-50 rounded-2xl border border-blue-200 p-6 mt-8">
        <div class="flex items-start gap-3">
          <Icon icon="material-symbols:info" class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div class="text-sm text-blue-800">
            <p class="font-medium mb-1">Sobre este catálogo</p>
            <p class="font-light">
              Esta lista é gerada automaticamente a partir do catálogo de nodes do Lynt Flow.
              Clique em um node para ver sua documentação detalhada (quando disponível).
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
