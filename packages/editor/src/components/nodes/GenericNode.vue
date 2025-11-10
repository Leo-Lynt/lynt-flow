<template>
  <div
    class="generic-node rounded-lg bg-white dark:bg-gray-800 border-2 transition-all"
    :class="[
      isSelected ? 'selected-node' : '',
      isExecuting ? 'executing-node' : '',
      hasExecuted ? 'executed-node' : '',
      hasError ? 'error-node' : '',
      !isExecuting && !hasExecuted && !hasError ? 'border-gray-300 dark:border-gray-600' : '',
      'hover:shadow-xl'
    ]"
    :style="{
      borderLeftColor: nodeColor,
      borderLeftWidth: '4px'
    }"
    @click="logNodeData"
  >
    <!-- Header Row (Grid: exec-in | header content | exec-out) -->
    <div class="node-row header-row border-b border-gray-200 dark:border-gray-700">
      <!-- Exec Input Handle -->
      <div class="handle-cell handle-left nodrag">
        <ExecHandleInput
          v-if="hasExecInput"
          position="left"
          id="exec-in"
          top="50%"
        />
      </div>

      <!-- Header Content -->
      <div class="content-cell px-3 py-2">
        <div class="flex items-center gap-2">
          <FlowIcon
            :icon="nodeDefinition?.icon || 'material-symbols:view-in-ar'"
            :size="16"
            :style="{ color: nodeDefinition?.color || '#3b82f6' }"
          />
          <span class="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {{ data.label || nodeDefinition?.label || 'Node' }}
          </span>
        </div>
      </div>

      <!-- Exec Output Handle(s) -->
      <div class="handle-cell handle-right nodrag">
        <div v-if="execOutputHandles.length === 1">
          <ExecHandleOutput
            position="right"
            :id="execOutputHandles[0].id"
            top="50%"
          />
        </div>
        <div v-else-if="execOutputHandles.length > 1" class="flex flex-col gap-1">
          <div v-for="(handle, index) in execOutputHandles" :key="handle.id" class="flex items-center gap-1">
            <span class="text-[10px] text-gray-600 dark:text-gray-400">{{ handle.label }}</span>
            <ExecHandleOutput
              position="right"
              :id="handle.id"
              :top="`${25 + (index * 50)}%`"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Data Handles Section -->
    <div v-if="dataInputHandles.length > 0 || dataOutputHandles.length > 0" class="data-section">
      <div class="node-row">
        <!-- Left Side: Data Inputs -->
        <div class="handle-cell handle-left nodrag">
          <div v-for="handle in dataInputHandles" :key="handle.id" class="handle-wrapper">
            <DataHandle
              :id="handle.id"
              type="target"
              :position="handle.position || 'left'"
              :data-type="handle.type || 'any'"
            />
          </div>
        </div>

        <!-- Center: Split content for inputs (left) and outputs (right) -->
        <div class="content-cell">
          <div class="content-split">
            <!-- Left column: Input labels -->
            <div class="content-left">
              <div class="label-list">
                <div v-for="handle in dataInputHandles" :key="handle.id" class="label-item">
                  <span
                    v-if="getInputPreview(handle.id)"
                    class="text-[10px] mr-1 px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded font-mono text-gray-500 dark:text-gray-400"
                    :title="`Value: ${getInputPreview(handle.id)}`"
                  >
                    {{ getInputPreview(handle.id) }}
                  </span>
                  <span class="text-xs text-gray-600 dark:text-gray-400">
                    {{ handle.label }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Right column: Output labels -->
            <div class="content-right">
              <div class="label-list">
                <div v-for="handle in dataOutputHandles" :key="handle.id" class="label-item">
                  <span class="text-xs text-gray-600 dark:text-gray-400">
                    {{ handle.label }}
                  </span>
                  <span
                    v-if="getOutputPreview(handle)"
                    class="text-[10px] ml-1 px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded font-mono text-gray-500 dark:text-gray-400"
                    :title="`Value: ${getOutputPreview(handle)}`"
                  >
                    {{ getOutputPreview(handle) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side: Data Outputs -->
        <div class="handle-cell handle-right nodrag">
          <div v-for="handle in dataOutputHandles" :key="handle.id" class="handle-wrapper">
            <DataHandle
              :id="handle.id"
              type="source"
              :position="handle.position || 'right'"
              :data-type="handle.type || 'any'"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useFlowStore } from '../../stores/flowStore'
import { getNodeDefinition } from '../../engine/registry'
import { getHandleType as getHandleTypeFromSystem } from '@leo-lynt/lynt-flow-core/engine/typeSystem.js'
import { useDynamicHandles } from '../../composables/nodes/useDynamicHandles'
import { getCategoryColor } from '../../composables/nodes/useCategoryColors'
import { getFieldValue } from '@leo-lynt/lynt-flow-core/utils'
import DataHandle from './DataHandle.vue'
import ExecHandleInput from './ExecHandleInput.vue'
import ExecHandleOutput from './ExecHandleOutput.vue'
import FlowIcon from '../Icon.vue'

/**
 * Sanitize handle ID to ensure it's valid for VueFlow
 * Removes/replaces special characters that could break CSS selectors or HTML attributes
 */
function sanitizeHandleId(id) {
  if (!id) return id

  return id
    .replace(/\s+/g, '_')        // Replace spaces with underscores
    .replace(/[+\-*/=<>!@#$%^&*()[\]{}|\\;:'",<>?`~]/g, '_')  // Replace special chars with underscores
    .replace(/_{2,}/g, '_')      // Replace multiple underscores with single
    .replace(/^_|_$/g, '')       // Remove leading/trailing underscores
}

const props = defineProps({
  id: {
    type: String,
    required: true
  },
  data: {
    type: Object,
    default: () => ({})
  },
  selected: {
    type: Boolean,
    default: false
  }
})

const flowStore = useFlowStore()

// Get node type
const nodeType = computed(() => {
  const node = flowStore.nodes.find(n => n.id === props.id)
  return node?.type
})

// Get node definition from catalog
const nodeDefinition = computed(() => {
  const node = flowStore.nodes.find(n => n.id === props.id)
  if (!node) return null
  return getNodeDefinition(node.type)
})

const isSelected = computed(() => props.selected)

// Execution states
const isExecuting = computed(() => flowStore.executingNodes.has(props.id))
const hasExecuted = computed(() => flowStore.executedNodes.has(props.id))
const hasError = computed(() => flowStore.errorNodes.has(props.id))

// Get category color
const nodeColor = computed(() => {
  const category = nodeDefinition.value?.category
  return category ? getCategoryColor(category) : '#3b82f6'
})

// Get execution result for this node
const executionResult = computed(() => {
  return flowStore.executionResults[props.id]
})

// Get current node data
const currentNode = computed(() => {
  return flowStore.nodes.find(n => n.id === props.id)
})

// Get handles based on node type and mode/operation (for variable and array-slice)
const getHandlesForNode = computed(() => {
  const def = nodeDefinition.value
  if (!def) return null

  // Check if node has dynamic handles
  if (def.dynamicHandles && currentNode.value) {
    // The "mode" property in dynamicHandles contains the KEY name to look up
    // For Variable: "mode": "get" means look for nodeData.get (which doesn't exist, so it's actually nodeData.mode)
    // For Array Slice: "mode": "operation" means look for nodeData.operation

    // CORRECTION: The structure is:
    // Variable has mode="get" as DEFAULT value, but the key is still "mode"
    // Array Slice has mode="operation" which means the KEY is "operation"

    // If mode value matches a known handle set (get/set/first/last/etc), use mode as key
    // Otherwise, use the mode value as the key name
    let dynamicKey = 'mode'
    const modeValue = def.dynamicHandles.mode

    // If the mode value is a handle set name (exists in dynamicHandles), then key is 'mode'
    // Otherwise, mode value IS the key name
    if (!def.dynamicHandles[modeValue]) {
      dynamicKey = modeValue
    }

    // Use flowStore.nodeData for better reactivity
    const nodeData = flowStore.nodeData[props.id]
    const selectedValue = nodeData?.[dynamicKey] || modeValue


    return def.dynamicHandles[selectedValue] || def.handles
  }

  return def.handles
})

// Parse handles from definition
const hasExecInput = computed(() => {
  const handles = getHandlesForNode.value
  return handles?.inputs?.execution && handles.inputs.execution.length > 0
})

const hasExecOutput = computed(() => {
  const handles = getHandlesForNode.value
  return handles?.outputs?.execution && handles.outputs.execution.length > 0
})

const execOutputHandles = computed(() => {
  const handles = getHandlesForNode.value
  return handles?.outputs?.execution || []
})

const dataInputHandles = computed(() => {
  // Add explicit dependency on edges to trigger reactivity
  const edgesCount = flowStore.edges.length

  // Get dynamic handles (includes exposed fields)
  const dynamicInputHandles = dynamicHandles.value.filter(h => h.position === 'left')

  const handles = getHandlesForNode.value
  const baseHandles = handles?.inputs?.data || []

  // Get node data
  const nodeData = flowStore.nodeData[props.id]

  // NOVO SISTEMA: Mapear handles com tipos dinâmicos
  const mappedBaseHandles = baseHandles.map(handle => {
    // Se o handle tem propriedade 'dynamic', usar o sistema de tipos dinâmicos
    if (handle.dynamic) {
      const dynamicType = getHandleTypeFromSystem(
        nodeType.value,
        { ...nodeData, _nodeId: props.id },
        handle.id,
        'target',
        flowStore
      )
      return {
        ...handle,
        type: dynamicType
      }
    }

    // Legado: Para variable nodes com wildcard
    if (nodeType.value === 'variable') {
      return {
        ...handle,
        type: getActualHandleType(handle.id, 'target')
      }
    }

    return handle
  })

  // For string-ops in template mode, use ONLY dynamic handles (placeholders)
  if (nodeType.value === 'string-ops' && nodeData?.operation === 'template') {
    return dynamicInputHandles // Only placeholders, no base handles
  }

  // For output node, use ONLY dynamic handles (no base handles)
  if (nodeType.value === 'output') {
    return dynamicInputHandles // Only dynamic inputs
  }

  // For array-merge node, use ONLY dynamic handles (no base handles)
  if (nodeType.value === 'array-merge') {
    return dynamicInputHandles // Only dynamic array inputs
  }

  // For object-create node, use ONLY dynamic handles (no base handles)
  if (nodeType.value === 'object-create') {
    return dynamicInputHandles // Only dynamic properties
  }

  // For array-create node, use ONLY dynamic handles (no base handles)
  if (nodeType.value === 'array-create') {
    return dynamicInputHandles // Only dynamic items
  }

  // Combine mapped base handles with dynamic handles (exposed fields)
  return [...mappedBaseHandles, ...dynamicInputHandles]
})

// Use dynamic handles composable
const { dynamicHandles } = useDynamicHandles(props.id, nodeType)

const dataOutputHandles = computed(() => {
  // Add explicit dependency on edges and savedDetectedTypes to trigger reactivity
  const edgesCount = flowStore.edges.length
  // Trigger reactivity when savedDetectedTypes changes for THIS node
  const detectedTypes = flowStore.savedDetectedTypes[props.id]

  // Check if node type has dynamic handles for OUTPUTS
  // Note: 'output' node type should NOT have dynamic output handles, only inputs
  if (nodeType.value === 'field-extractor' || nodeType.value === 'input') {
    return dynamicHandles.value
  }

  const handles = getHandlesForNode.value
  const baseHandles = handles?.outputs?.data || []

  // NOVO SISTEMA: Usar getHandleTypeFromSystem para detectar tipos dinâmicos
  const nodeData = flowStore.nodeData[props.id]

  return baseHandles.map(handle => {
    // Se o handle tem propriedade 'dynamic', usar o sistema de tipos dinâmicos
    if (handle.dynamic) {
      const dynamicType = getHandleTypeFromSystem(
        nodeType.value,
        { ...nodeData, _nodeId: props.id },
        handle.id,
        'source',
        flowStore
      )
      return {
        ...handle,
        type: dynamicType
      }
    }

    // Legado: Para variable e array-slice com wildcard (manter compatibilidade)
    if ((nodeType.value === 'variable' || nodeType.value === 'array-slice') && handle.wildcard) {
      return {
        ...handle,
        type: getActualHandleType(handle.id, 'source')
      }
    }

    // Legado: Para nodes de processamento de array que mantêm o tipo do input
    const arrayProcessingNodes = [
      'array-filter', 'array-sort', 'array-distinct',
      'array-map', 'array-groupby', 'array-merge'
    ]
    if (arrayProcessingNodes.includes(nodeType.value) && ['array', 'any'].includes(handle.type)) {
      return {
        ...handle,
        type: getInputBasedType()
      }
    }

    // Padrão: retornar handle sem modificações
    return handle
  })
})

// Get type based on input connection (for array processing nodes)
const getInputBasedType = () => {
  const inputEdges = flowStore.edges.filter(e =>
    e.target === props.id &&
    e.targetHandle === 'data-input' &&
    e.edgeType !== 'flow'
  )

  if (inputEdges.length > 0) {
    const sourceOutputs = flowStore.executionResults[inputEdges[0].source]
    if (sourceOutputs && inputEdges[0].sourceHandle in sourceOutputs) {
      const inputData = sourceOutputs[inputEdges[0].sourceHandle]

      // Detectar tipo do array
      if (Array.isArray(inputData)) {
        return 'array'
      } else if (typeof inputData === 'object' && inputData !== null) {
        return 'object'
      } else if (typeof inputData === 'number') {
        return 'number'
      } else if (typeof inputData === 'string') {
        return 'string'
      } else if (typeof inputData === 'boolean') {
        return 'boolean'
      }
    }
  }

  return 'any'
}

// Get actual type of a handle (for wildcard nodes like variable and array-slice)
const getActualHandleType = (handleId, handlePosition) => {
  // Handle array-slice type detection
  if (nodeType.value === 'array-slice' && handlePosition === 'source' && handleId === 'data-out') {
    const currentNodeData = flowStore.nodeData[props.id]
    const operation = currentNodeData?.operation || 'first'

    // If operation returns array, keep as array type
    if (['take', 'skip', 'slice'].includes(operation)) {
      return 'array'
    }

    // For first/last, detect type from input array items
    const inputEdges = flowStore.edges.filter(e =>
      e.target === props.id &&
      e.targetHandle === 'data-input' &&
      e.edgeType !== 'flow'
    )

    if (inputEdges.length > 0) {
      const sourceOutputs = flowStore.executionResults[inputEdges[0].source]
      if (sourceOutputs && inputEdges[0].sourceHandle in sourceOutputs) {
        const arrayData = sourceOutputs[inputEdges[0].sourceHandle]

        // If array has items, detect type from first item
        if (Array.isArray(arrayData) && arrayData.length > 0) {
          const firstItem = arrayData[0]
          if (typeof firstItem === 'object' && firstItem !== null) return 'object'
          if (typeof firstItem === 'number') return 'number'
          if (typeof firstItem === 'string') return 'string'
          if (typeof firstItem === 'boolean') return 'boolean'
        }
      }
    }

    return 'any'
  }

  if (nodeType.value !== 'variable') return 'any'

  const currentNodeData = flowStore.nodeData[props.id]
  const variableName = currentNodeData?.variableName
  const mode = currentNodeData?.mode || 'get'

  // For variable output (both GET and SET modes have data-out)
  if (handlePosition === 'source' && handleId === 'data-out') {
    // If it's SET mode, check if there's an input connected to THIS node
    if (mode === 'set') {
      const inputEdges = flowStore.edges.filter(e =>
        e.target === props.id &&
        e.targetHandle === 'data-input' &&
        e.edgeType !== 'flow'
      )

      if (inputEdges.length > 0) {
        const sourceNode = flowStore.nodes.find(n => n.id === inputEdges[0].source)
        if (sourceNode) {
          const detectedType = detectSourceNodeType(sourceNode, inputEdges[0].sourceHandle)
          return detectedType
        }
      }
    }

    // If it's GET mode, look for a SET variable with the same name
    if (mode === 'get' && variableName) {
      // Find all variable nodes with SET mode and same variable name
      const setVariables = flowStore.nodes.filter(n =>
        n.type === 'variable' &&
        n.id !== props.id &&
        flowStore.nodeData[n.id]?.mode === 'set' &&
        flowStore.nodeData[n.id]?.variableName === variableName
      )

      // Check if any SET variable has an input connected
      for (const setVar of setVariables) {
        const inputEdges = flowStore.edges.filter(e =>
          e.target === setVar.id &&
          e.targetHandle === 'data-input' &&
          e.edgeType !== 'flow'
        )

        if (inputEdges.length > 0) {
          const sourceNode = flowStore.nodes.find(n => n.id === inputEdges[0].source)
          if (sourceNode) {
            const detectedType = detectSourceNodeType(sourceNode, inputEdges[0].sourceHandle)
            return detectedType
          }
        }
      }
    }
  }

  // For variable input (only SET mode has data-input)
  if (handlePosition === 'target' && handleId === 'data-input') {
    const outputEdges = flowStore.edges.filter(e =>
      e.source === props.id &&
      e.sourceHandle === 'data-out' &&
      e.edgeType !== 'flow'
    )

    if (outputEdges.length > 0) {
      const targetNode = flowStore.nodes.find(n => n.id === outputEdges[0].target)
      if (targetNode) {
        return detectSourceNodeType(targetNode, outputEdges[0].targetHandle)
      }
    }
  }

  return 'any'
}

// Detect type from source node using typeSystem
const detectSourceNodeType = (node, handleId) => {
  const nodeData = flowStore.nodeData[node.id]
  if (!nodeData) return 'any'

  // Adicionar nodeId ao nodeData para casos dinâmicos
  const nodeDataWithId = { ...nodeData, _nodeId: node.id }
  return getHandleTypeFromSystem(node.type, nodeDataWithId, handleId, 'source', flowStore)
}

const formatResult = (result) => {
  if (result === null) return 'null'
  if (result === undefined) return 'undefined'
  if (typeof result === 'object') {
    return JSON.stringify(result).substring(0, 50) + '...'
  }
  return String(result).substring(0, 50)
}

// Log node data when clicked
const logNodeData = () => {
  const nodeResults = flowStore.executionResults[props.id]
  const detectedTypes = flowStore.savedDetectedTypes[props.id] || {}

  // Check execution connections
  const execInputEdges = flowStore.edges.filter(e =>
    e.target === props.id &&
    e.targetHandle === 'exec-in' &&
    e.edgeType === 'flow'
  )

  const execOutputEdges = flowStore.edges.filter(e =>
    e.source === props.id &&
    e.sourceHandle === 'exec-out' &&
    e.edgeType === 'flow'
  )

  // Collect input values with types
  const inputs = {}
  dataInputHandles.value.forEach(handle => {
    const incomingEdges = flowStore.edges.filter(e =>
      e.target === props.id &&
      e.targetHandle === handle.id &&
      e.edgeType !== 'flow'
    )

    if (incomingEdges.length > 0) {
      const sourceEdge = incomingEdges[0]
      const sourceOutputs = flowStore.executionResults[sourceEdge.source]
      const sourceDetectedTypes = flowStore.savedDetectedTypes[sourceEdge.source] || {}

      const value = sourceOutputs?.[sourceEdge.sourceHandle]
      const type = sourceDetectedTypes[sourceEdge.sourceHandle] || handle.type || 'unknown'

      inputs[handle.id] = {
        value,
        type,
        label: handle.label
      }
    }
  })

  // Collect output values with types
  const outputs = {}
  dataOutputHandles.value.forEach(handle => {
    const value = nodeResults?.[handle.id]

    // For Input nodes and config-based dynamic handles, prioritize handle.type
    const isConfigBased = handle.dynamic?.mode === 'config-based'
    const isInputNode = nodeType.value === 'input'

    const type = (isConfigBased || isInputNode)
      ? (handle.type || detectedTypes[handle.id] || 'unknown')
      : (detectedTypes[handle.id] || handle.type || 'unknown')

    outputs[handle.id] = {
      value,
      type,
      label: handle.label
    }
  })

  // 🐛 DEBUG LOG
  console.group(`🔍 Node Debug: ${props.id} (${nodeType.value})`)

  console.log('📥 INPUTS:', inputs)
  Object.entries(inputs).forEach(([handleId, data]) => {
    // Format value for display
    const displayValue = formatPreviewValue(data.value)

    console.log(`  • ${data.label || handleId}:`, {
      type: data.type,
      value: displayValue
    })
  })

  console.log('📤 OUTPUTS:', outputs)
  Object.entries(outputs).forEach(([handleId, data]) => {
    // Format value for display
    const displayValue = formatPreviewValue(data.value)

    console.log(`  • ${data.label || handleId}:`, {
      type: data.type,
      value: displayValue
    })
  })

  console.log('🔗 EXECUTION EDGES:', {
    inputs: execInputEdges.length,
    outputs: execOutputEdges.length
  })

  console.groupEnd()
}

// Get input handle preview value
const getInputPreview = (handleId) => {
  // Find incoming data edge for this specific handle
  const incomingEdges = flowStore.edges.filter(e =>
    e.target === props.id &&
    e.targetHandle === handleId &&
    e.edgeType !== 'flow'
  )

  if (incomingEdges.length === 0) return null

  // Get source edge and node
  const sourceEdge = incomingEdges[0]
  const sourceNode = flowStore.nodes.find(n => n.id === sourceEdge.source)

  if (!sourceNode) return null

  const sourceOutputs = flowStore.executionResults[sourceEdge.source]
  if (!sourceOutputs) return null

  // Get the specific value from the source handle
  // Se sourceOutputs não é um objeto (é primitivo), retornar ele diretamente
  const sourceValue = (typeof sourceOutputs === 'object' && sourceOutputs !== null && sourceEdge.sourceHandle in sourceOutputs)
    ? sourceOutputs[sourceEdge.sourceHandle]
    : sourceOutputs

  return formatPreviewValue(sourceValue)
}

// Get output preview value (for output handles)
const getOutputPreview = computed(() => {
  // Acessar executionResults dentro do computed para garantir reatividade
  const nodeResults = flowStore.executionResults[props.id]
  const node = flowStore.nodes.find(n => n.id === props.id)
  const wasExecuted = flowStore.executedNodes.has(props.id)

  // Retornar uma função que usa os valores reativos capturados
  return (handle) => {
    // Only show output preview if node was actually executed in current run
    if (!node || !nodeResults || !wasExecuted) {
      return null
    }

    // Para Field Extractor, mapear label para handle ID
    if (node.type === 'field-extractor') {
      // Skip "All Extracted Data"
      if (handle.label === 'All Extracted Data') return null

      const handleId = `field-${sanitizeHandleId(handle.label)}`
      const fieldValue = nodeResults[handleId]
      if (fieldValue === undefined || fieldValue === null) return null
      return formatPreviewValue(fieldValue)
    }

    // Para Variable e outros nodes, usar o handle.id diretamente
    const outputValue = nodeResults[handle.id]
    if (outputValue === undefined || outputValue === null) return null

    return formatPreviewValue(outputValue)
  }
})

// Helper to format preview values
const formatPreviewValue = (value) => {
  if (value === undefined) return null
  if (value === null) return 'null'

  // Date objects - format as YYYY-MM-DD
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return 'Invalid Date'
    const year = value.getFullYear()
    const month = String(value.getMonth() + 1).padStart(2, '0')
    const day = String(value.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  if (typeof value === 'string') {
    // Se é uma data em qualquer formato comum, mostrar sem aspas
    const dateFormats = [
      /^\d{4}-\d{2}-\d{2}$/,        // YYYY-MM-DD
      /^\d{2}\/\d{2}\/\d{4}$/,      // DD/MM/YYYY ou MM/DD/YYYY
      /^\d{2}-\d{2}-\d{4}$/,        // DD-MM-YYYY
      /^\d{4}\/\d{2}\/\d{2}$/       // YYYY/MM/DD
    ]

    if (dateFormats.some(regex => regex.test(value))) {
      return value
    }
    return value.length > 20 ? `"${value.substring(0, 17)}..."` : `"${value}"`
  }
  if (typeof value === 'number') {
    // Format large numbers
    if (Math.abs(value) >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M'
    }
    if (Math.abs(value) >= 1000) {
      return (value / 1000).toFixed(1) + 'K'
    }
    return value.toString()
  }
  if (typeof value === 'boolean') {
    return value ? '✓' : '✗'
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]'
    if (value.length === 1) return '[1 item]'
    return `[${value.length} items]`
  }
  if (typeof value === 'object') {
    const keys = Object.keys(value)
    if (keys.length === 0) return '{}'
    if (keys.length === 1) return `{${keys[0]}}`
    return `{${keys.length} keys}`
  }

  return String(value).substring(0, 20)
}
</script>

<style scoped>
.generic-node {
  min-width: 180px;
  max-width: 280px;
}

.data-section {
  border-top: 1px solid #e5e7eb;
}

.dark .data-section {
  border-top-color: #374151;
}

/* Grid layout: handle-left | content | handle-right */
.node-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: flex-start;
  position: relative;
  padding: 4px 0;
}

.header-row {
  align-items: center;
  padding: 0;
}

.handle-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  position: relative;
  padding: 4px 0;
}

.handle-left {
  padding-right: 2px;
}

.handle-right {
  padding-left: 2px;
}

.content-cell {
  flex: 1;
  min-width: 0;
}

.content-split {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 2px;
  align-items: flex-start;
  padding: 8px 0;
}

.content-left {
  text-align: left;
  padding-left: 0;
  overflow: hidden;
  min-width: 0;
}

.content-left .label-item {
  justify-content: flex-start;
}

.content-right {
  text-align: right;
  padding-right: 0;
  overflow: hidden;
  min-width: 0;
}

.content-right .label-item {
  justify-content: flex-end;
}

.handle-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  position: relative;
}

.label-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.label-item {
  display: flex;
  align-items: center;
  min-height: 24px;
}

/* Efeito de seleção sem mudar cor da borda */
.selected-node {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
  filter: drop-shadow(0 4px 12px rgba(59, 130, 246, 0.4));
}

/* Execution states */
.executing-node {
  border-color: #f59e0b !important;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.3);
  animation: pulse-executing 1.5s ease-in-out infinite;
}

.executed-node {
  border-color: #10b981 !important;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
}

.error-node {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.3);
  animation: shake 0.5s ease-in-out;
}

@keyframes pulse-executing {
  0%, 100% {
    box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.3);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(245, 158, 11, 0.5);
  }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}
</style>
