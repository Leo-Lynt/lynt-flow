<template>
  <div
    v-if="selectedNode"
    class="w-80 h-full glass-sidebar backdrop-blur-xl bg-white/30 dark:bg-gray-900/30 border-l border-white/20 dark:border-gray-700/20 flex flex-col transition-all duration-300"
  >
    <div class="h-full flex flex-col">
      <div class="flex items-center p-4 border-b border-white/20 dark:border-gray-700/20 bg-white/10 dark:bg-gray-800/10">
        <div class="w-10 h-10 flex items-center justify-center bg-white/60 dark:bg-gray-900/60 border border-white/30 dark:border-gray-700/30 rounded-lg mr-3">
          <FlowIcon :icon="getNodeIcon(selectedNode.type)" :size="20" class="text-brand-purple dark:text-brand-purple" />
        </div>
        <div class="flex-1">
          <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100 m-0 tracking-wide">{{ selectedNode.data?.label || 'Node' }}</h3>
          <p class="text-xs text-gray-600 dark:text-gray-400 m-0 mt-0.5 tracking-wide">{{ getNodeTypeName(selectedNode.type) }}</p>
        </div>
        <button @click="$emit('close')" class="w-8 h-8 flex items-center justify-center bg-transparent border-none rounded-md text-gray-600 dark:text-gray-400 cursor-pointer transition-all duration-200 hover:bg-white/40 dark:hover:bg-gray-900/40 hover:brightness-110 hover:text-gray-800 dark:hover:text-gray-200">
          <FlowIcon icon="material-symbols:close" :size="16" />
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-4">
        <!-- Dynamic Property Component -->
        <component
          v-if="currentPropertyComponent"
          :is="currentPropertyComponent"
          :node-id="selectedNode.id"
          :local-data="localData"
          @update-node-data="updateNodeData"
        />

        <!-- Fallback for nodes without specific property components -->
        <div v-else-if="selectedNode" class="mb-6">
          <div class="p-4 text-center text-xs text-gray-600 dark:text-gray-400 italic bg-white/40 dark:bg-gray-800/40 rounded-md border border-dashed border-white/30 dark:border-gray-700/30 tracking-wide">
            Nenhuma propriedade específica disponível para este tipo de node.
          </div>
        </div>
      </div>

      <div class="p-4 border-t border-white/20 dark:border-gray-700/20">
        <button @click="deleteNode" class="w-full px-2.5 py-2.5 flex items-center justify-center gap-2 bg-white/60 dark:bg-gray-900/60 hover:bg-white/80 dark:hover:bg-gray-800/80 border border-brand-red hover:brightness-110 rounded-md text-brand-red text-sm font-medium cursor-pointer transition-all tracking-wide">
          <FlowIcon icon="material-symbols:delete" :size="16" />
          Deletar Node
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useFlowStore } from '../stores/flowStore'
import FlowIcon from './Icon.vue'
import GenericProperties from './nodes/properties/GenericProperties.vue'
import OutputProperties from './nodes/properties/OutputProperties.vue'
import ArrayMergeProperties from './nodes/properties/ArrayMergeProperties.vue'
import ObjectCreateProperties from './nodes/properties/ObjectCreateProperties.vue'
import ArrayCreateProperties from './nodes/properties/ArrayCreateProperties.vue'

const props = defineProps({
  selectedNode: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'delete'])

const flowStore = useFlowStore()

// Property component específico por tipo de node
const currentPropertyComponent = computed(() => {
  if (!props.selectedNode) return null

  // Usar OutputProperties para nodes do tipo output
  if (props.selectedNode.type === 'output') {
    return OutputProperties
  }

  // Usar ArrayMergeProperties para nodes do tipo array-merge
  if (props.selectedNode.type === 'array-merge') {
    return ArrayMergeProperties
  }

  // Usar ObjectCreateProperties para nodes do tipo object-create
  if (props.selectedNode.type === 'object-create') {
    return ObjectCreateProperties
  }

  // Usar ArrayCreateProperties para nodes do tipo array-create
  if (props.selectedNode.type === 'array-create') {
    return ArrayCreateProperties
  }

  // Usar GenericProperties para os demais
  return GenericProperties
})

// Computed localData from flowStore (always fresh)
const localData = computed(() => {
  if (!props.selectedNode) return {}

  const storedData = flowStore.nodeData[props.selectedNode.id]
  const nodeData = storedData ? { ...storedData } : {}

  // Initialize selectedFields for field-extractor nodes if not present
  if (props.selectedNode.type === 'field-extractor') {
    if (!nodeData.selectedFields) {
      nodeData.selectedFields = []
    }
    if (!nodeData.fieldOutputsEnabled) {
      nodeData.fieldOutputsEnabled = {}
    }
    if (!nodeData.fieldTypes) {
      nodeData.fieldTypes = {}
    }
  }

  // Initialize outputFields array for output nodes if not present
  if (props.selectedNode.type === 'output' && !nodeData.outputFields) {
    nodeData.outputFields = []
  }

  return nodeData
})

const updateNodeData = () => {
  // This function is not needed anymore - GenericProperties updates directly
}




const deleteNode = () => {
  if (props.selectedNode) {
    flowStore.removeNode(props.selectedNode.id)
    emit('delete')
  }
}

const getNodeIcon = (type) => {
  const icons = {
    'input': 'material-symbols:input',
    'connector': 'material-symbols:cable',
    'field-extractor': 'material-symbols:filter-alt',
    'array-processor': 'material-symbols:list',
    'add': 'material-symbols:add',
    'subtract': 'material-symbols:remove',
    'multiply': 'material-symbols:close',
    'divide': 'material-symbols:percent',
    'variable': 'material-symbols:bookmark',
    'output': 'material-symbols:output'
  }
  return icons[type] || 'material-symbols:view-in-ar'
}

const getNodeTypeName = (type) => {
  const names = {
    'input': 'Parâmetros de Entrada',
    'connector': 'Conector de Dados',
    'field-extractor': 'Extrator de Campos',
    'array-processor': 'Processador de Array',
    'add': 'Adição',
    'subtract': 'Subtração',
    'multiply': 'Multiplicação',
    'divide': 'Divisão',
    'variable': 'Variável',
    'output': 'Saída'
  }
  return names[type] || type
}

</script>

<style scoped>
.glass-sidebar {
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}
</style>