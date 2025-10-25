<template>
  <div class="output-properties space-y-4">
    <!-- Dynamic Inputs Section -->
    <div class="dynamic-inputs-section">
      <div class="flex items-center justify-between mb-3">
        <h4 class="text-sm font-semibold text-gray-900 dark:text-white">Inputs</h4>
        <button
          @click="addInput"
          class="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
        >
          ➕ Adicionar Input
        </button>
      </div>

      <!-- Inputs List -->
      <div v-if="dynamicInputs.length > 0" class="space-y-2 mb-3">
        <div
          v-for="(input, index) in dynamicInputs"
          :key="input.id"
          class="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded"
        >
          <input
            v-model="input.key"
            @input="updateInputs"
            placeholder="Nome do input"
            class="flex-1 px-2 py-1 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            v-model="input.type"
            @change="updateInputs"
            class="px-2 py-1 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded"
          >
            <option value="any">Any</option>
            <option value="string">String</option>
            <option value="number">Number</option>
            <option value="boolean">Boolean</option>
            <option value="object">Object</option>
            <option value="array">Array</option>
          </select>
          <button
            @click="removeInput(index)"
            class="px-2 py-1 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      <div v-else class="text-center py-4 text-gray-500 dark:text-gray-400 text-sm border border-dashed border-gray-300 dark:border-gray-600 rounded">
        Nenhum input adicionado
      </div>
    </div>

    <!-- Destination Select -->
    <div class="destination-section">
      <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
        Destination
      </label>
      <select
        v-model="localData.destination"
        @change="updateData"
        class="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="display">Display Only</option>
        <option value="apiResponse">API Response</option>
        <option value="webhook">Webhook</option>
        <option value="email">Email</option>
        <option value="googleSheets">Google Sheets</option>
        <option value="download">Download</option>
      </select>
    </div>

    <!-- Destination Configuration -->
    <div v-if="localData.destination && localData.destination !== 'display'" class="destination-config space-y-3">
      <h4 class="text-sm font-semibold text-gray-900 dark:text-white">Configuração do Destination</h4>

      <!-- API Response Config -->
      <div v-if="localData.destination === 'apiResponse'">
        <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Formato de Resposta
        </label>
        <select
          v-model="destinationConfig.format"
          @change="updateDestinationConfig"
          class="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md"
        >
          <option value="data_only">Só dados</option>
          <option value="wrapped">{ success, data }</option>
          <option value="full">{ success, flowId, executedAt, data }</option>
        </select>
      </div>

      <!-- Webhook Config -->
      <div v-else-if="localData.destination === 'webhook'" class="space-y-3">
        <div>
          <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            URL <span class="text-red-500">*</span>
          </label>
          <input
            v-model="destinationConfig.url"
            @input="updateDestinationConfig"
            placeholder="https://..."
            class="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Método HTTP
          </label>
          <select
            v-model="destinationConfig.method"
            @change="updateDestinationConfig"
            class="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md"
          >
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="PATCH">PATCH</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Headers (JSON)
          </label>
          <textarea
            v-model="destinationConfig.headers"
            @input="updateDestinationConfig"
            rows="3"
            placeholder='{"Authorization": "Bearer ..."}'
            class="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md font-mono"
          ></textarea>
        </div>

        <div>
          <label class="flex items-center">
            <input
              type="checkbox"
              v-model="destinationConfig.retry"
              @change="updateDestinationConfig"
              class="w-4 h-4 text-blue-600 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 rounded"
            />
            <span class="ml-2 text-xs text-gray-700 dark:text-gray-300">Retry em caso de erro</span>
          </label>
        </div>
      </div>

      <!-- Email Config -->
      <div v-else-if="localData.destination === 'email'" class="space-y-3">
        <div>
          <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Para (emails separados por vírgula) <span class="text-red-500">*</span>
          </label>
          <input
            v-model="destinationConfig.to"
            @input="updateDestinationConfig"
            placeholder="user@example.com, other@example.com"
            class="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Assunto
          </label>
          <input
            v-model="destinationConfig.subject"
            @input="updateDestinationConfig"
            placeholder="Relatório LyntFlow"
            class="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Formato
          </label>
          <select
            v-model="destinationConfig.format"
            @change="updateDestinationConfig"
            class="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md"
          >
            <option value="html">HTML (tabela)</option>
            <option value="json">JSON (anexo)</option>
            <option value="csv">CSV (anexo)</option>
          </select>
        </div>
      </div>

      <!-- Google Sheets Config -->
      <div v-else-if="localData.destination === 'googleSheets'" class="space-y-3">
        <div>
          <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Conexão Google <span class="text-red-500">*</span>
          </label>
          <ConnectionSelect
            service-type="sheets"
            v-model="destinationConfig.connectionId"
            @update:modelValue="updateDestinationConfig"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            URL da Planilha <span class="text-red-500">*</span>
          </label>
          <input
            v-model="destinationConfig.spreadsheetUrl"
            @input="updateDestinationConfig"
            placeholder="https://docs.google.com/spreadsheets/d/..."
            class="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nome da Aba
          </label>
          <input
            v-model="destinationConfig.sheetName"
            @input="updateDestinationConfig"
            placeholder="Sheet1"
            class="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Modo de Escrita
          </label>
          <select
            v-model="destinationConfig.writeMode"
            @change="updateDestinationConfig"
            class="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md"
          >
            <option value="append">Adicionar no final</option>
            <option value="replace">Substituir tudo</option>
            <option value="update">Atualizar a partir de A1</option>
          </select>
        </div>
      </div>

      <!-- Download Config -->
      <div v-else-if="localData.destination === 'download'" class="space-y-3">
        <div>
          <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nome do Arquivo
          </label>
          <input
            v-model="destinationConfig.filename"
            @input="updateDestinationConfig"
            placeholder="output"
            class="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Formato
          </label>
          <select
            v-model="destinationConfig.format"
            @change="updateDestinationConfig"
            class="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md"
          >
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
            <option value="excel">Excel (via CSV)</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { useFlowStore } from '../../../stores/flowStore'
