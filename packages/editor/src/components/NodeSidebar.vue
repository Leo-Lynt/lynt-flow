<template>
  <div class="glass-sidebar fixed top-20 bottom-4 left-4 w-64 backdrop-blur-xl bg-white/70 border border-white/40 rounded-2xl shadow-xl shadow-gray-900/5 z-30 transition-transform duration-300 ease-in-out -translate-x-full lg:translate-x-0 flex flex-col overflow-hidden group">
    <!-- Brilho no hover (sutil) -->
    <div class="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

    <!-- Corner decoration (canto inferior direito) -->
    <div class="absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br from-blue-500 to-cyan-500 opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"></div>

    <div class="p-4 border-b border-white/40 relative z-10">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Buscar nodes..."
        class="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm bg-white text-gray-900 transition-all duration-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder-gray-500 tracking-wide shadow-sm"
      />
    </div>

    <div class="flex-1 overflow-y-auto px-4 pb-4 pt-4 space-y-2 relative z-10">
      <div
        v-for="category in filteredCategories"
        :key="category.name"
        class="space-y-1"
      >
        <!-- Category Header - Clicável para expandir/colapsar -->
        <div
          :class="[
            'group flex items-center w-full px-3 py-2.5 cursor-pointer transition-all duration-300 select-none rounded-xl shadow-sm',
            expandedCategories[category.name]
              ? 'bg-blue-500/10 text-blue-600 shadow-md shadow-blue-500/10'
              : 'text-gray-700 hover:bg-white/50 hover:shadow-sm hover:-translate-y-0.5'
          ]"
          @click="toggleCategory(category.name)"
        >
          <FlowIcon
            :icon="expandedCategories[category.name] ? 'material-symbols:keyboard-arrow-down' : 'material-symbols:keyboard-arrow-right'"
            :size="16"
            :class="[
              'mr-2 transition-transform duration-200',
              expandedCategories[category.name] ? 'text-blue-600' : 'text-gray-500'
            ]"
          />
          <FlowIcon
            :icon="category.icon"
            :size="16"
            :class="[
              'w-5 h-5 mr-3 flex-shrink-0 transition-all duration-300',
              expandedCategories[category.name] ? 'text-blue-600 scale-110' : 'text-gray-500 group-hover:scale-110'
            ]"
          />
          <span class="flex-1 text-sm font-medium">{{ category.name }}</span>
          <span class="text-xs px-2 py-0.5 rounded-full font-medium"
            :class="expandedCategories[category.name]
              ? 'text-blue-700 bg-blue-50 border border-blue-200'
              : 'text-gray-600 bg-gray-50 border border-gray-200'">
            {{ category.nodes.length }}
          </span>
        </div>

        <!-- Nodes da categoria - Mostrar/Esconder baseado em expansão -->
        <div v-show="expandedCategories[category.name]" class="ml-4 mt-1 space-y-0.5 pb-2">
          <div
            v-for="node in category.nodes"
            :key="node.type"
          >
            <button
              :class="[
                'group flex items-center w-full px-3 py-2 text-sm rounded-lg transition-all duration-200 bg-white border shadow-sm',
                isNodeDisabled(node.type)
                  ? 'opacity-50 cursor-not-allowed text-gray-500 border-gray-200'
                  : 'text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:shadow-md'
              ]"
              :draggable="!isNodeDisabled(node.type)"
              @dragstart="handleDragStart($event, node)"
              @click="handleNodeClick(node)"
            >
              <FlowIcon
                :icon="node.icon"
                :class="[
                  'w-4 h-4 mr-3 flex-shrink-0 transition-colors',
                  isNodeDisabled(node.type) ? 'text-gray-400' : 'text-gray-500 group-hover:text-blue-600'
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