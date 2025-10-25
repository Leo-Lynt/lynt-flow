<template>
  <Handle
    :type="type"
    :position="position"
    :id="id"
    :style="handleStyle"
    :max-connections="maxConnections"
    class="data-handle-minimal"
  />
</template>

<script setup>
import { computed } from 'vue'
import { Handle } from '@vue-flow/core'
import { getTypeColor } from '@leo-lynt/lynt-flow-core/engine/dataTypes.js'

const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: (value) => ['source', 'target'].includes(value)
  },
  position: {
    type: String,
    required: true
  },
  id: {
    type: String,
    required: true
  },
  dataType: {
    type: String,
    default: 'any'
  },
  color: {
    type: String,
    default: null
  },
  top: {
    type: String,
    default: '50%'
  }
})

const maxConnections = computed(() => {
  // Data inputs (target): apenas 1 conexão
  // Data outputs (source): múltiplas conexões
  return props.type === 'target' ? 1 : Infinity
})

const handleColor = computed(() => {
  // If explicit color is provided, use it
  if (props.color) return props.color

  // Otherwise, get color from data type
  return getTypeColor(props.dataType)
})

const handleStyle = computed(() => {
  return {
    top: props.top,
    // Source (output) fica bem fora, target (input) fica próximo
    [props.type === 'source' ? 'right' : 'left']: props.type === 'source' ? '-10px' : '-7px',
    background: handleColor.value,
    borderColor: handleColor.value,
    zIndex: 20, // Maior que exec handles (z-10)
    pointerEvents: 'auto',
  }
})
</script>

<style scoped>
.data-handle-minimal {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid;
  transition: transform 0.2s ease, box-shadow 0.15s ease, filter 0.15s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transform-origin: center center;
}

.data-handle-minimal:hover {
  /* Scale com translate para manter centralizado */
  /* Para 10px com scale 1.4: (1.4 - 1) / 2 * 10px = 2px de compensação */
  transform: scale(1.4) translate(5px, -4px) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
  filter: brightness(1.2) !important;
}

.data-handle-minimal.connected {
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
}

</style>
