<script setup>
import { computed } from 'vue'
import { Icon } from '@iconify/vue'

const props = defineProps({
  enabled: {
    type: Boolean,
    required: true
  },
  isCurrentlyRunning: {
    type: Boolean,
    default: false
  },
  pausedReason: {
    type: String,
    default: null
  }
})

const statusConfig = computed(() => {
  if (props.isCurrentlyRunning) {
    return {
      class: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: 'lucide:loader-2',
      label: 'Running',
      animate: true
    }
  }

  if (props.enabled) {
    return {
      class: 'bg-green-100 text-green-800 border-green-200',
      icon: 'lucide:check-circle',
      label: 'Active',
      animate: false
    }
  }

  return {
    class: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: 'lucide:pause-circle',
    label: 'Paused',
    animate: false
  }
})
</script>

<template>
  <span
    :class="statusConfig.class"
    :title="pausedReason || undefined"
    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
  >
    <Icon
      :icon="statusConfig.icon"
      :class="['w-3 h-3 mr-1', { 'animate-spin': statusConfig.animate }]"
    />
    {{ statusConfig.label }}
  </span>
</template>
