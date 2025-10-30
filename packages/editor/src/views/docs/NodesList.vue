<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import nodeRegistry from '../../engine/registry'
import Icon from '../../components/Icon.vue'

const router = useRouter()
const searchQuery = ref('')
const selectedCategory = ref('all')

const categories = ref([])
const nodes = ref([])

onMounted(() => {
  // Carregar categorias e nodes do registry
  categories.value = nodeRegistry.getAllCategories()
  nodes.value = nodeRegistry.getAllNodes()
})

// Filtrar nodes por busca e categoria
const filteredNodes = computed(() => {
  let result = nodes.value

  // Filtrar por categoria
  if (selectedCategory.value !== 'all') {
    result = result.filter(node => node.category === selectedCategory.value)
  }

  // Filtrar por busca
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(node =>
      node.label.toLowerCase().includes(query) ||
      node.description?.toLowerCase().includes(query) ||
      node.type.toLowerCase().includes(query)
    )
  }

  return result
})

// Agrupar nodes por categoria
const nodesByCategory = computed(() => {
  const grouped = new Map()

  filteredNodes.value.forEach(node => {
    const category = categories.value.find(cat => cat.id === node.category)
    if (!grouped.has(node.category)) {
      grouped.set(node.category, {
        category,
        nodes: []
      })
    }
    grouped.get(node.category).nodes.push(node)
  })

  return Array.from(grouped.values())
})

function navigateToNode(nodeType) {
  router.push(`/docs/nodes/${nodeType}`)
}

function getCategoryColor(categoryId) {
  const colorMap = {
    'data-input': 'bg-emerald-500',
    'logic-control': 'bg-blue-500',
    'operations': 'bg-purple-500',
    'data-processing': 'bg-amber-500',
    'debug': 'bg-red-500',
    'organization': 'bg-gray-500'
  }
  return colorMap[categoryId] || 'bg-gray-500'
}
</script>

<template>
  <div class="nodes-list">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-4xl font-bold text-flow-text dark:text-flow-text-dark mb-4">
        Referência de Nodes
      </h1>
      <p class="text-lg text-flow-text-secondary dark:text-flow-text-secondary-dark">
        Explore todos os nodes disponíveis no Lynt Flow e veja como utilizá-los.
      </p>
    </div>

    <!-- Filters -->
    <div class="mb-8 flex flex-col sm:flex-row gap-4">
      <!-- Search -->
      <div class="relative flex-1">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar nodes..."
          class="w-full px-4 py-2 pl-10 rounded-lg bg-flow-surface dark:bg-flow-surface-dark border border-flow-border dark:border-flow-border-dark focus:border-primary focus:ring-1 focus:ring-primary text-flow-text dark:text-flow-text-dark"
        />
        <Icon
          icon="material-symbols:search"
          class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-flow-text-secondary dark:text-flow-text-secondary-dark"
        />
      </div>

      <!-- Category Filter -->
      <select
        v-model="selectedCategory"
        class="px-4 py-2 rounded-lg bg-flow-surface dark:bg-flow-surface-dark border border-flow-border dark:border-flow-border-dark focus:border-primary focus:ring-1 focus:ring-primary text-flow-text dark:text-flow-text-dark"
      >
        <option value="all">Todas as Categorias</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.id">
          {{ cat.label }}
        </option>
      </select>
    </div>

    <!-- Results Count -->
    <div class="mb-6 text-sm text-flow-text-secondary dark:text-flow-text-secondary-dark">
      {{ filteredNodes.length }} {{ filteredNodes.length === 1 ? 'node encontrado' : 'nodes encontrados' }}
    </div>

    <!-- Nodes by Category -->
    <div v-if="nodesByCategory.length > 0" class="space-y-12">
      <section v-for="group in nodesByCategory" :key="group.category.id">
        <!-- Category Header -->
        <div class="flex items-center gap-3 mb-6">
          <div :class="['w-1 h-8 rounded-full', getCategoryColor(group.category.id)]"></div>
          <h2 class="text-2xl font-semibold text-flow-text dark:text-flow-text-dark">
            {{ group.category.label }}
          </h2>
          <span class="text-sm text-flow-text-secondary dark:text-flow-text-secondary-dark">
            ({{ group.nodes.length }})
          </span>
        </div>

        <!-- Nodes Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            v-for="node in group.nodes"
            :key="node.type"
            @click="navigateToNode(node.type)"
            class="group p-6 rounded-xl border-2 border-flow-border dark:border-flow-border-dark hover:border-primary bg-flow-surface dark:bg-flow-surface-dark transition-all hover:shadow-lg text-left"
          >
            <div class="flex items-start gap-4 mb-3">
              <div :class="['p-2 rounded-lg', getCategoryColor(node.category)]">
                <Icon :icon="node.icon" class="w-6 h-6 text-white" />
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-lg font-semibold text-flow-text dark:text-flow-text-dark group-hover:text-primary transition-colors mb-1 truncate">
                  {{ node.label }}
                </h3>
                <code class="text-xs text-flow-text-secondary dark:text-flow-text-secondary-dark">
                  {{ node.type }}
                </code>
              </div>
              <Icon
                icon="material-symbols:arrow-forward"
                class="w-5 h-5 text-flow-text-secondary dark:text-flow-text-secondary-dark group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0"
              />
            </div>
            <p class="text-sm text-flow-text-secondary dark:text-flow-text-secondary-dark line-clamp-2">
              {{ node.description || 'Sem descrição disponível' }}
            </p>
          </button>
        </div>
      </section>
    </div>

    <!-- No Results -->
    <div v-else class="text-center py-12">
      <Icon icon="material-symbols:search-off" class="w-16 h-16 mx-auto mb-4 text-flow-text-secondary dark:text-flow-text-secondary-dark opacity-50" />
      <p class="text-lg text-flow-text-secondary dark:text-flow-text-secondary-dark">
        Nenhum node encontrado com os filtros atuais.
      </p>
      <button
        @click="searchQuery = ''; selectedCategory = 'all'"
        class="mt-4 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white transition-colors"
      >
        Limpar Filtros
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Line clamp utility */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
