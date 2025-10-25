<template>
  <div class="generic-properties space-y-4">
    <!-- Execute Node Button (for executable nodes) -->
    <div v-if="nodeDefinition?.executable" class="mb-4">
      <button
        @click="executeNode"
        :disabled="executing"
        class="w-full px-4 py-2.5 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-md cursor-pointer transition-colors disabled:cursor-not-allowed"
      >
        <FlowIcon
          :icon="executing ? 'material-symbols:hourglass-empty' : 'material-symbols:play-arrow'"
          :size="16"
        />
        {{ executing ? 'Executing...' : 'Execute Node' }}
      </button>
      <div v-if="executionResult" class="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
        <div class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Result:</div>
        <pre class="text-xs text-gray-600 dark:text-gray-400 overflow-auto max-h-32">{{ formatResult(executionResult) }}</pre>
      </div>
    </div>

    <div
      v-for="(field, key) in visibleFields"
      :key="key"
      class="form-group"
    >
      <!-- String Input -->
      <div v-if="field.type === 'string'" class="space-y-1">
        <div class="flex items-center justify-between">
          <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">
            {{ field.label }}
            <span v-if="field.required" class="text-red-500">*</span>
          </label>
          <div v-if="nodeDefinition?.type !== 'input'" class="flex items-center gap-1">
            <input
              type="checkbox"
              :checked="isFieldExposed(key)"
              @change="toggleExposeField(key, field)"
              class="w-3 h-3 text-blue-600 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
              title="Expor como input"
            />
            <span class="text-[10px] text-gray-500 dark:text-gray-400">Expor</span>
          </div>
        </div>
        <input
          type="text"
          v-model="localData[key]"
          @input="updateData"
          :placeholder="field.placeholder || ''"
          :disabled="isFieldExposed(key)"
          class="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      <!-- Textarea -->
      <div v-else-if="field.type === 'textarea'" class="space-y-1">
        <div class="flex items-center justify-between">
          <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">
            {{ field.label }}
            <span v-if="field.required" class="text-red-500">*</span>
          </label>
          <div v-if="nodeDefinition?.type !== 'input'" class="flex items-center gap-1">
            <input
              type="checkbox"
              :checked="isFieldExposed(key)"
              @change="toggleExposeField(key, field)"
              class="w-3 h-3 text-blue-600 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
              title="Expor como input"
            />
            <span class="text-[10px] text-gray-500 dark:text-gray-400">Expor</span>
          </div>
        </div>
        <textarea
          v-model="localData[key]"
          @input="updateData"
          :placeholder="field.placeholder || ''"
          :disabled="isFieldExposed(key)"
          rows="4"
          class="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        ></textarea>
      </div>

      <!-- Select -->
      <div v-else-if="field.type === 'select'" class="space-y-1">
        <div class="flex items-center justify-between">
          <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">
            {{ field.label }}
            <span v-if="field.required" class="text-red-500">*</span>
          </label>
          <div v-if="nodeDefinition?.type !== 'input'" class="flex items-center gap-1">
            <input
              type="checkbox"
              :checked="isFieldExposed(key)"
              @change="toggleExposeField(key, field)"
              class="w-3 h-3 text-blue-600 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
              title="Expor como input"
            />
            <span class="text-[10px] text-gray-500 dark:text-gray-400">Expor</span>
          </div>
        </div>
        <select
          v-model="localData[key]"
          @change="updateData"
          :disabled="isFieldExposed(key)"
          class="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option
            v-for="option in field.options"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </div>

      <!-- Connection Select (Google OAuth) -->
      <div v-else-if="field.type === 'connection-select'" class="space-y-1">
        <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">
          {{ field.label }}
          <span v-if="field.required" class="text-red-500">*</span>
        </label>
        <p v-if="field.description" class="text-xs text-gray-500 dark:text-gray-400 mb-2">
          {{ field.description }}
        </p>
        <ConnectionSelect
          :service-type="field.serviceType"
          v-model="localData[key]"
          @update:modelValue="updateData"
        />
      </div>

      <!-- Number Input -->
      <div v-else-if="field.type === 'number'" class="space-y-1">
        <div class="flex items-center justify-between">
          <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">
            {{ field.label }}
            <span v-if="field.required" class="text-red-500">*</span>
          </label>
          <div v-if="nodeDefinition?.type !== 'input'" class="flex items-center gap-1">
            <input
              type="checkbox"
              :checked="isFieldExposed(key)"
              @change="toggleExposeField(key, field)"
              class="w-3 h-3 text-blue-600 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
              title="Expor como input"
            />
            <span class="text-[10px] text-gray-500 dark:text-gray-400">Expor</span>
          </div>
        </div>
        <input
          type="number"
          v-model.number="localData[key]"
          @input="updateData"
          :placeholder="field.placeholder || ''"
          :disabled="isFieldExposed(key)"
          class="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      <!-- Color Input -->
      <div v-else-if="field.type === 'color'" class="space-y-1">
        <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">
          {{ field.label }}
          <span v-if="field.required" class="text-red-500">*</span>
        </label>
        <div class="flex items-center gap-2">
          <input
            type="color"
            v-model="localData[key]"
            @input="updateData"
            class="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
          />
          <input
            type="text"
            v-model="localData[key]"
            @input="updateData"
            :placeholder="field.placeholder || '#000000'"
            class="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          />
        </div>
      </div>

      <!-- Boolean Checkbox -->
      <div v-else-if="field.type === 'boolean'" class="space-y-1">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <input
              type="checkbox"
              v-model="localData[key]"
              @change="updateData"
              :disabled="isFieldExposed(key)"
              class="w-4 h-4 text-blue-600 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <label class="text-xs font-medium text-gray-700 dark:text-gray-300">
              {{ field.label }}
            </label>
          </div>
          <div v-if="nodeDefinition?.type !== 'input'" class="flex items-center gap-1">
            <input
              type="checkbox"
              :checked="isFieldExposed(key)"
              @change="toggleExposeField(key, field)"
              class="w-3 h-3 text-blue-600 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
              title="Expor como input"
            />
            <span class="text-[10px] text-gray-500 dark:text-gray-400">Expor</span>
          </div>
        </div>
      </div>

      <!-- Date Input -->
      <div v-else-if="field.type === 'date'" class="space-y-1">
        <div class="flex items-center justify-between">
          <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">
            {{ field.label }}
            <span v-if="field.required" class="text-red-500">*</span>
          </label>
          <div v-if="nodeDefinition?.type !== 'input'" class="flex items-center gap-1">
            <input
              type="checkbox"
              :checked="isFieldExposed(key)"
              @change="toggleExposeField(key, field)"
              class="w-3 h-3 text-blue-600 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
              title="Expor como input"
            />
            <span class="text-[10px] text-gray-500 dark:text-gray-400">Expor</span>
          </div>
        </div>
        <input
          type="date"
          v-model="localData[key]"
          @input="updateData"
          :placeholder="field.placeholder || ''"
          :disabled="isFieldExposed(key)"
          class="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      <!-- Variable Selector (for Variable node in GET mode) -->
      <div v-else-if="field.type === 'variableSelector'" class="space-y-1">
        <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">
          {{ field.label }}
          <span v-if="field.required" class="text-red-500">*</span>
        </label>
        <div class="flex gap-2">
          <select
            v-model="localData[key]"
            @change="updateData"
            class="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Select or type below --</option>
            <option
              v-for="varName in availableVariables"
              :key="varName"
              :value="varName"
            >
              {{ varName }}
            </option>
          </select>
        </div>
        <input
          v-if="field.allowCustom"
          type="text"
          v-model="localData[key]"
          @input="updateData"
          :placeholder="field.placeholder || 'Or type custom name'"
          class="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Parameters Manager (for Input node) - DEVE VIR ANTES DO ARRAY GENÉRICO -->
      <div v-else-if="field.type === 'array' && key === 'parameters' && nodeDefinition?.type === 'input'" class="space-y-2">
        <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">
          {{ field.label }}
        </label>
        <div v-if="field.description" class="text-xs text-gray-500 dark:text-gray-400 italic mb-2">
          {{ field.description }}
        </div>

        <!-- Existing Parameters -->
        <div v-if="localData[key] && localData[key].length > 0" class="space-y-2 mb-3">
          <div
            v-for="(param, index) in localData[key]"
            :key="index"
            class="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md space-y-2"
          >
            <div class="flex items-center justify-between">
              <span class="text-xs font-medium text-gray-700 dark:text-gray-300">Parameter {{index + 1}}</span>
              <button
                @click="removeParameter(key, index)"
                class="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                title="Remove parameter"
              >
                <FlowIcon icon="material-symbols:delete" :size="16" />
              </button>
            </div>

            <input
              type="text"
              v-model="param.name"
              @input="updateData"
              placeholder="Parameter name"
              class="w-full px-2 py-1 text-xs bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />

            <select
              v-model="param.type"
              @change="updateData"
              class="w-full px-2 py-1 text-xs bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="any">Any</option>
              <option value="string">String</option>
              <option value="number">Number</option>
              <option value="integer">Integer</option>
              <option value="float">Float</option>
              <option value="boolean">Boolean</option>
              <option value="object">Object</option>
              <option value="array">Array</option>
              <option value="date">Date</option>
            </select>

            <!-- Default Value - formatado por tipo -->
            <!-- String -->
            <input
              v-if="param.type === 'string' || param.type === 'any'"
              type="text"
              v-model="param.defaultValue"
              @input="updateData"
              placeholder="Default value (optional)"
              class="w-full px-2 py-1 text-xs bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />

            <!-- Number / Integer / Float -->
            <input
              v-else-if="param.type === 'number' || param.type === 'integer' || param.type === 'float'"
              type="number"
              v-model.number="param.defaultValue"
              @input="updateData"
              :step="param.type === 'integer' ? '1' : 'any'"
              placeholder="Default value (optional)"
              class="w-full px-2 py-1 text-xs bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />

            <!-- Boolean -->
            <div v-else-if="param.type === 'boolean'" class="flex items-center gap-2 px-2 py-1">
              <input
                type="checkbox"
                v-model="param.defaultValue"
                @change="updateData"
                class="w-3 h-3 text-blue-600 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
              />
              <label class="text-xs text-gray-600 dark:text-gray-400">Default: {{ param.defaultValue ? 'true' : 'false' }}</label>
            </div>

            <!-- Date -->
            <div v-else-if="param.type === 'date'" class="space-y-2">
              <input
                type="date"
                v-model="param.defaultValue"
                @input="updateData"
                class="w-full px-2 py-1 text-xs bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <select
                v-model="param.dateFormat"
                @change="updateData"
                class="w-full px-2 py-1 text-xs bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY (Brasil)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY (EUA)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                <option value="DD-MM-YYYY">DD-MM-YYYY</option>
                <option value="YYYY/MM/DD">YYYY/MM/DD</option>
              </select>
            </div>

            <!-- Array / Object -->
            <textarea
              v-else-if="param.type === 'array' || param.type === 'object'"
              v-model="param.defaultValue"
              @input="updateData"
              :placeholder="param.type === 'array' ? '[1, 2, 3]' : '{key: value}'"
              rows="2"
              class="w-full px-2 py-1 text-xs bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
            />

            <div class="flex items-center gap-2">
              <input
                type="checkbox"
                v-model="param.required"
                @change="updateData"
                class="w-3 h-3 text-blue-600 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
              />
              <label class="text-xs text-gray-600 dark:text-gray-400">Required</label>
            </div>
          </div>
        </div>

        <!-- Add Parameter Button -->
        <button
          @click="addParameter(key)"
          class="w-full px-3 py-2 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-md transition-colors"
        >
          <FlowIcon icon="material-symbols:add" :size="14" />
          Add Parameter
        </button>
      </div>

      <!-- Array (simple list) - DEVE VIR DEPOIS DAS CONDIÇÕES ESPECÍFICAS -->
      <div v-else-if="field.type === 'array'" class="space-y-1">
        <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">
          {{ field.label }}
          <span v-if="field.required" class="text-red-500">*</span>
        </label>
        <div class="text-xs text-gray-500 dark:text-gray-400 italic">
          Complex array editing - see node documentation
        </div>
      </div>

      <!-- Field Selector (for Field Extractor and Array Aggregate) -->
      <div v-else-if="field.type === 'fieldSelector'" class="space-y-2">
        <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">
          {{ field.label }}
          <span v-if="field.required" class="text-red-500">*</span>
        </label>
        <div v-if="field.description" class="text-xs text-gray-500 dark:text-gray-400 italic mb-2">
          {{ field.description }}
        </div>

        <!-- Selected Fields -->
        <div v-if="localData[key] && localData[key].length > 0" class="space-y-1 mb-2">
          <div class="text-xs font-medium text-gray-600 dark:text-gray-400">
            {{ field.singleSelect ? 'Selected Field:' : 'Selected Fields:' }}
          </div>
          <div class="flex flex-wrap gap-1">
            <div
              v-for="(selectedField, index) in localData[key]"
              :key="index"
              class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded"
            >
              <!-- Field Output Toggle (only for Field Extractor with multiple fields) -->
              <button
                v-if="nodeDefinition?.type === 'field-extractor' && !field.singleSelect"
                @click="toggleFieldOutput(selectedField)"
                class="hover:opacity-70 cursor-pointer"
                :title="isFieldOutputEnabled(selectedField) ? 'Disable individual output' : 'Enable individual output'"
              >
                <FlowIcon
                  :icon="isFieldOutputEnabled(selectedField) ? 'material-symbols:visibility' : 'material-symbols:visibility-off'"
                  :size="14"
                />
              </button>
              <span>{{ selectedField }}</span>
              <span
                v-if="localData.fieldTypes && localData.fieldTypes[selectedField]"
                class="text-[10px] px-1 py-0.5 bg-white dark:bg-gray-800 rounded opacity-70"
                :title="`Type: ${localData.fieldTypes[selectedField]}`"
              >
                {{ localData.fieldTypes[selectedField] }}
              </span>
              <button
                @click="removeField(key, index)"
                class="hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        <!-- Available Fields -->
        <div class="space-y-1">
          <div class="text-xs font-medium text-gray-600 dark:text-gray-400">Available Fields:</div>
          <div v-if="availableFields.length > 0" class="max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded p-2 space-y-1">
            <button
              v-for="availableField in availableFields"
              :key="availableField"
              @click="addField(key, availableField)"
              :disabled="localData[key]?.includes(availableField)"
              class="block w-full text-left px-2 py-1 text-xs rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              :class="{
                'bg-gray-50 dark:bg-gray-800': !localData[key]?.includes(availableField),
                'bg-gray-200 dark:bg-gray-600': localData[key]?.includes(availableField)
              }"
            >
              {{ availableField }}
            </button>
          </div>
          <div v-else class="text-xs text-gray-500 dark:text-gray-400 italic p-2 border border-dashed border-gray-300 dark:border-gray-600 rounded">
            No data connected. Connect a data source to see available fields.
          </div>
        </div>
      </div>

    </div>

    <!-- No Config Message -->
    <div v-if="Object.keys(visibleFields).length === 0" class="text-center py-8">
      <p class="text-sm text-gray-500 dark:text-gray-400 italic">
        No configuration options available for this node.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useFlowStore } from '../../../stores/flowStore'
