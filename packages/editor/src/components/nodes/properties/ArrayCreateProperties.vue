<template>
  <div class="array-create-properties space-y-4">
    <div class="dynamic-items-section">
      <div class="flex items-center justify-between mb-3">
        <h4 class="text-sm font-semibold text-gray-900 dark:text-white">Itens do Array</h4>
        <button @click="addItem" class="px-2 py-1 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors">
          ➕ Adicionar Item
        </button>
      </div>

      <div v-if="items.length > 0" class="space-y-2 mb-3">
        <div v-for="(item, index) in items" :key="item.id" class="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
          <span class="text-xs text-gray-500 dark:text-gray-400 w-8">{{ index + 1 }}</span>
          <input v-model="item.label" @input="updateItems" placeholder="Nome do item"
            class="flex-1 px-2 py-1 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-purple-500" />
          <button v-if="items.length > 1" @click="removeItem(index)"
            class="px-2 py-1 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
            :disabled="items.length <= 1">
            ✕
          </button>
          <span v-else class="w-8"></span>
        </div>
      </div>

      <div class="text-xs text-gray-500 dark:text-gray-400 mt-2">Mínimo de 1 item</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useFlowStore } from '../../../stores/flowStore'

const props = defineProps({
  nodeId: { type: String, required: true }
})

const flowStore = useFlowStore()

const items = ref(
  flowStore.nodeData[props.nodeId]?.items || getDefaultItems()
)

function getDefaultItems() {
  return [{ id: 'item1', label: 'Item 1' }]
}

function addItem() {
  const newIndex = items.value.length + 1
  items.value.push({ id: `item${newIndex}`, label: `Item ${newIndex}` })
  updateItems()
}

function removeItem(index) {
  if (items.value.length <= 1) return
  items.value.splice(index, 1)
  updateItems()
}

function updateItems() {
  flowStore.updateNodeData(props.nodeId, { items: items.value })
  updateHandles()
}

function updateHandles() {
  const newHandles = items.value.map(item => ({
    id: `data-${item.id}`,
    label: item.label || item.id,
    type: 'any',
    position: 'left',
    required: false
  }))

  flowStore.updateNodeData(props.nodeId, {
    dynamicHandles: { inputs: newHandles }
  })
}

onMounted(() => {
  if (items.value.length > 0) {
    updateHandles()
  }
})
</script>
