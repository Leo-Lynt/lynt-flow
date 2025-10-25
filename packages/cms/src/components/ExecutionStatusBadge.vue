<script setup>
import { computed } from 'vue'
import { Icon } from '@iconify/vue'

const props = defineProps({
  status: {
    type: String,
    required: true,
    validator: (value) => ['success', 'failed', 'running'].includes(value)
  }
})

const statusConfig = computed(() => {
  const configs = {
    success: {
      class: 'bg-brand-green/20 text-brand-green border-brand-green/30',
      icon: 'lucide:check-circle',
      label: 'Sucesso'
    },
    failed: {
      class: 'bg-brand-red/20 text-brand-red border-brand-red/30',
      icon: 'lucide:x-circle',
      label: 'Falhou'
    },
    running: {
      class: 'bg-brand-purple/20 text-brand-purple border-brand-purple/30',
      icon: 'lucide:loader-2',
      label: 'Executando'
    }
  }
  return configs[props.status] || configs.failed
})
</script>

<template>
  <span
    :class="statusConfig.class"
    class="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border backdrop-blur-sm"
  >
    <Icon
      :icon="statusConfig.icon"
      :class="['w-3 h-3 mr-1', { 'animate-spin': status === 'running' }]"
    />
    {{ statusConfig.label }}
  </span>
</template>
