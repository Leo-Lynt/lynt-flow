<template>
  <div>
    <div v-for="(value, key) in data" :key="key" class="mb-1">
      <div
        :class="[
          'flex items-center cursor-pointer rounded px-1 py-0.5 transition-colors',
          level === 0 ? 'text-teal-200' : 'text-teal-300',
          isSelected(path ? path + '.' + key : key) ? 'bg-teal-600 text-white' : 'hover:bg-teal-800/50'
        ]"
        :style="{ paddingLeft: (level * 16) + 'px' }"
        @click="onFieldClick(path ? path + '.' + key : key)"
        @click.stop
        @mousedown.stop
      >
        <span
          v-if="typeof value === 'object' && value !== null && !Array.isArray(value)"
          @click.stop="expanded = !expanded"
          class="text-teal-400 mr-1 text-xs cursor-pointer select-none"
        >
          {{ expanded ? '▼' : '▶' }}
        </span>
        <span v-else class="w-3"></span>

        <span class="text-teal-400 text-xs">{{ key }}:</span>
        <span class="text-white text-xs ml-2 font-mono">
          {{ formatValue(value) }}
        </span>

        <span v-if="isSelected(path ? path + '.' + key : key)" class="ml-auto text-green-400 text-xs">
          ✓
        </span>
      </div>

      <ObjectField
        v-if="expanded && typeof value === 'object' && value !== null && !Array.isArray(value)"
        :data="value"
        :path="path ? path + '.' + key : key"
        :level="level + 1"
        :selected-fields="selectedFields"
        :selection-mode="selectionMode"
        :expand-all="expandAll"
        @field-click="onFieldClick"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  data: Object,
  path: String,
  level: Number,
  selectedFields: Array,
  selectionMode: String,
  expandAll: Boolean
})

const emit = defineEmits(['field-click'])

const expanded = ref(props.expandAll)

watch(() => props.expandAll, (newVal) => {
  expanded.value = newVal
})

const onFieldClick = (fieldPath) => {
  emit('field-click', fieldPath)
}

const isSelected = (fieldPath) => {
  const selected = props.selectedFields.includes(fieldPath)
  if (selected) {
  }
  return selected
}

const formatValue = (value) => {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (Array.isArray(value)) return `[Array ${value.length}]`
  if (typeof value === 'object') return '[Object]'
  if (typeof value === 'string' && value.length > 30) {
    return value.substring(0, 30) + '...'
  }
  return String(value)
}
</script>