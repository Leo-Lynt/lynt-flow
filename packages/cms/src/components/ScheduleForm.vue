<script setup>
import { ref, computed, watch } from 'vue'
import { Icon } from '@iconify/vue'

const props = defineProps({
  flowId: {
    type: String,
    required: true
  },
  initialData: {
    type: Object,
    default: null
  },
  flowInputs: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['submit', 'cancel'])

const formData = ref({
  scheduleType: 'interval',
  intervalValue: 30,
  intervalUnit: 'minutes',
  time: '09:00',
  timezone: 'UTC',
  daysOfWeek: [],
  dayOfMonth: 1,
  cronExpression: '',
  inputData: {},
  maxExecutions: null,
  expiresAt: ''
})

const timezones = [
  'UTC',
  'America/Sao_Paulo',
  'America/New_York',
  'Europe/London',
  'Asia/Tokyo',
  'Australia/Sydney'
]

const weekDays = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' }
]

const intervalUnits = [
  { value: 'minutes', label: 'Minutes' },
  { value: 'hours', label: 'Hours' },
  { value: 'days', label: 'Days' }
]

const scheduleTypes = [
  { value: 'interval', label: 'Interval', icon: 'lucide:clock', description: 'Repeat every X minutes/hours/days' },
  { value: 'daily', label: 'Daily', icon: 'lucide:calendar', description: 'Every day at specific time' },
  { value: 'weekly', label: 'Weekly', icon: 'lucide:calendar-days', description: 'Specific days of the week' },
  { value: 'monthly', label: 'Monthly', icon: 'lucide:calendar-range', description: 'Specific day of the month' },
  { value: 'cron', label: 'Cron', icon: 'lucide:terminal', description: 'Custom cron expression' }
]

// Load initial data if editing
if (props.initialData) {
  Object.assign(formData.value, props.initialData)
}

// Initialize inputData with defaults from flowInputs
watch(() => props.flowInputs, (newInputs) => {
  if (newInputs && newInputs.length > 0 && Object.keys(formData.value.inputData).length === 0) {
    const initialInputData = {}
    newInputs.forEach(input => {
      initialInputData[input.name] = input.defaultValue !== undefined ? input.defaultValue : ''
    })
    formData.value.inputData = initialInputData
  }
}, { immediate: true })

function getInputType(type) {
  const typeMap = {
    string: 'text',
    number: 'number',
    boolean: 'checkbox',
    email: 'email',
    url: 'url',
    date: 'text', // Usar text para permitir expressões dinâmicas
    datetime: 'text'
  }
  return typeMap[type] || 'text'
}

// Check if field is date type
function isDateField(input) {
  return input.type === 'date' || input.type === 'datetime'
}

// Check if value is dynamic expression
function isDynamicExpression(value) {
  if (!value || typeof value !== 'string') return false
  return value.includes('{{') && value.includes('}}')
}

// Preview date expression (basic mock)
function previewDateExpression(expression, format = 'YYYY-MM-DD') {
  if (!isDynamicExpression(expression)) return null

  const today = new Date()
  const formatDate = (date, fmt) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return fmt
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
  }

  try {
    // Simple preview - just show today's date as example
    if (expression.includes('{{today}}')) {
      return formatDate(today, format)
    }
    if (expression.includes('{{yesterday}}')) {
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      return formatDate(yesterday, format)
    }
    if (expression.includes('{{tomorrow}}')) {
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      return formatDate(tomorrow, format)
    }

    // For complex expressions, just show placeholder
    return `Will be calculated: ${expression}`
  } catch (e) {
    return 'Invalid expression'
  }
}

// Quick insert expression
function insertExpression(inputName, expression) {
  formData.value.inputData[inputName] = expression
}

// Common date expressions
const dateExpressions = [
  { label: 'Today', value: '{{today}}' },
  { label: 'Yesterday', value: '{{yesterday}}' },
  { label: 'Tomorrow', value: '{{tomorrow}}' },
  { label: 'Last 7 days', value: '{{today - 7 days}}' },
  { label: 'Last 30 days', value: '{{today - 30 days}}' },
  { label: 'Start of Month', value: '{{startOfMonth}}' },
  { label: 'End of Month', value: '{{endOfMonth}}' },
  { label: 'Last Execution', value: '{{lastExecution}}' }
]

