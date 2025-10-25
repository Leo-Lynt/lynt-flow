<template>
  <div class="debug-viewer-node">
    <!-- Header -->
    <div class="node-header">
      <div class="flex items-center gap-2">
        <FlowIcon :icon="nodeDefinition?.icon || 'material-symbols:bug-report'" :size="16" />
        <span class="font-medium">{{ displayLabel }}</span>
      </div>
      <button
        @click="toggleExpand"
        class="expand-btn"
        title="Toggle expand/collapse"
      >
        <FlowIcon
          :icon="isExpanded ? 'material-symbols:expand-less' : 'material-symbols:expand-more'"
          :size="16"
        />
      </button>
    </div>

    <!-- Input Handle -->
    <Handle
      :id="`${id}-data-input`"
      type="target"
      :position="Position.Left"
      :style="{ background: getTypeColor('any'), top: '50%' }"
      class="handle-input"
    />

    <!-- Data Display -->
    <div v-if="isExpanded" class="data-container">
      <!-- Type Badge -->
      <div class="type-badge" :style="{ backgroundColor: typeColor }">
        {{ dataType }}
      </div>

      <!-- No Data -->
      <div v-if="!hasData" class="no-data">
        <FlowIcon icon="material-symbols:info-outline" :size="20" />
        <span>No data connected</span>
      </div>

      <!-- Render Data Recursively -->
      <div v-else class="data-tree">
        <DataNode :value="dataValue" :path="[]" />
      </div>
    </div>

    <!-- Collapsed Preview -->
    <div v-else class="collapsed-preview">
      <span v-if="hasData" class="preview-text">{{ previewText }}</span>
      <span v-else class="no-data-text">No data</span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import { useFlowStore } from '../../stores/flowStore'
import { getNodeDefinition } from '../../engine/registry'
import { getTypeColor } from '@leo-lynt/lynt-flow-core/engine/dataTypes.js'
import FlowIcon from '../Icon.vue'
import DataNode from './debug/DataNode.vue'

const props = defineProps({
  id: {
    type: String,
    required: true
  },
  data: {
    type: Object,
    default: () => ({})
  }
})

const flowStore = useFlowStore()

// Get node definition
const nodeDefinition = computed(() => {
  const node = flowStore.nodes.find(n => n.id === props.id)
  if (!node) return null
  return getNodeDefinition(node.type)
})

// Get display label
const displayLabel = computed(() => {
  return props.data?.label || nodeDefinition.value?.label || 'Debug Viewer'
})

// Expand state
const isExpanded = ref(props.data?.expanded !== false)

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

// Get input data
const dataValue = computed(() => {
  const incomingEdges = flowStore.edges.filter(e =>
    e.target === props.id &&
    e.edgeType !== 'flow'
  )

  if (incomingEdges.length === 0) return null

  const sourceEdge = incomingEdges[0]
  const sourceOutputs = flowStore.executionResults[sourceEdge.source]

  if (!sourceOutputs) return null

  const sourceValue = (typeof sourceOutputs === 'object' && sourceOutputs !== null && sourceEdge.sourceHandle in sourceOutputs)
    ? sourceOutputs[sourceEdge.sourceHandle]
    : sourceOutputs

  return sourceValue
})

// Data type detection
const hasData = computed(() => dataValue.value !== null && dataValue.value !== undefined)

const dataType = computed(() => {
  if (!hasData.value) return 'undefined'

  const val = dataValue.value
  if (Array.isArray(val)) return 'array'
  if (val === null) return 'null'
  if (typeof val === 'object') return 'object'
  if (typeof val === 'string') return 'string'
  if (typeof val === 'number') return 'number'
  if (typeof val === 'boolean') return 'boolean'
  return 'unknown'
})

const typeColor = computed(() => {
  const colors = {
    array: '#10b981',
    object: '#3b82f6',
    string: '#f59e0b',
    number: '#8b5cf6',
    boolean: '#ec4899',
    null: '#6b7280',
    undefined: '#6b7280'
  }
  return colors[dataType.value] || '#6b7280'
})

// Preview text for collapsed state
const previewText = computed(() => {
  if (!hasData.value) return 'No data'

  if (dataType.value === 'array') {
    return `Array (${dataValue.value.length})`
  }

  if (dataType.value === 'object') {
    const keys = Object.keys(dataValue.value)
    return `Object {${keys.length} props}`
  }

  const val = dataValue.value
  if (val === null) return 'null'
  if (val === undefined) return 'undefined'
  if (typeof val === 'string') return `"${val}"`
  if (typeof val === 'boolean') return val ? 'true' : 'false'
  return String(val)
})

// Watch for data changes
watch(() => props.data?.expanded, (newVal) => {
  if (newVal !== undefined) {
    isExpanded.value = newVal
  }
})
</script>

<style scoped>
.debug-viewer-node {
  background: white;
  border: 2px solid #f43f5e;
  border-radius: 8px;
  min-width: 280px;
  max-width: 500px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.dark .debug-viewer-node {
  background: #1e293b;
  border-color: #f43f5e;
}

.node-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%);
  color: white;
  border-radius: 6px 6px 0 0;
  font-size: 13px;
}

.expand-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 4px;
  padding: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.expand-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.data-container {
  padding: 12px;
  max-height: 600px;
  overflow-y: auto;
}

.collapsed-preview {
  padding: 8px 12px;
  font-size: 12px;
  color: #64748b;
  font-style: italic;
}

.dark .collapsed-preview {
  color: #94a3b8;
}

.type-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  color: white;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
  color: #94a3b8;
  font-size: 13px;
}

.data-tree {
  font-size: 12px;
  font-family: 'Courier New', monospace;
}

.handle-input {
  width: 12px;
  height: 12px;
  border: 2px solid white;
}
</style>
