<template>
  <div class="flex items-center gap-2">
    <button
      @click="$emit('execute')"
      class="inline-flex items-center gap-1.5 px-4 py-2 bg-primary border border-primary rounded-lg text-white text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-primary-hover hover:border-primary-hover hover:shadow-lg hover:scale-105 active:scale-95"
    >
      <FlowIcon icon="material-symbols:play-arrow" :size="16" />
      Execute
    </button>

    <div class="w-px h-6 bg-flow-border dark:bg-flow-border-dark mx-3 opacity-50"></div>

    <div class="flex items-center gap-1">
      <button
        @click="$emit('undo')"
        class="inline-flex items-center gap-1.5 px-2 py-1.5 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md text-text-secondary-light dark:text-text-secondary-dark text-sm font-medium cursor-pointer transition-all hover:bg-surface-hover-light dark:hover:bg-surface-hover-dark hover:border-border-hover-light dark:hover:border-border-hover-dark disabled:opacity-50 disabled:cursor-not-allowed"
        title="Undo (Ctrl+Z)"
        :disabled="!canUndo"
      >
        <FlowIcon icon="material-symbols:undo" :size="16" />
      </button>
      <button
        @click="$emit('redo')"
        class="inline-flex items-center gap-1.5 px-2 py-1.5 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md text-text-secondary-light dark:text-text-secondary-dark text-sm font-medium cursor-pointer transition-all hover:bg-surface-hover-light dark:hover:bg-surface-hover-dark hover:border-border-hover-light dark:hover:border-border-hover-dark disabled:opacity-50 disabled:cursor-not-allowed"
        title="Redo (Ctrl+Y)"
        :disabled="!canRedo"
      >
        <FlowIcon icon="material-symbols:redo" :size="16" />
      </button>
    </div>

    <div class="w-px h-6 bg-border-light dark:bg-border-dark mx-2"></div>

    <button
      @click="$emit('clear')"
      class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md text-error text-sm font-medium cursor-pointer transition-all hover:bg-surface-hover-light dark:hover:bg-surface-hover-dark hover:border-border-hover-light dark:hover:border-border-hover-dark"
      title="Clear Flow"
    >
      <FlowIcon icon="material-symbols:clear-all" :size="16" />
      Clear
    </button>

    <div
      class="flex items-center gap-1.5 px-3 py-1 bg-surface-hover-light dark:bg-surface-hover-dark rounded-2xl ml-4"
      v-if="executionStatus"
    >
      <div
        class="w-2 h-2 rounded-full"
        :class="{
          'bg-gray-400': !executionStatus,
          'bg-warning animate-pulse': executionStatus === 'running',
          'bg-success': executionStatus === 'success',
          'bg-error': executionStatus === 'error'
        }"
      ></div>
      <span class="text-xs text-text-muted-light dark:text-text-muted-dark font-medium">{{ statusText }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import FlowIcon from '../Icon.vue'

const props = defineProps({
  canUndo: {
    type: Boolean,
    default: false
  },
  canRedo: {
    type: Boolean,
    default: false
  },
  executionStatus: {
    type: String,
    default: null
  }
})

defineEmits(['execute', 'clear', 'undo', 'redo'])

const statusText = computed(() => {
  switch (props.executionStatus) {
    case 'running': return 'Executing...'
    case 'success': return 'Executed'
    case 'error': return 'Error'
    default: return ''
  }
})
</script>