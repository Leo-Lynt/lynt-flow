<template>
  <div class="mb-4">
    <button
      @click="$emit('execute')"
      :disabled="executing"
      class="w-full px-4 py-2.5 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-md cursor-pointer transition-colors disabled:cursor-not-allowed"
    >
      <FlowIcon
        :icon="executing ? 'material-symbols:hourglass-empty' : 'material-symbols:play-arrow'"
        :size="16"
      />
      {{ executing ? 'Executing...' : 'Execute Node' }}
    </button>
    <div v-if="result" class="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
      <div class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Result:</div>
      <pre class="text-xs text-gray-600 dark:text-gray-400 overflow-auto max-h-32">{{ formatResult(result) }}</pre>
    </div>
  </div>
</template>

<script setup>
import FlowIcon from '../../../Icon.vue'

defineProps({
  executing: {
    type: Boolean,
    default: false
  },
  result: {
    type: [Object, Array, String, Number, Boolean],
    default: null
  }
})

defineEmits(['execute'])

const formatResult = (result) => {
  if (typeof result === 'object') {
    return JSON.stringify(result, null, 2)
  }
  return String(result)
}
</script>
