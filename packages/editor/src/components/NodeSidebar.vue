<template>
  <div class="glass-sidebar fixed top-20 bottom-4 left-4 w-64 backdrop-blur-md bg-white/30 border border-white/20 rounded-lg shadow-lg z-30 transition-transform duration-300 ease-in-out -translate-x-full lg:translate-x-0 flex flex-col overflow-hidden">
    <div class="p-4 border-b border-white/20 dark:border-gray-700/20">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Buscar nodes..."
        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white/80 dark:bg-gray-900/80 text-gray-900 dark:text-gray-100 transition-all duration-200 focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 placeholder-gray-500 dark:placeholder-gray-400 tracking-wide"
      />
    </div>

    <div class="flex-1 overflow-y-auto px-4 pb-4 space-y-1">
      <div
        v-for="category in filteredCategories"
        :key="category.name"
        class="space-y-1"
      >
        <!-- Category Header - Clicável para expandir/colapsar -->
        <div
          :class="[
            'group flex items-center w-full px-3 py-2.5 cursor-pointer transition-all select-none rounded mb-1',
            expandedCategories[category.name]
              ? 'bg-brand-purple/10 dark:bg-gray-800 text-brand-purple border-r-2 border-brand-purple'
              : 'text-gray-700 bg-[#f7f7f7] hover:bg-white/40 hover:brightness-95'
          ]"
          @click="toggleCategory(category.name)"
        >
          <FlowIcon
            :icon="expandedCategories[category.name] ? 'material-symbols:keyboard-arrow-down' : 'material-symbols:keyboard-arrow-right'"
            :size="16"
            :class="[
              'mr-2 transition-transform duration-200',
              expandedCategories[category.name] ? 'text-brand-purple' : 'text-gray-500'
            ]"
          />
          <FlowIcon
            :icon="category.icon"
            :size="16"
            :class="[
              'w-5 h-5 mr-3 flex-shrink-0 transition-colors',
              expandedCategories[category.name] ? 'text-brand-purple' : 'text-gray-500'
            ]"
          />
          <span class="flex-1 text-sm font-medium">{{ category.name }}</span>
          <span class="text-xs text-brand-purple bg-brand-purple/10 border border-brand-purple/30 px-2 py-0.5 rounded-full font-medium">{{ category.nodes.length }}</span>
        </div>

        <!-- Nodes da categoria - Mostrar/Esconder baseado em expansão -->
        <div v-show="expandedCategories[category.name]" class="ml-6 mt-2 space-y-1 pb-2">
          <div
            v-for="node in category.nodes"
            :key="node.type"
          >
            <button
              :class="[
                'group flex items-center w-full px-3 py-2 text-sm font-normal rounded-md transition-all bg-white/50 dark:bg-gray-800/50 border border-gray-200/60 dark:border-gray-600/40',
                isNodeDisabled(node.type)
                  ? 'opacity-50 cursor-not-allowed text-gray-500'
                  : 'text-gray-800 dark:text-gray-200 hover:bg-white/80 dark:hover:bg-gray-800/80 hover:border-brand-purple/40 hover:shadow-sm'
              ]"
              :draggable="!isNodeDisabled(node.type)"
              @dragstart="handleDragStart($event, node)"
              @click="handleNodeClick(node)"
            >
              <FlowIcon
                :icon="node.icon"
                :class="[
                  'w-5 h-5 mr-3 flex-shrink-0 transition-colors',
                  isNodeDisabled(node.type) ? 'text-gray-400' : 'text-gray-600 dark:text-gray-400'
                ]"
              />
              <span class="flex-1 text-left truncate">{{ node.name }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useFlowStore } from '../stores/flowStore'
import { useVueFlow } from '@vue-flow/core'
import FlowIcon from './Icon.vue'
// ⚡ NEW: Import Engine Registry
import { getAllCategories, getNodesByCategory } from '../engine/registry'

const flowStore = useFlowStore()
const { addNodes, project } = useVueFlow()

const searchQuery = ref('')
const expandedCategories = ref({})
const nodeCategories = ref([])

// ⚡ NEW: Carregar nodes do catálogo dinamicamente
onMounted(() => {
  loadNodesFromCatalog()
})

/**
 * Carrega nodes do catálogo registrado no engine
 */
function loadNodesFromCatalog() {
  try {
    // Buscar categorias do engine
    const categories = getAllCategories()

    // Mapear categorias para o formato do sidebar
    nodeCategories.value = categories.map(category => {
      const nodes = getNodesByCategory(category.id)

      // Mapear nodes para o formato esperado
      const mappedNodes = nodes.map(nodeDef => ({
        type: nodeDef.type,
        name: nodeDef.label,
        icon: nodeDef.icon,
        description: nodeDef.description,
        color: nodeDef.color // Guardar cor para uso futuro
      }))

      // Inicializar estado de expansão (todas fechadas)
      expandedCategories.value[category.label] = false

      return {
        name: category.label,
        icon: category.icon,
        id: category.id,
        nodes: mappedNodes
      }
    })
  } catch (error) {
    // Fallback: usar estrutura vazia
    nodeCategories.value = []
  }
}

