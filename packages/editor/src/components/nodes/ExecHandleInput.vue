<template>
  <Handle
    type="target"
    :position="position"
    :id="id"
    :style="handleStyle"
    :connectable="true"
    :max-connections="Infinity"
    class="exec-handle-input"
  />
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { Handle } from '@vue-flow/core'

const props = defineProps({
  position: {
    type: String,
    required: true
  },
  id: {
    type: String,
    required: true
  },
  top: {
    type: String,
    default: '12px'
  }
})

const handleStyle = computed(() => {
  return {
    top: props.top,
    left: '-7px',
    background: '#9ca3af',
    borderColor: '#9ca3af',
    zIndex: 10,
    pointerEvents: 'auto',
  }
})

</script>

<style scoped>
.exec-handle-input {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid;
  transition: transform 0.2s ease, box-shadow 0.15s ease, filter 0.15s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transform-origin: center center;
}

.exec-handle-input:hover {
  transform: scale(1.4) translate(-5px, -4px) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
  filter: brightness(1.2) !important;
}

.exec-handle-input.connected {
  box-shadow: 0 0 0 3px rgba(156, 163, 175, 0.3);
}
</style>
