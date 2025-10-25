<template>
  <div class="data-node" :style="{ paddingLeft: `${depth * 12}px` }">
    <!-- Primitive Value -->
    <div v-if="isPrimitive" class="primitive-line">
      <span class="value" :class="`type-${valueType}`">{{ formattedValue }}</span>
    </div>

    <!-- Array -->
    <div v-else-if="isArray" class="array-node">
      <div class="array-header" @click="toggleExpand">
        <button class="expand-icon">
          <FlowIcon
            :icon="isExpanded ? 'material-symbols:arrow-drop-down' : 'material-symbols:arrow-right'"
            :size="14"
          />
        </button>
        <span class="array-label">Array({{ value.length }})</span>
      </div>
      <div v-if="isExpanded" class="array-children">
        <div
          v-for="(item, index) in value"
          :key="index"
          class="array-item-row"
        >
          <span class="array-index">{{ index }}:</span>
          <DataNode :value="item" :path="[...path, index]" :depth="depth + 1" />
        </div>
      </div>
    </div>

    <!-- Object -->
    <div v-else-if="isObject" class="object-node">
      <div class="object-header" @click="toggleExpand">
        <button class="expand-icon">
          <FlowIcon
            :icon="isExpanded ? 'material-symbols:arrow-drop-down' : 'material-symbols:arrow-right'"
            :size="14"
          />
        </button>
        <span class="object-label">{{ objectLabel }}</span>
      </div>
      <div v-if="isExpanded" class="object-children">
        <div
          v-for="[key, val] in objectEntries"
          :key="key"
          class="object-property-row"
        >
          <span class="property-key">{{ key }}:</span>
          <DataNode :value="val" :path="[...path, key]" :depth="depth + 1" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import FlowIcon from '../../Icon.vue'

const props = defineProps({
  value: {
    required: true
  },
  path: {
    type: Array,
    default: () => []
  },
  depth: {
    type: Number,
    default: 0
  }
})

const isExpanded = ref(props.depth < 2) // Auto-expand first 2 levels

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

// Type detection
const valueType = computed(() => {
  const val = props.value
  if (val === null) return 'null'
  if (val === undefined) return 'undefined'
  if (Array.isArray(val)) return 'array'
  if (typeof val === 'object') return 'object'
  if (typeof val === 'string') return 'string'
  if (typeof val === 'number') return 'number'
  if (typeof val === 'boolean') return 'boolean'
  return 'unknown'
})

const isPrimitive = computed(() => {
  return ['null', 'undefined', 'string', 'number', 'boolean'].includes(valueType.value)
})

const isArray = computed(() => valueType.value === 'array')
const isObject = computed(() => valueType.value === 'object')

// Formatting
const formattedValue = computed(() => {
  const val = props.value
  if (val === null) return 'null'
  if (val === undefined) return 'undefined'
  if (typeof val === 'string') return `"${val}"`
  if (typeof val === 'boolean') return val ? 'true' : 'false'
  return String(val)
})

const objectEntries = computed(() => {
  if (!isObject.value) return []
  return Object.entries(props.value)
})

const objectLabel = computed(() => {
  const keys = Object.keys(props.value)
  return `{${keys.length} props}`
})
</script>

<style scoped>
.data-node {
  position: relative;
}

.primitive-line {
  padding: 2px 0;
}

.value {
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.value.type-string {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
}

.dark .value.type-string {
  color: #fcd34d;
}

.value.type-number {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.1);
}

.dark .value.type-number {
  color: #c084fc;
}

.value.type-boolean {
  color: #ec4899;
  background: rgba(236, 72, 153, 0.1);
}

.dark .value.type-boolean {
  color: #f9a8d4;
}

.value.type-null,
.value.type-undefined {
  color: #64748b;
  background: rgba(100, 116, 139, 0.1);
  font-style: italic;
}

.dark .value.type-null,
.dark .value.type-undefined {
  color: #94a3b8;
}

.array-node,
.object-node {
  margin: 2px 0;
}

.array-header,
.object-header {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.15s;
}

.array-header:hover,
.object-header:hover {
  background: rgba(59, 130, 246, 0.1);
}

.dark .array-header:hover,
.dark .object-header:hover {
  background: rgba(59, 130, 246, 0.2);
}

.expand-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  transition: color 0.15s;
}

.dark .expand-icon {
  color: #94a3b8;
}

.expand-icon:hover {
  color: #3b82f6;
}

.array-label,
.object-label {
  color: #3b82f6;
  font-weight: 600;
  font-size: 12px;
}

.dark .array-label,
.dark .object-label {
  color: #60a5fa;
}

.array-children,
.object-children {
  margin-top: 4px;
  border-left: 2px solid rgba(59, 130, 246, 0.2);
  padding-left: 8px;
}

.dark .array-children,
.dark .object-children {
  border-left-color: rgba(96, 165, 250, 0.3);
}

.array-item-row,
.object-property-row {
  display: flex;
  gap: 6px;
  align-items: baseline;
  padding: 2px 0;
}

.array-index {
  color: #64748b;
  font-weight: 600;
  font-size: 11px;
  min-width: 24px;
  text-align: right;
}

.dark .array-index {
  color: #94a3b8;
}

.property-key {
  color: #0ea5e9;
  font-weight: 600;
  font-size: 12px;
  min-width: fit-content;
}

.dark .property-key {
  color: #38bdf8;
}
</style>