import { getNodeDefinition } from '../../../engine/registry'
import { executeNode as executeNodeFromEngine, extractOutputs } from '../../../engine/executor'
import { detectValueType } from '@leo-lynt/lynt-flow-core/engine/dataTypes.js'
import { getFieldValue } from '@leo-lynt/lynt-flow-core/utils'
import FlowIcon from '../../Icon.vue'
import ConnectionSelect from '../../form/ConnectionSelect.vue'

const props = defineProps({
  nodeId: {
    type: String,
    required: true
  },
  localData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update-node-data'])

const flowStore = useFlowStore()
const localData = ref({ ...props.localData })
const executing = ref(false)
const executionResult = ref(null)

// Get available variables (for Variable node in GET mode)
const availableVariables = computed(() => {
  const node = flowStore.nodes.find(n => n.id === props.nodeId)
  if (!node || node.type !== 'variable') return []

  // Find all variable nodes in SET mode
  const setVariables = flowStore.nodes.filter(n =>
    n.type === 'variable' &&
    n.id !== props.nodeId &&
    flowStore.nodeData[n.id]?.mode === 'set'
  )

  // Extract unique variable names
  const variableNames = setVariables
    .map(n => flowStore.nodeData[n.id]?.variableName)
    .filter(name => name && name.trim() !== '')
    .filter((name, index, arr) => arr.indexOf(name) === index) // Unique only

  return variableNames.sort()
})

// Get available fields from connected input data
const availableFields = computed(() => {
  const node = flowStore.nodes.find(n => n.id === props.nodeId)
  if (!node) return []

  // Find incoming data edges
  const incomingEdges = flowStore.edges.filter(e =>
    e.target === props.nodeId &&
    e.targetHandle === 'data-input' &&
    e.edgeType !== 'flow'
  )

  if (incomingEdges.length === 0) return []

  // Get data from source node
  const sourceEdge = incomingEdges[0]
  const sourceOutputs = flowStore.executionResults[sourceEdge.source]

  if (!sourceOutputs) return []

  // IMPORTANTE: Pegar o valor do handle específico que foi conectado
  const sourceValue = (typeof sourceOutputs === 'object' && sourceOutputs !== null && sourceEdge.sourceHandle in sourceOutputs)
    ? sourceOutputs[sourceEdge.sourceHandle]
    : sourceOutputs

  // Extract field names from the specific value
  return extractFieldNames(sourceValue)
})

// Extract field names and types from data object
const extractFieldNames = (data, prefix = '') => {
  const fields = []

  if (!data || typeof data !== 'object') return fields

  // If it's an array, use first item as template
  if (Array.isArray(data)) {
    if (data.length > 0) {
      return extractFieldNames(data[0], prefix)
    }
    return fields
  }

  // Extract all keys
  for (const key in data) {
    const fullPath = prefix ? `${prefix}.${key}` : key
    fields.push(fullPath)

    // Recursively extract nested fields (one level deep only)
    if (data[key] && typeof data[key] === 'object' && !Array.isArray(data[key])) {
      const nestedFields = extractFieldNames(data[key], fullPath)
      fields.push(...nestedFields)
    }
  }

  return fields
}

// Get node definition from catalog
const nodeDefinition = computed(() => {
  const node = flowStore.nodes.find(n => n.id === props.nodeId)
  if (!node) return null
  return getNodeDefinition(node.type)
})

// Get config fields from definition
const configFields = computed(() => {
  return nodeDefinition.value?.config || {}
})

// Check if a field should be visible based on its condition
const shouldShowField = (field, key) => {
  if (!field.condition) return true

  // Field has a condition - check if it's met
  for (const [conditionKey, conditionValue] of Object.entries(field.condition)) {
    const currentValue = localData.value[conditionKey]

    // If condition value is an array, check if current value is in array
    if (Array.isArray(conditionValue)) {
      if (!conditionValue.includes(currentValue)) {
        return false
      }
    } else {
      // Direct value comparison
      if (currentValue !== conditionValue) {
        return false
      }
    }
  }

  return true
}

// Filter visible fields based on conditions
const visibleFields = computed(() => {
  const visible = {}
  for (const [key, field] of Object.entries(configFields.value)) {
    if (shouldShowField(field, key)) {
      visible[key] = field
    }
  }
  return visible
})

// Watch for external changes
watch(() => props.localData, (newData) => {
  localData.value = { ...newData }
}, { deep: true, immediate: true })

// Initialize default values
onMounted(() => {
  const config = configFields.value
  for (const key in config) {
    if (localData.value[key] === undefined && config[key].default !== undefined) {
      localData.value[key] = config[key].default
    }
  }
  updateData()
})

// Execute single node
const executeNode = async () => {
  executing.value = true
  executionResult.value = null

  try {
    const node = flowStore.nodes.find(n => n.id === props.nodeId)
    if (!node) {
      throw new Error('Node not found')
    }


    // Get node data - use localData first (has latest changes)
    const nodeData = { ...localData.value }


    // Prepare context with apiConfig
    const context = {
      apiConfig: {
        baseUrl: flowStore.apiConfig?.baseUrl || 'http://localhost:3001',
        token: flowStore.apiConfig?.token || ''
      }
    }


    // Get inputs from connected edges
    const inputs = flowStore.getNodeDataInputs(props.nodeId)

    // Update node data in store first (para executar com dados mais recentes)
    flowStore.updateNodeData(props.nodeId, nodeData)

    // Criar node com data atualizado
    const nodeWithData = {
      ...node,
      data: nodeData
    }

    // Execute usando flowStore.executeNode para gerenciar estados (verde/erro)
    const result = await flowStore.executeNode(nodeWithData, inputs)

    executionResult.value = result

    // Extract outputs and store result to trigger cascade execution
    const outputs = extractOutputs(nodeWithData, result)
    flowStore.setExecutionResult(props.nodeId, outputs)

    // 🔥 IMPORTANTE: Propagar para nodes conectados downstream (array-filter, etc)
    const outgoingDataEdges = flowStore.edges.filter(e =>
      e.source === props.nodeId &&
      (e.edgeType === 'data' || !e.sourceHandle?.startsWith('exec-'))
    )
    for (const edge of outgoingDataEdges) {
      await flowStore.propagateDataToTarget(edge)
    }
  } catch (error) {
    executionResult.value = { error: error.message }
  } finally {
    executing.value = false
  }
}

const formatResult = (result) => {
  if (!result) return ''
  if (result.error) return `Error: ${result.error}`
  return JSON.stringify(result, null, 2)
}

const updateData = () => {
  // Handle mapTo - copy values from mapped fields to their target fields
  const config = configFields.value
  for (const [key, field] of Object.entries(config)) {
    if (field.mapTo && localData.value[key] !== undefined) {
      localData.value[field.mapTo] = localData.value[key]
    }
  }

  flowStore.updateNodeData(props.nodeId, localData.value)
  emit('update-node-data')
}

// Add field to selectedFields and detect its type
const addField = (key, field) => {
  // Get field config to check if it's singleSelect
  const fieldConfig = configFields.value[key]
  const isSingleSelect = fieldConfig?.singleSelect === true

  if (isSingleSelect) {
    // Single select mode - replace the array with just this field
    localData.value[key] = [field]
  } else {
    // Multi-select mode - add to array if not already present
    if (!localData.value[key]) {
      localData.value[key] = []
    }
    if (!localData.value[key].includes(field)) {
      localData.value[key].push(field)
    }
  }

  // Detect and save field type (only for Field Extractor)
  if (nodeDefinition.value?.type === 'field-extractor') {
    detectAndSaveFieldType(field)
  }

  updateData()
}

// Detect type of a field from source data
const detectAndSaveFieldType = (fieldPath) => {
  const node = flowStore.nodes.find(n => n.id === props.nodeId)
  if (!node) return

  // Find incoming data edges
  const incomingEdges = flowStore.edges.filter(e =>
    e.target === props.nodeId &&
    e.targetHandle === 'data-input' &&
    e.edgeType !== 'flow'
  )

  if (incomingEdges.length === 0) return

  // Get data from source node
  const sourceEdge = incomingEdges[0]
  const sourceResult = flowStore.executionResults[sourceEdge.source]

  if (!sourceResult) return

  // Get field value
  const fieldValue = getFieldValue(sourceResult, fieldPath)

  // Detect field type
  const fieldType = detectValueType(fieldValue)

  // Initialize fieldTypes if needed
  if (!localData.value.fieldTypes) {
    localData.value.fieldTypes = {}
  }

  // Save detected type
  localData.value.fieldTypes[fieldPath] = fieldType

  updateData()
}

// Remove field from selectedFields
const removeField = (key, index) => {
  if (localData.value[key]) {
    const fieldName = localData.value[key][index]
    localData.value[key].splice(index, 1)

    // Also remove from fieldOutputsEnabled
    if (localData.value.fieldOutputsEnabled && fieldName) {
      delete localData.value.fieldOutputsEnabled[fieldName]
    }

    // Also remove from fieldTypes
    if (localData.value.fieldTypes && fieldName) {
      delete localData.value.fieldTypes[fieldName]
    }

    updateData()
  }
}

// Add parameter to Input node
const addParameter = (key) => {
  if (!localData.value[key]) {
    localData.value[key] = []
  }

  localData.value[key].push({
    name: `param${localData.value[key].length + 1}`,
    type: 'any',
    required: false,
    defaultValue: null,
    dateFormat: 'DD/MM/YYYY' // Formato padrão brasileiro
  })

  updateData()
}

// Remove parameter from Input node
const removeParameter = (key, index) => {
  if (localData.value[key]) {
    localData.value[key].splice(index, 1)
    updateData()
  }
}

// Toggle individual field output visibility
const toggleFieldOutput = (fieldName) => {
  if (!localData.value.fieldOutputsEnabled) {
    localData.value.fieldOutputsEnabled = {}
  }

  // Toggle the value (default is true/enabled)
  const currentState = localData.value.fieldOutputsEnabled[fieldName]
  localData.value.fieldOutputsEnabled[fieldName] = currentState === false ? true : false

  updateData()
}

// Check if a field output is enabled
const isFieldOutputEnabled = (fieldName) => {
  if (!localData.value.fieldOutputsEnabled) {
    return true // Default to enabled
  }
  return localData.value.fieldOutputsEnabled[fieldName] !== false
}

// Check if a field is exposed as input
const isFieldExposed = (fieldKey) => {
  return localData.value.exposedFields?.[fieldKey] !== undefined
}

// Toggle field exposure as input
const toggleExposeField = (fieldKey, fieldConfig) => {
  if (!localData.value.exposedFields) {
    localData.value.exposedFields = {}
  }

  const isCurrentlyExposed = localData.value.exposedFields[fieldKey]

  if (isCurrentlyExposed) {
    // Remove from exposed fields
    delete localData.value.exposedFields[fieldKey]
  } else {
    // Add to exposed fields with metadata
    localData.value.exposedFields[fieldKey] = {
      label: fieldConfig.label,
      type: fieldConfig.type || 'any',
      required: fieldConfig.required || false
    }
  }

  updateData()
}
</script>

<style scoped>
.generic-properties {
  /* Styling handled by Tailwind */
}
</style>
