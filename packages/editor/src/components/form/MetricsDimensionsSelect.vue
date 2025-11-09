<template>
  <div class="metrics-dimensions-select space-y-2">
    <!-- Selected Items Pills -->
    <div v-if="selectedItems.length > 0" class="flex flex-wrap gap-1">
      <div
        v-for="item in selectedItems"
        :key="item"
        class="inline-flex items-center gap-1 px-2 py-1 text-xs rounded"
        :class="isCustomItem(item)
          ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
          : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'"
        :title="isCustomItem(item) ? 'Métrica/dimensão customizada' : ''"
      >
        <span>{{ getLabelForItem(item) }}</span>
        <button
          @click="removeItem(item)"
          class="hover:text-red-600 dark:hover:text-red-400 cursor-pointer font-bold"
          title="Remover"
        >
          ×
        </button>
      </div>
    </div>

    <!-- Combobox Input + Refresh Button -->
    <div class="relative">
      <div class="flex items-center gap-2">
        <!-- Search/Select Input -->
        <div class="relative flex-1">
          <input
            ref="searchInput"
            v-model="searchQuery"
            type="text"
            :placeholder="loading ? 'Carregando...' : `Buscar ou digitar ${typeLabel} customizada...`"
            :disabled="loading || !!error"
            @focus="openDropdown"
            @blur="closeDropdownDelayed"
            @keydown.escape="closeDropdown"
            @keydown.enter.prevent="handleEnterKey"
            class="w-full px-3 py-2 pr-8 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <!-- Dropdown Icon -->
          <button
            @mousedown.prevent="toggleDropdown"
            type="button"
            class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-transform"
            :class="{ 'rotate-180': isOpen }"
            :disabled="loading || !!error"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <!-- Refresh Icon Button -->
        <button
          @click="loadItems"
          type="button"
          :disabled="loading"
          class="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :class="{ 'animate-spin': loading }"
          title="Recarregar"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      <!-- Dropdown List -->
      <div
        v-if="isOpen && !loading && !error"
        class="absolute z-50 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-64 overflow-y-auto"
      >
        <!-- No results -->
        <div v-if="categorizedItems.length === 0" class="p-3 text-center text-sm text-gray-500 dark:text-gray-400">
          {{ searchQuery ? `Nenhum resultado para "${searchQuery}"` : `Nenhum ${typeLabel} disponível` }}
        </div>

        <!-- Categorized Items -->
        <div v-else>
          <div v-for="category in categorizedItems" :key="category.name" class="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
            <!-- Category Header -->
            <div class="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 sticky top-0">
              {{ category.name }}
            </div>

            <!-- Category Items -->
            <div>
              <button
                v-for="item in category.items"
                :key="item.name"
                @mousedown.prevent="toggleItem(item.name)"
                type="button"
                class="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-start gap-2 border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                :class="{ 'bg-blue-50 dark:bg-blue-900/20': isSelected(item.name) }"
              >
                <!-- Checkbox -->
                <input
                  type="checkbox"
                  :checked="isSelected(item.name)"
                  class="mt-0.5 w-3.5 h-3.5 text-blue-600 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 pointer-events-none"
                  tabindex="-1"
                />

                <!-- Label & Description -->
                <div class="flex-1 min-w-0">
                  <div class="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                    {{ item.label }}
                  </div>
                  <div class="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                    {{ item.description }}
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State (compact) -->
    <div v-if="error" class="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800">
      <svg class="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="text-xs text-red-600 dark:text-red-400 flex-1">
        {{ error }}
      </p>
    </div>

    <!-- Helper text -->
    <p v-if="!loading && !error && availableItems.length > 0" class="text-xs text-gray-500 dark:text-gray-400">
      {{ availableItems.length }} {{ typeLabel }} disponíveis • Pressione Enter para adicionar customizadas
    </p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useFlowStore } from '../../stores/flowStore'

const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: (value) => ['metrics', 'dimensions'].includes(value)
  },
  modelValue: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

const flowStore = useFlowStore()

// State
const availableItems = ref([])
const loading = ref(false)
const error = ref(null)
const searchQuery = ref('')
const isOpen = ref(false)
const searchInput = ref(null)
let closeTimeout = null

// Computed
const typeLabel = computed(() => {
  return props.type === 'metrics' ? 'métricas' : 'dimensões'
})

const selectedItems = computed(() => {
  return props.modelValue || []
})

const filteredItems = computed(() => {
  if (!searchQuery.value) {
    return availableItems.value
  }

  const query = searchQuery.value.toLowerCase()
  return availableItems.value.filter(item => {
    return (
      item.name.toLowerCase().includes(query) ||
      item.label.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
    )
  })
})

