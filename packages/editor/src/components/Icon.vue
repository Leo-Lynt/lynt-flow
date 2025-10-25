<template>
  <Icon
    :icon="icon"
    :width="width || size"
    :height="height || size"
    :class="['flow-icon', className]"
    :style="{ color }"
  />
</template>

<script setup>
import { Icon } from '@iconify/vue'

defineProps({
  icon: {
    type: String,
    required: true
  },
  size: {
    type: [String, Number],
    default: 16
  },
  width: {
    type: [String, Number],
    default: null
  },
  height: {
    type: [String, Number],
    default: null
  },
  color: {
    type: String,
    default: null
  },
  className: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.flow-icon {
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
}
</style>