import ConnectionSelect from '../../form/ConnectionSelect.vue'

const props = defineProps({
  nodeId: {
    type: String,
    required: true
  }
})

const flowStore = useFlowStore()

// Local state
const localData = ref({
  destination: 'display',
  ...flowStore.nodeData[props.nodeId]
})

const dynamicInputs = ref(
  flowStore.nodeData[props.nodeId]?.dynamicInputs || []
)

const destinationConfig = ref(
  flowStore.nodeData[props.nodeId]?.destinationConfig || getDefaultConfig(localData.value.destination)
)

// Methods
function getDefaultConfig(destination) {
  const defaults = {
    apiResponse: { format: 'wrapped' },
    webhook: { url: '', method: 'POST', headers: '{}', retry: true },
    email: { to: '', subject: 'LyntFlow Report', format: 'html' },
    googleSheets: { connectionId: '', spreadsheetUrl: '', sheetName: 'Sheet1', writeMode: 'append' },
    download: { filename: 'output', format: 'json' }
  }
  return defaults[destination] || {}
}

function addInput() {
  const newInput = {
    id: `input-${Date.now()}`,
    key: '',
    type: 'any'
  }
  dynamicInputs.value.push(newInput)
  updateInputs()
}

function removeInput(index) {
  dynamicInputs.value.splice(index, 1)
  updateInputs()
}

function updateInputs() {
  const newHandles = dynamicInputs.value
    .filter(input => input.key) // Só handles com nome
    .map(input => ({
      id: `data-${input.key}`,
      label: input.key,
      type: input.type || 'any',
      position: 'left'
    }))

  // Atualizar nodeData com ambos dynamicInputs E dynamicHandles em uma única operação
  // Adicionar timestamp para forçar reatividade
  flowStore.updateNodeData(props.nodeId, {
    dynamicInputs: [...dynamicInputs.value], // Clone array to trigger reactivity
    dynamicHandles: {
      inputs: newHandles,
      _updated: Date.now() // Force reactivity trigger
    }
  })
}

function updateHandles() {
  const newHandles = dynamicInputs.value
    .filter(input => input.key) // Só handles com nome
    .map(input => ({
      id: `data-${input.key}`,
      label: input.key,
      type: input.type || 'any',
      position: 'left'
    }))

  flowStore.updateNodeData(props.nodeId, {
    dynamicHandles: {
      inputs: newHandles,
      _updated: Date.now() // Force reactivity trigger
    }
  })
}

function updateData() {
  flowStore.updateNodeData(props.nodeId, {
    destination: localData.value.destination
  })

  // Reset config quando muda destination
  destinationConfig.value = getDefaultConfig(localData.value.destination)
  updateDestinationConfig()
}

function updateDestinationConfig() {
  flowStore.updateNodeData(props.nodeId, {
    destinationConfig: destinationConfig.value
  })
}

// Watchers
watch(() => localData.value.destination, (newDest) => {
  destinationConfig.value = getDefaultConfig(newDest)
  updateDestinationConfig()
})

// Lifecycle
onMounted(() => {
  // Garantir que handles dinâmicos sejam aplicados no mount
  if (dynamicInputs.value.length > 0) {
    updateHandles()
  }
})
</script>

<style scoped>
.output-properties {
  /* Custom styles */
}
</style>
