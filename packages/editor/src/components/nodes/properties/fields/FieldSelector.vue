<template>
  <div class="field-selector space-y-2">
    <!-- Selected Fields -->
    <div v-if="selectedFields && selectedFields.length > 0" class="space-y-1 mb-2">
      <div class="text-xs font-medium text-gray-600 dark:text-gray-400">Selected Fields:</div>
      <div class="flex flex-wrap gap-1">
        <div
          v-for="(selectedField, index) in selectedFields"
          :key="index"
          class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded"
        >
          <button
            @click="$emit('toggle-output', selectedField)"
            class="hover:opacity-70 cursor-pointer"
            :title="isFieldEnabled(selectedField) ? 'Disable individual output' : 'Enable individual output'"
          >
            <FlowIcon
              :icon="isFieldEnabled(selectedField) ? 'material-symbols:visibility' : 'material-symbols:visibility-off'"
              :size="14"
            />
          </button>
          <span>{{ selectedField }}</span>
          <span
            v-if="fieldTypes && fieldTypes[selectedField]"
            class="text-[10px] px-1 py-0.5 bg-white dark:bg-gray-800 rounded opacity-70"
            :title="`Type: ${fieldTypes[selectedField]}`"
          >
            {{ fieldTypes[selectedField] }}
          </span>
          <button
            @click="$emit('remove-field', index)"
            class="hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
          >
            ×
          </button>
        </div>
      </div>
    </div>

    <!-- Available Fields -->
    <div class="space-y-1">
      <div class="text-xs font-medium text-gray-600 dark:text-gray-400">Available Fields:</div>
      <div
        v-if="availableFields.length > 0"
        class="max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded p-2 space-y-1"
      >
        <button
          v-for="availableField in availableFields"
          :key="availableField"
          @click="$emit('add-field', availableField)"
          :disabled="selectedFields?.includes(availableField)"
          class="block w-full text-left px-2 py-1 text-xs rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ availableField }}
        </button>
      </div>
      <div
        v-else
        class="text-xs text-gray-500 dark:text-gray-400 italic p-2 border border-dashed border-gray-300 dark:border-gray-600 rounded"
      >
        Connect a data source and execute it to see available fields
      </div>
    </div>
  </div>
</template>

<script setup>
import FlowIcon from '../../../Icon.vue'

const props = defineProps({
  selectedFields: {
    type: Array,
    default: () => []
  },
  availableFields: {
    type: Array,
    default: () => []
  },
  fieldTypes: {
    type: Object,
    default: () => ({})
  },
  fieldOutputsEnabled: {
    type: Object,
    default: () => ({})
  }
})

defineEmits(['add-field', 'remove-field', 'toggle-output'])

const isFieldEnabled = (fieldName) => {
  return props.fieldOutputsEnabled[fieldName] !== false
}
</script>