const filteredCategories = computed(() => {
  if (!searchQuery.value) return nodeCategories.value

  return nodeCategories.value.map(category => ({
    ...category,
    nodes: category.nodes.filter(node =>
      node.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      node.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  })).filter(category => category.nodes.length > 0)
})

const toggleCategory = (categoryName) => {
  // Garantir que o valor existe antes de alternar
  if (expandedCategories.value[categoryName] === undefined) {
    expandedCategories.value[categoryName] = true
  } else {
    expandedCategories.value[categoryName] = !expandedCategories.value[categoryName]
  }
}

// 🚀 NOVO: Verificar se node deve ser desabilitado
const isNodeDisabled = (nodeType) => {
  if (nodeType === 'input' && flowStore.flowValidation.hasInput) return true
  if (nodeType === 'output' && flowStore.flowValidation.hasOutput) return true
  return false
}

const handleDragStart = (event, node) => {
  // 🚀 VALIDAÇÃO: Bloquear drag de Input/Output se já existir
  if (node.type === 'input' && flowStore.flowValidation.hasInput) {
    event.preventDefault()
    console.warn('❌ Cannot add Input node: Flow already has an Input node')
    return
  }
  if (node.type === 'output' && flowStore.flowValidation.hasOutput) {
    event.preventDefault()
    console.warn('❌ Cannot add Output node: Flow already has an Output node')
    return
  }

  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('application/vueflow', JSON.stringify(node))
}

const handleNodeClick = (node) => {
  // 🚀 VALIDAÇÃO: Bloquear click em Input/Output se já existir
  if (node.type === 'input' && flowStore.flowValidation.hasInput) {
    console.warn('❌ Cannot add Input node: Flow already has an Input node')
    return
  }
  if (node.type === 'output' && flowStore.flowValidation.hasOutput) {
    console.warn('❌ Cannot add Output node: Flow already has an Output node')
    return
  }

  // Get center of viewport
  const { x, y } = project({ x: window.innerWidth / 2, y: window.innerHeight / 2 })

  const newNode = createNodeFromType(node.type, { x, y })
  addNodes([newNode])
}

/**
 * Gera classes Tailwind baseadas na cor do node (do catálogo)
 * Mantém mapa estático como fallback
 */
const getNodeIconStyles = (type) => {
  // Mapa com brand colors
  const staticStyles = {
    'input': 'bg-brand-purple/10 dark:bg-brand-purple/20 border-brand-purple/30 dark:border-brand-purple/50 text-brand-purple dark:text-brand-purple',
    'connector': 'bg-brand-green/10 dark:bg-brand-green/20 border-brand-green/30 dark:border-brand-green/50 text-brand-green dark:text-brand-green',
    'field-extractor': 'bg-brand-purple/10 dark:bg-brand-purple/20 border-brand-purple/30 dark:border-brand-purple/50 text-brand-purple dark:text-brand-purple',
    'array-processor': 'bg-brand-orange/10 dark:bg-brand-orange/20 border-brand-orange/30 dark:border-brand-orange/50 text-brand-orange dark:text-brand-orange',
    'add': 'bg-brand-purple/10 dark:bg-brand-purple/20 border-brand-purple/30 dark:border-brand-purple/50 text-brand-purple dark:text-brand-purple',
    'subtract': 'bg-brand-purple/10 dark:bg-brand-purple/20 border-brand-purple/30 dark:border-brand-purple/50 text-brand-purple dark:text-brand-purple',
    'multiply': 'bg-brand-purple/10 dark:bg-brand-purple/20 border-brand-purple/30 dark:border-brand-purple/50 text-brand-purple dark:text-brand-purple',
    'divide': 'bg-brand-purple/10 dark:bg-brand-purple/20 border-brand-purple/30 dark:border-brand-purple/50 text-brand-purple dark:text-brand-purple',
    'variable': 'bg-brand-pink/10 dark:bg-brand-pink/20 border-brand-pink/30 dark:border-brand-pink/50 text-brand-pink dark:text-brand-pink',
    'output': 'bg-brand-red/10 dark:bg-brand-red/20 border-brand-red/30 dark:border-brand-red/50 text-brand-red dark:text-brand-red'
  }

  return staticStyles[type] || 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300'
}

const createNodeFromType = (type, position) => {
  const baseNode = {
    id: `${type}_${Date.now()}`,
    type,
    position,
    data: {}
  }

  switch (type) {
    case 'input':
      baseNode.data = {
        label: 'API Input',
        parameters: []
      }
      break
    case 'connector':
      baseNode.data = {
        label: 'Data Connector',
        sourceType: 'analytics',
        analyticsType: 'sales',
        selectedApi: 'custom',
        apiUrl: '',
        dataPath: '',
        mockData: Math.floor(Math.random() * 100)
      }
      break
    case 'field-extractor':
      baseNode.data = {
        label: 'Field Extractor',
        selectedFields: []
      }
      break
    case 'array-processor':
      baseNode.data = {
        label: 'Array Processor',
        operation: 'extract',
        fieldPath: '',
        filterValue: ''
      }
      break
    case 'add':
    case 'subtract':
    case 'multiply':
    case 'divide':
      baseNode.data = {
        label: type.charAt(0).toUpperCase() + type.slice(1),
        operation: type
      }
      break
    case 'output':
      baseNode.data = {
        label: 'My Output',
        outputFields: []
      }
      break
    case 'variable':
      baseNode.data = {
        label: 'Variable',
        mode: 'set',
        variableName: 'myVariable'
      }
      break
    default:
      baseNode.data = {
        label: type.charAt(0).toUpperCase() + type.slice(1)
      }
  }

  return baseNode
}
</script>

<style scoped>
.glass-sidebar {
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}
</style>