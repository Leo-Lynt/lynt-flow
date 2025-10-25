<template>
  <div
    class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
    :class="{
      'bg-green-50 dark:bg-green-900/20': syncStatus === 'synced',
      'bg-blue-50 dark:bg-blue-900/20': syncStatus === 'syncing',
      'bg-red-50 dark:bg-red-900/20': syncStatus === 'error',
      'bg-gray-50 dark:bg-gray-900/20': syncStatus === 'offline'
    }"
    :title="syncTooltip"
  >
    <FlowIcon
      :icon="syncIcon"
      :size="14"
      :class="{
        'text-green-600 dark:text-green-400': syncStatus === 'synced',
        'text-blue-600 dark:text-blue-400 animate-spin': syncStatus === 'syncing',
        'text-red-600 dark:text-red-400': syncStatus === 'error',
        'text-gray-600 dark:text-gray-400': syncStatus === 'offline'
      }"
    />
    <span class="text-xs font-medium" :class="{
      'text-green-700 dark:text-green-300': syncStatus === 'synced',
      'text-blue-700 dark:text-blue-300': syncStatus === 'syncing',
      'text-red-700 dark:text-red-300': syncStatus === 'error',
      'text-gray-700 dark:text-gray-300': syncStatus === 'offline'
    }">{{ syncText }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import FlowIcon from '../Icon.vue'

const props = defineProps({
  syncStatus: {
    type: String,
    default: 'offline'
  }
})

const syncIcon = computed(() => {
  switch (props.syncStatus) {
    case 'synced': return 'material-symbols:cloud-done'
    case 'syncing': return 'material-symbols:sync'
    case 'error': return 'material-symbols:cloud-off'
    case 'offline': return 'material-symbols:wifi-off'
    default: return 'material-symbols:cloud'
  }
})

const syncText = computed(() => {
  switch (props.syncStatus) {
    case 'synced': return 'Saved'
    case 'syncing': return 'Saving...'
    case 'error': return 'Error'
    case 'offline': return 'Offline'
    default: return ''
  }
})

const syncTooltip = computed(() => {
  switch (props.syncStatus) {
    case 'synced': return 'All changes saved to cloud'
    case 'syncing': return 'Saving changes...'
    case 'error': return 'Failed to save changes'
    case 'offline': return 'No connection to server'
    default: return ''
  }
})
</script>