// Validation
const errors = ref({})

function validate() {
  errors.value = {}

  switch (formData.value.scheduleType) {
    case 'interval':
      if (formData.value.intervalUnit === 'minutes' && formData.value.intervalValue < 5) {
        errors.value.intervalValue = 'Minimum interval is 5 minutes'
      }
      if (!formData.value.intervalValue || formData.value.intervalValue <= 0) {
        errors.value.intervalValue = 'Interval value must be greater than 0'
      }
      break

    case 'daily':
      if (!formData.value.time) {
        errors.value.time = 'Time is required'
      }
      break

    case 'weekly':
      if (!formData.value.daysOfWeek || formData.value.daysOfWeek.length === 0) {
        errors.value.daysOfWeek = 'Select at least one day'
      }
      if (!formData.value.time) {
        errors.value.time = 'Time is required'
      }
      break

    case 'monthly':
      if (!formData.value.dayOfMonth || formData.value.dayOfMonth < 1 || formData.value.dayOfMonth > 31) {
        errors.value.dayOfMonth = 'Day must be between 1 and 31'
      }
      if (!formData.value.time) {
        errors.value.time = 'Time is required'
      }
      break

    case 'cron':
      if (!formData.value.cronExpression) {
        errors.value.cronExpression = 'Cron expression is required'
      }
      break
  }

  return Object.keys(errors.value).length === 0
}

function handleSubmit() {
  if (!validate()) return

  const payload = {
    flowId: props.flowId,
    scheduleType: formData.value.scheduleType,
    inputData: formData.value.inputData
  }

  // Add optional fields
  if (formData.value.maxExecutions) {
    payload.maxExecutions = parseInt(formData.value.maxExecutions)
  }
  if (formData.value.expiresAt) {
    payload.expiresAt = new Date(formData.value.expiresAt).toISOString()
  }

  // Add type-specific fields
  switch (formData.value.scheduleType) {
    case 'interval':
      payload.intervalValue = parseInt(formData.value.intervalValue)
      payload.intervalUnit = formData.value.intervalUnit
      break

    case 'daily':
      payload.time = formData.value.time
      payload.timezone = formData.value.timezone
      break

    case 'weekly':
      payload.daysOfWeek = formData.value.daysOfWeek
      payload.time = formData.value.time
      payload.timezone = formData.value.timezone
      break

    case 'monthly':
      payload.dayOfMonth = parseInt(formData.value.dayOfMonth)
      payload.time = formData.value.time
      payload.timezone = formData.value.timezone
      break

    case 'cron':
      payload.cronExpression = formData.value.cronExpression
      payload.timezone = formData.value.timezone
      break
  }

  emit('submit', payload)
}

function toggleWeekDay(day) {
  const index = formData.value.daysOfWeek.indexOf(day)
  if (index > -1) {
    formData.value.daysOfWeek.splice(index, 1)
  } else {
    formData.value.daysOfWeek.push(day)
  }
}

function isWeekDaySelected(day) {
  return formData.value.daysOfWeek.includes(day)
}

const previewText = computed(() => {
  switch (formData.value.scheduleType) {
    case 'interval':
      return `Every ${formData.value.intervalValue} ${formData.value.intervalUnit}`

    case 'daily':
      return `Every day at ${formData.value.time} (${formData.value.timezone})`

    case 'weekly':
      if (formData.value.daysOfWeek.length === 0) return 'Select days'
      const days = formData.value.daysOfWeek
        .sort((a, b) => a - b)
        .map(d => weekDays.find(wd => wd.value === d)?.short)
        .join(', ')
      return `${days} at ${formData.value.time} (${formData.value.timezone})`

    case 'monthly':
      return `Every month on day ${formData.value.dayOfMonth} at ${formData.value.time} (${formData.value.timezone})`

    case 'cron':
      return formData.value.cronExpression || 'Enter cron expression'

    default:
      return ''
  }
})

const cronExamples = [
  { expr: '0 */2 * * *', desc: 'Every 2 hours' },
  { expr: '0 9 * * *', desc: 'Every day at 9:00' },
  { expr: '0 9 * * 1-5', desc: 'Weekdays at 9:00' },
  { expr: '0 0 1 * *', desc: 'First day of month at midnight' }
]
</script>

