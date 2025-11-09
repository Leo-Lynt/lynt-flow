<script setup>
import { Icon as IconifyIcon } from '@iconify/vue'

defineProps({
  icon: {
    type: String,
    required: true
  }
})
</script>

<template>
  <IconifyIcon :icon="icon" />
</template>
