<template>
  <div class="object-create-properties space-y-4">
    <div class="dynamic-properties-section">
      <div class="flex items-center justify-between mb-3">
        <h4 class="text-sm font-semibold text-gray-900 dark:text-white">Propriedades do Objeto</h4>
        <button @click="addProperty" class="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors">
          ➕ Adicionar Propriedade
        </button>
      </div>

      <div v-if="properties.length > 0" class="space-y-2 mb-3">
        <div v-for="(prop, index) in properties" :key="prop.id" class="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
          <span class="text-xs text-gray-500 dark:text-gray-400 w-8">{{ index + 1 }}</span>
          <input v-model="prop.key" @input="updateProperties" placeholder="Nome da chave"
            class="flex-1 px-2 py-1 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button v-if="properties.length > 1" @click="removeProperty(index)"
            class="px-2 py-1 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
            :disabled="properties.length <= 1">
            ✕
          </button>
          <span v-else class="w-8"></span>
        </div>
      </div>

      <div class="text-xs text-gray-500 dark:text-gray-400 mt-2">Mínimo de 1 propriedade</div>
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

const properties = ref(
  flowStore.nodeData[props.nodeId]?.properties || getDefaultProperties()
)

function getDefaultProperties() {
  return [{ id: 'prop1', key: 'key1' }]
}

function addProperty() {
  const newIndex = properties.value.length + 1
  properties.value.push({ id: `prop${newIndex}`, key: `key${newIndex}` })
  updateProperties()
}

function removeProperty(index) {
  if (properties.value.length <= 1) return
  properties.value.splice(index, 1)
  updateProperties()
}

function updateProperties() {
  flowStore.updateNodeData(props.nodeId, { properties: properties.value })
  updateHandles()
}

function updateHandles() {
  const newHandles = properties.value.map(prop => ({
    id: `data-${prop.id}`,
    label: prop.key || prop.id,
    type: 'any',
    position: 'left',
    required: false
  }))

  flowStore.updateNodeData(props.nodeId, {
    dynamicHandles: { inputs: newHandles }
  })
}

onMounted(() => {
  if (properties.value.length > 0) {
    updateHandles()
  }
})
</script>