<template>
  <div class="space-y-6">
    <!-- Schedule Type Selection -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-3">Schedule Type</label>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <button
          v-for="type in scheduleTypes"
          :key="type.value"
          @click="formData.scheduleType = type.value"
          :class="[
            'p-4 rounded-lg border-2 text-left transition-all',
            formData.scheduleType === type.value
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          ]"
        >
          <div class="flex items-center space-x-3">
            <Icon
              :icon="type.icon"
              :class="[
                'w-6 h-6',
                formData.scheduleType === type.value ? 'text-blue-600' : 'text-gray-400'
              ]"
            />
            <div>
              <div class="font-medium text-gray-900">{{ type.label }}</div>
              <div class="text-xs text-gray-500">{{ type.description }}</div>
            </div>
          </div>
        </button>
      </div>
    </div>

    <!-- Interval Settings -->
    <div v-if="formData.scheduleType === 'interval'" class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Interval Value</label>
        <input
          v-model.number="formData.intervalValue"
          type="number"
          min="1"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="{ 'border-red-500': errors.intervalValue }"
        />
        <p v-if="errors.intervalValue" class="text-red-600 text-xs mt-1">{{ errors.intervalValue }}</p>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Unit</label>
        <select
          v-model="formData.intervalUnit"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option v-for="unit in intervalUnits" :key="unit.value" :value="unit.value">
            {{ unit.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- Daily Settings -->
    <div v-if="formData.scheduleType === 'daily'" class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Time</label>
        <input
          v-model="formData.time"
          type="time"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="{ 'border-red-500': errors.time }"
        />
        <p v-if="errors.time" class="text-red-600 text-xs mt-1">{{ errors.time }}</p>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
        <select
          v-model="formData.timezone"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option v-for="tz in timezones" :key="tz" :value="tz">{{ tz }}</option>
        </select>
      </div>
    </div>

    <!-- Weekly Settings -->
    <div v-if="formData.scheduleType === 'weekly'" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Days of Week</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="day in weekDays"
            :key="day.value"
            @click.prevent="toggleWeekDay(day.value)"
            :class="[
              'px-4 py-2 rounded-lg border-2 transition-all',
              isWeekDaySelected(day.value)
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            ]"
          >
            {{ day.short }}
          </button>
        </div>
        <p v-if="errors.daysOfWeek" class="text-red-600 text-xs mt-1">{{ errors.daysOfWeek }}</p>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Time</label>
          <input
            v-model="formData.time"
            type="time"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            :class="{ 'border-red-500': errors.time }"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
          <select
            v-model="formData.timezone"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option v-for="tz in timezones" :key="tz" :value="tz">{{ tz }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Monthly Settings -->
    <div v-if="formData.scheduleType === 'monthly'" class="grid grid-cols-3 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Day of Month</label>
        <input
          v-model.number="formData.dayOfMonth"
          type="number"
          min="1"
          max="31"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="{ 'border-red-500': errors.dayOfMonth }"
        />
        <p v-if="errors.dayOfMonth" class="text-red-600 text-xs mt-1">{{ errors.dayOfMonth }}</p>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Time</label>
        <input
          v-model="formData.time"
          type="time"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="{ 'border-red-500': errors.time }"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
        <select
          v-model="formData.timezone"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option v-for="tz in timezones" :key="tz" :value="tz">{{ tz }}</option>
        </select>
      </div>
    </div>

    <!-- Cron Settings -->
    <div v-if="formData.scheduleType === 'cron'" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Cron Expression</label>
        <input
          v-model="formData.cronExpression"
          type="text"
          placeholder="0 */2 * * *"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          :class="{ 'border-red-500': errors.cronExpression }"
        />
        <p v-if="errors.cronExpression" class="text-red-600 text-xs mt-1">{{ errors.cronExpression }}</p>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
        <select
          v-model="formData.timezone"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option v-for="tz in timezones" :key="tz" :value="tz">{{ tz }}</option>
        </select>
      </div>
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p class="text-sm font-medium text-blue-900 mb-2">Common Examples:</p>
        <div class="space-y-1">
          <div
            v-for="example in cronExamples"
            :key="example.expr"
            class="flex items-center justify-between text-sm"
          >
            <code class="text-blue-700 font-mono">{{ example.expr }}</code>
            <span class="text-blue-600">{{ example.desc }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Flow Inputs -->
    <div v-if="flowInputs.length > 0" class="border-t border-gray-200 pt-6">
      <h3 class="text-sm font-medium text-gray-700 mb-4">
        <Icon icon="lucide:input" class="w-4 h-4 inline mr-2" />
        Flow Input Data
      </h3>
      <div class="space-y-4">
        <div v-for="input in flowInputs" :key="input.name" class="space-y-2">
          <label class="block">
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm font-medium text-gray-700">
                {{ input.name }}
                <span v-if="input.required" class="text-red-500">*</span>
              </span>
              <span class="text-xs text-gray-500">{{ input.type }}</span>
            </div>

            <!-- Date Field with Dynamic Expressions -->
            <div v-if="isDateField(input)">
              <textarea
                v-model="formData.inputData[input.name]"
                rows="2"
                :placeholder="`{{today}} or {{today - 7 days}}`"
                :required="input.required"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              ></textarea>

              <!-- Date Expression Helper -->
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                <p class="text-xs font-medium text-blue-900 mb-2">
                  💡 Quick Insert:
                </p>
                <div class="flex flex-wrap gap-1">
                  <button
                    v-for="expr in dateExpressions"
                    :key="expr.value"
                    @click.prevent="insertExpression(input.name, expr.value)"
                    type="button"
                    class="text-xs bg-white hover:bg-blue-100 px-2 py-1 rounded border border-blue-300 transition-colors"
                  >
                    {{ expr.label }}
                  </button>
                </div>
                <p class="text-xs text-blue-700 mt-2">
                  Format: {{ input.dateFormat || 'YYYY-MM-DD' }}
                </p>
              </div>

              <!-- Preview -->
              <div v-if="isDynamicExpression(formData.inputData[input.name])" class="mt-2">
                <p class="text-xs text-gray-600">
                  📅 Preview: <span class="font-mono">{{ previewDateExpression(formData.inputData[input.name], input.dateFormat) }}</span>
                </p>
              </div>
            </div>

            <!-- Regular Input Fields -->
            <input
              v-else-if="input.type !== 'boolean'"
              v-model="formData.inputData[input.name]"
              :type="getInputType(input.type)"
              :required="input.required"
              :placeholder="input.defaultValue !== undefined ? String(input.defaultValue) : ''"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <!-- Boolean/Checkbox -->
            <div v-else class="flex items-center">
              <input
                v-model="formData.inputData[input.name]"
                type="checkbox"
                :id="`schedule-input-${input.name}`"
                class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label :for="`schedule-input-${input.name}`" class="ml-2 text-sm text-gray-700">
                {{ input.description || 'Enable' }}
              </label>
            </div>

            <p v-if="input.description && input.type !== 'boolean'" class="text-xs text-gray-500 mt-1">
              {{ input.description }}
            </p>

            <p v-if="input.nodeName" class="text-xs text-gray-400 mt-1">
              <Icon icon="lucide:box" class="w-3 h-3 inline mr-1" />
              From: {{ input.nodeName }}
            </p>
          </label>
        </div>
      </div>
    </div>

    <!-- Advanced Options -->
    <div class="border-t border-gray-200 pt-6">
      <h3 class="text-sm font-medium text-gray-700 mb-4">Advanced Options (Optional)</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Max Executions</label>
          <input
            v-model.number="formData.maxExecutions"
            type="number"
            min="1"
            placeholder="Unlimited"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p class="text-xs text-gray-500 mt-1">Leave empty for unlimited executions</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Expires At</label>
          <input
            v-model="formData.expiresAt"
            type="datetime-local"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p class="text-xs text-gray-500 mt-1">Schedule will stop after this date</p>
        </div>
      </div>
    </div>

    <!-- Preview -->
    <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div class="flex items-center space-x-2">
        <Icon icon="lucide:info" class="w-4 h-4 text-gray-600" />
        <span class="text-sm font-medium text-gray-700">Schedule Preview:</span>
        <span class="text-sm text-gray-900 font-mono">{{ previewText }}</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
      <button
        @click="$emit('cancel')"
        type="button"
        class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
      >
        Cancel
      </button>
      <button
        @click="handleSubmit"
        type="button"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        {{ initialData ? 'Update Schedule' : 'Create Schedule' }}
      </button>
    </div>
  </div>
</template>
