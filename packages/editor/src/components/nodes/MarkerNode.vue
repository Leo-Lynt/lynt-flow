<template>
  <div
    class="marker-node"
    :style="{
      width: `${width}px`,
      height: `${height}px`,
      backgroundColor: backgroundColor,
      borderColor: borderColor,
      zIndex: -1
    }"
  >
    <!-- Header with frame name (editable) -->
    <div class="marker-header">
      <input
        v-model="frameName"
        @input="updateFrameName"
        class="marker-title"
        placeholder="Frame name"
      />
    </div>

    <!-- Resize handles -->
    <div class="resize-handle resize-se" @mousedown="startResize('se')"></div>
    <div class="resize-handle resize-ne" @mousedown="startResize('ne')"></div>
    <div class="resize-handle resize-sw" @mousedown="startResize('sw')"></div>
    <div class="resize-handle resize-nw" @mousedown="startResize('nw')"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useFlowStore } from '../../stores/flowStore'

const props = defineProps({
  id: { type: String, required: true },
  selected: { type: Boolean, default: false }
})

const flowStore = useFlowStore()

// Get node data
const nodeData = computed(() => flowStore.nodeData[props.id] || {})
const currentNode = computed(() => flowStore.nodes.find(n => n.id === props.id))

// Frame properties
const frameName = ref(nodeData.value.name || 'Frame')
const width = ref(nodeData.value.width || 400)
const height = ref(nodeData.value.height || 300)

// Sempre aplicar transparência 0.2 (80% transparência) à cor
const backgroundColor = computed(() => {
  const color = nodeData.value.color || 'rgba(147, 197, 253, 0.2)'

  // Se for hex (#RRGGBB ou #RGB), converter para rgba com 0.2 de opacidade
  if (color.startsWith('#')) {
    // Remover #
    let hex = color.slice(1)

    // Converter #RGB para #RRGGBB
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('')
    }

    // Converter para RGB
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)

    return `rgba(${r}, ${g}, ${b}, 0.2)`
  }

  // Se já for rgba, substituir o alpha por 0.2
  if (color.startsWith('rgba')) {
    return color.replace(/[\d.]+\)$/, '0.2)')
  }

  // Se for rgb, converter para rgba
  if (color.startsWith('rgb')) {
    return color.replace('rgb', 'rgba').replace(')', ', 0.2)')
  }

  // Fallback
  return color
})

const borderColor = computed(() => props.selected ? '#3b82f6' : '#d1d5db')

// Update frame name
const updateFrameName = () => {
  flowStore.updateNodeData(props.id, { name: frameName.value })
}

// Resize state
let isResizing = false
let resizeDirection = null
let startX = 0
let startY = 0
let startWidth = 0
let startHeight = 0
let startNodeX = 0
let startNodeY = 0

const startResize = (direction) => {
  isResizing = true
  resizeDirection = direction
  startX = event.clientX
  startY = event.clientY
  startWidth = width.value
  startHeight = height.value
  startNodeX = currentNode.value?.position?.x || 0
  startNodeY = currentNode.value?.position?.y || 0

  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
  event.stopPropagation()
}

const handleResize = (event) => {
  if (!isResizing) return

  const deltaX = event.clientX - startX
  const deltaY = event.clientY - startY

  let newWidth = startWidth
  let newHeight = startHeight
  let newX = startNodeX
  let newY = startNodeY

  switch (resizeDirection) {
    case 'se': // Southeast (bottom-right)
      newWidth = Math.max(200, startWidth + deltaX)
      newHeight = Math.max(150, startHeight + deltaY)
      break
    case 'ne': // Northeast (top-right)
      newWidth = Math.max(200, startWidth + deltaX)
      newHeight = Math.max(150, startHeight - deltaY)
      newY = startNodeY + deltaY
      break
    case 'sw': // Southwest (bottom-left)
      newWidth = Math.max(200, startWidth - deltaX)
      newHeight = Math.max(150, startHeight + deltaY)
      newX = startNodeX + deltaX
      break
    case 'nw': // Northwest (top-left)
      newWidth = Math.max(200, startWidth - deltaX)
      newHeight = Math.max(150, startHeight - deltaY)
      newX = startNodeX + deltaX
      newY = startNodeY + deltaY
      break
  }

  width.value = newWidth
  height.value = newHeight

  // Update position if needed (for NW, NE, SW)
  if (newX !== startNodeX || newY !== startNodeY) {
    flowStore.updateNodePosition(props.id, { x: newX, y: newY })
  }
}

const stopResize = () => {
  if (isResizing) {
    // Save final size
    flowStore.updateNodeData(props.id, {
      width: width.value,
      height: height.value
    })
  }
  isResizing = false
  resizeDirection = null
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
}

onUnmounted(() => {
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
})
</script>

<style>
/* Força z-index baixo para markers - não scoped para afetar o wrapper do VueFlow */
.vue-flow__node[data-id^="marker_"] {
  z-index: -100 !important;
}
</style>

<style scoped>
.marker-node {
  position: relative;
  border: 2px dashed;
  border-radius: 8px;
  transition: border-color 0.2s;
}

.marker-header {
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  z-index: 1;
}

.marker-title {
  width: 100%;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  outline: none;
}

.marker-title:focus {
  border-color: #3b82f6;
  background: white;
}

.resize-handle {
  position: absolute;
  width: 12px;
  height: 12px;
  background: white;
  border: 2px solid #3b82f6;
  border-radius: 2px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 2;
}

.marker-node:hover .resize-handle,
.marker-node.selected .resize-handle {
  opacity: 1;
}

.resize-se {
  bottom: -6px;
  right: -6px;
  cursor: se-resize;
}

.resize-ne {
  top: -6px;
  right: -6px;
  cursor: ne-resize;
}

.resize-sw {
  bottom: -6px;
  left: -6px;
  cursor: sw-resize;
}

.resize-nw {
  top: -6px;
  left: -6px;
  cursor: nw-resize;
}
</style>
