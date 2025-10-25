<template>
  <div
    v-if="show"
    :style="{
      position: 'fixed',
      left: position.x + 'px',
      top: position.y + 'px',
      zIndex: 99999,
      backgroundColor: 'white',
      border: '3px solid red'
    }"
    class="rounded-lg shadow-2xl p-2 min-w-[280px] max-w-[400px]"
    @click.stop
  >
    <!-- Search Input -->
    <div class="px-2 py-2">
      <div class="relative">
        <FlowIcon
          icon="material-symbols:search"
          :size="14"
          class="absolute left-2 top-1/2 -translate-y-1/2 text-flow-text-muted dark:text-flow-text-muted-dark"
        />
        <input
          ref="searchInput"
          v-model="searchQuery"
          type="text"
          placeholder="Buscar nodes..."
          class="w-full pl-8 pr-3 py-1.5 text-sm bg-white dark:bg-gray-700 border border-flow-border dark:border-flow-border-dark rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-flow-text dark:text-flow-text-dark"
          @keydown.down.prevent="navigateDown"
          @keydown.up.prevent="navigateUp"
          @keydown.enter.prevent="selectHighlighted"
          @keydown.esc="$emit('close')"
        />
      </div>
    </div>

    <!-- Header -->
    <div class="px-3 py-1 text-11 font-semibold text-flow-text-muted dark:text-flow-text-muted-dark uppercase tracking-wider">
      {{ searchQuery ? `${filteredNodes.length} encontrado(s)` : 'Quick Add' }}
    </div>

    <!-- Nodes List -->
    <div class="flex flex-col max-h-[400px] overflow-y-auto">
      <div v-if="filteredNodes.length === 0" class="px-3 py-4 text-center text-sm text-flow-text-muted dark:text-flow-text-muted-dark">
        Nenhum node encontrado para "{{ searchQuery }}"
      </div>

      <button
        v-for="(nodeType, index) in filteredNodes"
        :key="nodeType.type"
        @click="$emit('create-node', nodeType.type)"
        @mouseenter="highlightedIndex = index"
        :class="[
          'flex items-center gap-2.5 px-3 py-2 bg-transparent border-none rounded text-flow-text-secondary dark:text-flow-text-secondary-dark text-sm text-left cursor-pointer transition-all duration-150',
          index === highlightedIndex
            ? 'bg-blue-100 dark:bg-blue-900/30 scale-[1.02]'
            : 'hover:bg-flow-surface-hover dark:hover:bg-flow-surface-hover-dark hover:scale-[1.02]'
        ]"
      >
        <div
          class="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
          :style="{ backgroundColor: nodeType.color + '20', color: nodeType.color }"
        >
          <FlowIcon :icon="nodeType.icon" :size="14" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-medium" v-html="highlightMatch(nodeType.label)"></div>
          <div v-if="nodeType.description" class="text-xs text-flow-text-muted dark:text-flow-text-muted-dark truncate">
            {{ nodeType.description }}
          </div>
        </div>
        <div class="text-10 text-flow-text-muted dark:text-flow-text-muted-dark uppercase tracking-wide">
          {{ getCategoryLabel(nodeType.category) }}
        </div>
      </button>
    </div>

    <!-- Footer hint -->
    <div class="px-3 py-1.5 border-t border-flow-border dark:border-flow-border-dark text-10 text-flow-text-muted dark:text-flow-text-muted-dark">
      <span class="inline-flex items-center gap-1">
        <kbd class="px-1.5 py-0.5 bg-white dark:bg-gray-700 border border-flow-border rounded text-9">↑↓</kbd>
        navegar
        <kbd class="px-1.5 py-0.5 bg-white dark:bg-gray-700 border border-flow-border rounded text-9 ml-2">Enter</kbd>
        selecionar
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useFlowStore } from '../../stores/flowStore'
import FlowIcon from '../Icon.vue'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  position: {
    type: Object,
    required: true
  },
  nodes: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['create-node', 'close'])

const flowStore = useFlowStore()
const searchInput = ref(null)
const searchQuery = ref('')
const highlightedIndex = ref(0)

// Get all nodes from catalog if available, otherwise use props.nodes
// Se props.nodes foi fornecido explicitamente (length > 0), usar ele ao invés do catálogo
const allAvailableNodes = computed(() => {

  // Se props.nodes tem conteúdo, usar ele (Quick Add filtrado)
  if (props.nodes && props.nodes.length > 0) {
    return props.nodes
  }
  // Caso contrário, usar todos do catálogo (menu normal)
  return flowStore.nodeCatalog?.nodes || []
})

// Get categories for labels
const categories = computed(() => flowStore.nodeCatalog?.categories || [])

// Filter nodes based on search
const filteredNodes = computed(() => {

  if (!searchQuery.value.trim()) {
    return allAvailableNodes.value
  }

  const query = searchQuery.value.toLowerCase()
  const filtered = allAvailableNodes.value.filter(node => {
    const labelMatch = node.label?.toLowerCase().includes(query)
    const descMatch = node.description?.toLowerCase().includes(query)
    const categoryMatch = getCategoryLabel(node.category).toLowerCase().includes(query)
    const typeMatch = node.type?.toLowerCase().includes(query)
    return labelMatch || descMatch || categoryMatch || typeMatch
  })

  return filtered
})

// Get category label
function getCategoryLabel(categoryId) {
  const category = categories.value.find(c => c.id === categoryId)
  return category?.label || categoryId || ''
}

// Highlight matching text
function highlightMatch(text) {
  if (!searchQuery.value.trim() || !text) return text

  const query = searchQuery.value
  const regex = new RegExp(`(${query})`, 'gi')
  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-700 px-0.5 rounded">$1</mark>')
}

// Navigation
function navigateDown() {
  if (highlightedIndex.value < filteredNodes.value.length - 1) {
    highlightedIndex.value++
  }
}

function navigateUp() {
  if (highlightedIndex.value > 0) {
    highlightedIndex.value--
  }
}

function selectHighlighted() {
  const node = filteredNodes.value[highlightedIndex.value]
  if (node) {
    emit('create-node', node.type)
  }
}

// Focus input when menu opens
watch(() => props.show, (newVal, oldVal) => {

  if (newVal) {
    nextTick(() => {
      searchInput.value?.focus()
    })
  } else {
    // Reset state when closing
    searchQuery.value = ''
    highlightedIndex.value = 0
  }
})

// Reset highlighted index when search changes
watch(searchQuery, () => {
  highlightedIndex.value = 0
})
</script>