const categorizedItems = computed(() => {
  const categories = {}

  filteredItems.value.forEach(item => {
    const category = item.category || 'Other'
    if (!categories[category]) {
      categories[category] = []
    }
    categories[category].push(item)
  })

  // Convert to array and sort
  return Object.entries(categories)
    .map(([name, items]) => ({ name, items }))
    .sort((a, b) => a.name.localeCompare(b.name))
})

// Methods
const isSelected = (itemName) => {
  return selectedItems.value.includes(itemName)
}

const getLabelForItem = (itemName) => {
  const item = availableItems.value.find(i => i.name === itemName)
  return item ? item.label : itemName
}

const toggleItem = (itemName) => {
  const currentSelected = [...selectedItems.value]

  if (currentSelected.includes(itemName)) {
    // Remove
    const index = currentSelected.indexOf(itemName)
    currentSelected.splice(index, 1)
  } else {
    // Add
    currentSelected.push(itemName)
  }

  emit('update:modelValue', currentSelected)

  // Keep dropdown open after selection
  if (searchInput.value) {
    searchInput.value.focus()
  }
}

const removeItem = (itemName) => {
  const currentSelected = [...selectedItems.value]
  const index = currentSelected.indexOf(itemName)

  if (index > -1) {
    currentSelected.splice(index, 1)
    emit('update:modelValue', currentSelected)
  }
}

const openDropdown = () => {
  if (closeTimeout) {
    clearTimeout(closeTimeout)
    closeTimeout = null
  }
  isOpen.value = true
}

const closeDropdown = () => {
  isOpen.value = false
  searchQuery.value = ''
}

const closeDropdownDelayed = () => {
  // Delay to allow click events to register
  closeTimeout = setTimeout(() => {
    closeDropdown()
  }, 200)
}

const toggleDropdown = () => {
  if (isOpen.value) {
    closeDropdown()
  } else {
    openDropdown()
    if (searchInput.value) {
      searchInput.value.focus()
    }
  }
}

const handleEnterKey = () => {
  const query = searchQuery.value.trim()

  if (!query) return

  // Verificar se há match exato na lista
  const exactMatch = availableItems.value.find(item =>
    item.name.toLowerCase() === query.toLowerCase() ||
    item.label.toLowerCase() === query.toLowerCase()
  )

  if (exactMatch) {
    // Adicionar item da lista
    toggleItem(exactMatch.name)
  } else if (categorizedItems.value.length > 0 && categorizedItems.value[0].items.length > 0) {
    // Adicionar primeiro item filtrado se houver
    const firstItem = categorizedItems.value[0].items[0]
    toggleItem(firstItem.name)
  } else {
    // Adicionar como customizado se não houver match
    addCustomItem(query)
  }

  // Limpar busca após adicionar
  searchQuery.value = ''
}

const addCustomItem = (itemName) => {
  const currentSelected = [...selectedItems.value]

  if (!currentSelected.includes(itemName)) {
    currentSelected.push(itemName)
    emit('update:modelValue', currentSelected)
  }

  // Manter dropdown aberto e foco
  if (searchInput.value) {
    searchInput.value.focus()
  }
}

const isCustomItem = (itemName) => {
  // Verifica se o item NÃO está na lista de itens disponíveis
  return !availableItems.value.find(item => item.name === itemName)
}

const loadItems = async () => {
  loading.value = true
  error.value = null

  try {
    const baseUrl = flowStore.apiConfig?.baseUrl || import.meta.env.VITE_API_URL
    const token = flowStore.apiConfig?.token

    if (!token) {
      throw new Error('Token de autenticação não encontrado')
    }

    const response = await fetch(`${baseUrl}/api/connectors/ga/metadata`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      let errorMessage = `Erro HTTP ${response.status}`
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch (e) {
        // Ignore JSON parse error
      }
      throw new Error(errorMessage)
    }

    const data = await response.json()

    // Backend retorna: { success: true, data: { metrics: [...], dimensions: [...] } }
    availableItems.value = props.type === 'metrics'
      ? data.data?.metrics || []
      : data.data?.dimensions || []

  } catch (err) {
    // Garantir que error seja sempre uma string legível
    if (err instanceof Error) {
      error.value = err.message
    } else if (typeof err === 'string') {
      error.value = err
    } else if (err && err.message) {
      error.value = err.message
    } else {
      error.value = `Erro ao carregar ${typeLabel.value}`
    }
    availableItems.value = []
    console.error('Erro ao carregar metadata GA:', err)
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadItems()
})

onBeforeUnmount(() => {
  if (closeTimeout) {
    clearTimeout(closeTimeout)
  }
})
</script>

<style scoped>
/* Custom scrollbar for dropdown */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 3px;
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb {
  background: #4a5568;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #718096;
}
</style>
