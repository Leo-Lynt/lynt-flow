<template>
  <div class="array-merge-properties space-y-4">
    <!-- Dynamic Array Inputs Section -->
    <div class="dynamic-inputs-section">
      <div class="flex items-center justify-between mb-3">
        <h4 class="text-sm font-semibold text-gray-900 dark:text-white">Arrays para Mesclar</h4>
        <button
          @click="addArrayInput"
          class="px-2 py-1 text-xs bg-teal-600 hover:bg-teal-700 text-white rounded transition-colors"
        >
          ➕ Adicionar Array
        </button>
      </div>

      <!-- Array Inputs List -->
      <div v-if="arrayInputs.length > 0" class="space-y-2 mb-3">
        <div
          v-for="(input, index) in arrayInputs"
          :key="input.id"
          class="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded"
        >
          <span class="text-xs text-gray-500 dark:text-gray-400 w-8">{{ index + 1 }}</span>
          <input
            v-model="input.label"
            @input="updateInputs"
            placeholder="Nome do array"
            class="flex-1 px-2 py-1 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            v-if="arrayInputs.length > 2"
            @click="removeArrayInput(index)"
            class="px-2 py-1 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
            :disabled="arrayInputs.length <= 2"
          >
            ✕
          </button>
          <span v-else class="w-8"></span>
        </div>
      </div>

      <div class="text-xs text-gray-500 dark:text-gray-400 mt-2">
        Mínimo de 2 arrays
      </div>
    </div>

    <!-- Remove Duplicates Option -->
    <div class="remove-duplicates-section">
      <label class="flex items-center cursor-pointer">
        <input
          type="checkbox"
          v-model="localData.removeDuplicates"
          @change="updateData"
          class="w-4 h-4 text-teal-600 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 rounded focus:ring-teal-500"
        />
        <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Remover Duplicados</span>
      </label>
      <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">
        Remove itens duplicados do array resultante
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useFlowStore } from '../../../stores/flowStore'

const props = defineProps({
  nodeId: {
    type: String,
    required: true
  }
})

const flowStore = useFlowStore()

// Local state
const localData = ref({
  removeDuplicates: false,
  ...flowStore.nodeData[props.nodeId]
})

const arrayInputs = ref(
  flowStore.nodeData[props.nodeId]?.arrayInputs || getDefaultArrayInputs()
)

// Methods
function getDefaultArrayInputs() {
  return [
    { id: 'array1', label: 'Array 1' },
    { id: 'array2', label: 'Array 2' }
  ]
}

function addArrayInput() {
  const newIndex = arrayInputs.value.length + 1
  const newInput = {
    id: `array${newIndex}`,
    label: `Array ${newIndex}`
  }
  arrayInputs.value.push(newInput)
  updateInputs()
}

function removeArrayInput(index) {
  if (arrayInputs.value.length <= 2) {
    return // Keep minimum of 2 arrays
  }
  arrayInputs.value.splice(index, 1)
  updateInputs()
}

function updateInputs() {
  // Atualizar nodeData
  flowStore.updateNodeData(props.nodeId, {
    arrayInputs: arrayInputs.value
  })

  // Atualizar handles dinamicamente
  updateHandles()
}

function updateHandles() {
  const newHandles = arrayInputs.value.map(input => ({
    id: `data-${input.id}`,
    label: input.label || input.id,
    type: 'array',
    position: 'left',
    required: false
  }))

  flowStore.updateNodeData(props.nodeId, {
    dynamicHandles: {
      inputs: newHandles
    }
  })
}

function updateData() {
  flowStore.updateNodeData(props.nodeId, {
    removeDuplicates: localData.value.removeDuplicates
  })
}

// Lifecycle
onMounted(() => {
  // Garantir que handles dinâmicos sejam aplicados no mount
  if (arrayInputs.value.length > 0) {
    updateHandles()
  }
})
</script>

<style scoped>
.array-merge-properties {
  /* Custom styles */
}
</style>
