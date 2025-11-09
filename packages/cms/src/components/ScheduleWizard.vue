<script setup>
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'

const props = defineProps({
  availableFlows: {
    type: Array,
    required: true
  },
  flowInputs: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['submit', 'cancel', 'flow-selected'])

// Wizard state
const currentStep = ref(1)
const totalSteps = computed(() => {
  return props.flowInputs.length > 0 ? 4 : 3 // Skip input step if no inputs
})

// Form data
const formData = ref({
  flowId: '',
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

const errors = ref({})

// Options
const timezones = ['UTC', 'America/Sao_Paulo', 'America/New_York', 'Europe/London', 'Asia/Tokyo', 'Australia/Sydney']
const weekDays = [
  { value: 0, label: 'Domingo', short: 'Dom' },
  { value: 1, label: 'Segunda', short: 'Seg' },
  { value: 2, label: 'Terça', short: 'Ter' },
  { value: 3, label: 'Quarta', short: 'Qua' },
  { value: 4, label: 'Quinta', short: 'Qui' },
  { value: 5, label: 'Sexta', short: 'Sex' },
  { value: 6, label: 'Sábado', short: 'Sáb' }
]
const intervalUnits = [
  { value: 'minutes', label: 'Minutos' },
  { value: 'hours', label: 'Horas' },
  { value: 'days', label: 'Dias' }
]
const scheduleTypes = [
  { value: 'interval', label: 'Intervalo', icon: 'lucide:clock', description: 'Repetir a cada X minutos/horas/dias' },
  { value: 'daily', label: 'Diário', icon: 'lucide:calendar', description: 'Todo dia em horário específico' },
  { value: 'weekly', label: 'Semanal', icon: 'lucide:calendar-days', description: 'Dias específicos da semana' },
  { value: 'monthly', label: 'Mensal', icon: 'lucide:calendar-range', description: 'Dia específico do mês' },
  { value: 'cron', label: 'Cron', icon: 'lucide:terminal', description: 'Expressão cron personalizada' }
]

const dateExpressions = [
  { label: 'Hoje', value: '{{today}}' },
  { label: 'Ontem', value: '{{yesterday}}' },
  { label: 'Amanhã', value: '{{tomorrow}}' },
  { label: 'Últimos 7 dias', value: '{{today - 7 days}}' },
  { label: 'Últimos 30 dias', value: '{{today - 30 days}}' },
  { label: 'Início do Mês', value: '{{startOfMonth}}' },
  { label: 'Fim do Mês', value: '{{endOfMonth}}' },
  { label: 'Última Execução', value: '{{lastExecution}}' }
]

const cronExamples = [
  { expr: '0 */2 * * *', desc: 'A cada 2 horas' },
  { expr: '0 9 * * *', desc: 'Todo dia às 9:00' },
  { expr: '0 9 * * 1-5', desc: 'Dias úteis às 9:00' },
  { expr: '0 0 1 * *', desc: 'Primeiro dia do mês à meia-noite' }
]

// Step validation
function canProceed() {
  errors.value = {}

  if (currentStep.value === 1) {
    if (!formData.value.flowId) {
      errors.value.flowId = 'Por favor selecione um fluxo'
      return false
    }
  }

  if (currentStep.value === 2) {
    switch (formData.value.scheduleType) {
      case 'interval':
        if (formData.value.intervalUnit === 'minutes' && formData.value.intervalValue < 5) {
          errors.value.intervalValue = 'Intervalo mínimo é 5 minutos'
          return false
        }
        if (!formData.value.intervalValue || formData.value.intervalValue <= 0) {
          errors.value.intervalValue = 'Valor do intervalo deve ser maior que 0'
          return false
        }
        break

      case 'daily':
        if (!formData.value.time) {
          errors.value.time = 'Horário é obrigatório'
          return false
        }
        break

      case 'weekly':
        if (!formData.value.daysOfWeek || formData.value.daysOfWeek.length === 0) {
          errors.value.daysOfWeek = 'Selecione pelo menos um dia'
          return false
        }
        if (!formData.value.time) {
          errors.value.time = 'Horário é obrigatório'
          return false
        }
        break

      case 'monthly':
        if (!formData.value.dayOfMonth || formData.value.dayOfMonth < 1 || formData.value.dayOfMonth > 31) {
          errors.value.dayOfMonth = 'Dia deve estar entre 1 e 31'
          return false
        }
        if (!formData.value.time) {
          errors.value.time = 'Horário é obrigatório'
          return false
        }
        break

      case 'cron':
        if (!formData.value.cronExpression) {
          errors.value.cronExpression = 'Expressão cron é obrigatória'
          return false
        }
        break
    }
  }

  return true
}

// Navigation
function nextStep() {
  if (!canProceed()) return

  if (currentStep.value === 1) {
    emit('flow-selected', formData.value.flowId)
  }

  // Skip input step if no inputs
  if (currentStep.value === 2 && props.flowInputs.length === 0) {
    currentStep.value = 4
  } else {
    currentStep.value++
  }
}

function prevStep() {
  // Skip input step if no inputs
  if (currentStep.value === 4 && props.flowInputs.length === 0) {
    currentStep.value = 2
  } else {
    currentStep.value--
  }
}

function handleSubmit() {
  if (!canProceed()) return

  const payload = {
    flowId: formData.value.flowId,
    scheduleType: formData.value.scheduleType,
    inputData: formData.value.inputData
  }

  if (formData.value.maxExecutions) {
    payload.maxExecutions = parseInt(formData.value.maxExecutions)
  }
  if (formData.value.expiresAt) {
    payload.expiresAt = new Date(formData.value.expiresAt).toISOString()
  }

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

// Helpers
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

function getInputType(type) {
  const typeMap = {
    string: 'text',
    number: 'number',
    boolean: 'checkbox',
    email: 'email',
    url: 'url',
    date: 'text',
    datetime: 'text'
  }
  return typeMap[type] || 'text'
}

function isDateField(input) {
  return input.type === 'date' || input.type === 'datetime'
}

function isDynamicExpression(value) {
  if (!value || typeof value !== 'string') return false
  return value.includes('{{') && value.includes('}}')
}

function previewDateExpression(expression, format = 'YYYY-MM-DD') {
  if (!isDynamicExpression(expression)) return null

  const today = new Date()
  const formatDate = (date, fmt) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return fmt.replace('YYYY', year).replace('MM', month).replace('DD', day)
  }

  try {
    if (expression.includes('{{today}}')) return formatDate(today, format)
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
    return `Will be calculated: ${expression}`
  } catch (e) {
    return 'Invalid expression'
  }
}

function insertExpression(inputName, expression) {
  formData.value.inputData[inputName] = expression
}

function getFlowId(flow) {
  return flow?.id || flow?._id
}

const selectedFlow = computed(() => {
  return props.availableFlows.find(f => getFlowId(f) === formData.value.flowId)
})

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
</script>

<template>
  <div class="space-y-6">
    <!-- Progress Steps -->
    <div class="flex items-center justify-between mb-8">
      <div
        v-for="step in totalSteps"
        :key="step"
        class="flex items-center"
        :class="{ 'flex-1': step < totalSteps }"
      >
        <div
          :class="[
            'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all',
            currentStep >= step
              ? 'bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30'
              : 'bg-gray-100 text-gray-600 border border-gray-200'
          ]"
        >
          <Icon v-if="currentStep > step" icon="lucide:check" class="w-5 h-5" />
          <span v-else>{{ step }}</span>
        </div>
        <div
          v-if="step < totalSteps"
          :class="[
            'h-1 flex-1 mx-2 transition-all rounded',
            currentStep > step ? 'bg-gradient-to-r from-blue-600 to-cyan-600' : 'bg-gray-200'
          ]"
        ></div>
      </div>
    </div>

    <!-- Step 1: Select Flow -->
    <div v-if="currentStep === 1" class="space-y-4">
      <div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2 tracking-wide">Selecionar Fluxo</h3>
        <p class="text-sm text-gray-700 mb-4 tracking-wide">Escolha o fluxo que deseja agendar</p>
      </div>

      <div class="grid grid-cols-1 gap-3">
        <button
          v-for="flow in availableFlows"
          :key="getFlowId(flow)"
          @click="formData.flowId = getFlowId(flow)"
          :class="[
            'p-4 rounded-lg border-2 text-left transition-all',
            formData.flowId === getFlowId(flow)
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
          ]"
        >
          <div class="flex items-center justify-between">
            <div>
              <div class="font-medium text-gray-900">{{ flow.name }}</div>
              <div class="text-sm text-gray-600 mt-1">{{ flow.description || 'Sem descrição' }}</div>
            </div>
            <Icon
              v-if="formData.flowId === getFlowId(flow)"
              icon="lucide:check-circle"
              class="w-6 h-6 text-blue-600"
            />
          </div>
        </button>
      </div>
      <p v-if="errors.flowId" class="text-red-600 text-sm tracking-wide">{{ errors.flowId }}</p>
    </div>

    <!-- Step 2: Configure Schedule -->
    <div v-if="currentStep === 2" class="space-y-6">
      <div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2 tracking-wide">Configurar Agendamento</h3>
        <p class="text-sm text-gray-700 mb-4 tracking-wide">Defina quando e com que frequência este fluxo deve ser executado</p>
      </div>

      <!-- Schedule Type Selection -->
      <div>
        <label class="block text-sm font-medium text-gray-900 mb-3 tracking-wide">Tipo de Agendamento</label>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <button
            v-for="type in scheduleTypes"
            :key="type.value"
            @click="formData.scheduleType = type.value"
            :class="[
              'p-4 rounded-lg border-2 text-left transition-all',
              formData.scheduleType === type.value
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
            ]"
          >
            <div class="flex items-center space-x-3">
              <Icon
                :icon="type.icon"
                :class="['w-6 h-6', formData.scheduleType === type.value ? 'text-blue-600' : 'text-gray-400']"
              />
              <div>
                <div class="font-medium text-gray-900">{{ type.label }}</div>
                <div class="text-xs text-gray-600">{{ type.description }}</div>
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- Interval Settings -->
      <div v-if="formData.scheduleType === 'interval'" class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Valor do Intervalo</label>
          <input
            v-model.number="formData.intervalValue"
            type="number"
            min="1"
            class="w-full px-3 py-2 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            :class="{ 'border-red-600': errors.intervalValue }"
          />
          <p v-if="errors.intervalValue" class="text-red-600 text-xs mt-1">{{ errors.intervalValue }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Unidade</label>
          <select
            v-model="formData.intervalUnit"
            class="w-full px-3 py-2 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
            class="w-full px-3 py-2 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            :class="{ 'border-red-600': errors.time }"
          />
          <p v-if="errors.time" class="text-red-600 text-xs mt-1">{{ errors.time }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
          <select
            v-model="formData.timezone"
            class="w-full px-3 py-2 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
              class="w-full px-3 py-2 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              :class="{ 'border-red-600': errors.time }"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
            <select
              v-model="formData.timezone"
              class="w-full px-3 py-2 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
            class="w-full px-3 py-2 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            :class="{ 'border-red-600': errors.dayOfMonth }"
          />
          <p v-if="errors.dayOfMonth" class="text-red-600 text-xs mt-1">{{ errors.dayOfMonth }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Time</label>
          <input
            v-model="formData.time"
            type="time"
            class="w-full px-3 py-2 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            :class="{ 'border-red-600': errors.time }"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
          <select
            v-model="formData.timezone"
            class="w-full px-3 py-2 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
            class="w-full px-3 py-2 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option v-for="tz in timezones" :key="tz" :value="tz">{{ tz }}</option>
          </select>
        </div>
        <div class="bg-blue-50/50 border border-blue-200 rounded-lg p-4">
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

      <!-- Preview -->
      <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div class="flex items-center space-x-2">
          <Icon icon="lucide:info" class="w-4 h-4 text-gray-600" />
          <span class="text-sm font-medium text-gray-700">Schedule Preview:</span>
          <span class="text-sm text-gray-900 font-mono">{{ previewText }}</span>
        </div>
      </div>
    </div>

    <!-- Step 3: Flow Inputs (Only if inputs exist) -->
    <div v-if="currentStep === 3 && flowInputs.length > 0" class="space-y-6">
      <div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Flow Input Data</h3>
        <p class="text-sm text-gray-600 mb-4">Provide data that will be used in each execution</p>
      </div>

      <div class="space-y-4">
        <div v-for="input in flowInputs" :key="input.name" class="space-y-2">
          <label class="block">
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm font-medium text-gray-700">
                {{ input.name }}
                <span v-if="input.required" class="text-red-500">*</span>
              </span>
              <span class="text-xs text-gray-600">{{ input.type }}</span>
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
                <p class="text-xs font-medium text-blue-900 mb-2">💡 Quick Insert:</p>
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
              class="w-full px-3 py-2 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />

            <!-- Boolean/Checkbox -->
            <div v-else class="flex items-center">
              <input
                v-model="formData.inputData[input.name]"
                type="checkbox"
                :id="`wizard-input-${input.name}`"
                class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label :for="`wizard-input-${input.name}`" class="ml-2 text-sm text-gray-700">
                {{ input.description || 'Enable' }}
              </label>
            </div>

            <p v-if="input.description && input.type !== 'boolean' && !isDateField(input)" class="text-xs text-gray-600 mt-1">
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

    <!-- Step 4: Advanced Options & Review -->
    <div v-if="currentStep === (flowInputs.length > 0 ? 4 : 3)" class="space-y-6">
      <div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Review & Advanced Options</h3>
        <p class="text-sm text-gray-600 mb-4">Review your schedule and configure optional settings</p>
      </div>

      <!-- Summary -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
        <div class="flex items-center space-x-2 text-blue-900">
          <Icon icon="lucide:workflow" class="w-5 h-5" />
          <span class="font-semibold">{{ selectedFlow?.name }}</span>
        </div>
        <div class="flex items-center space-x-2 text-blue-800">
          <Icon icon="lucide:clock" class="w-4 h-4" />
          <span class="text-sm font-mono">{{ previewText }}</span>
        </div>
        <div v-if="Object.keys(formData.inputData).length > 0" class="flex items-center space-x-2 text-blue-800">
          <Icon icon="lucide:input" class="w-4 h-4" />
          <span class="text-sm">{{ Object.keys(formData.inputData).length }} input(s) configured</span>
        </div>
      </div>

      <!-- Advanced Options -->
      <div class="border-t border-gray-200 pt-4">
        <h4 class="text-sm font-medium text-gray-700 mb-4">Advanced Options (Optional)</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Max Executions</label>
            <input
              v-model.number="formData.maxExecutions"
              type="number"
              min="1"
              placeholder="Unlimited"
              class="w-full px-3 py-2 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <p class="text-xs text-gray-600 mt-1">Leave empty for unlimited executions</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Expires At</label>
            <input
              v-model="formData.expiresAt"
              type="datetime-local"
              class="w-full px-3 py-2 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <p class="text-xs text-gray-600 mt-1">Schedule will stop after this date</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Buttons -->
    <div class="flex items-center justify-between pt-4 border-t border-gray-200">
      <button
        v-if="currentStep > 1"
        @click="prevStep"
        type="button"
        class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg bg-white hover:bg-gray-50 transition-all flex items-center space-x-2 font-medium"
      >
        <Icon icon="lucide:arrow-left" class="w-4 h-4" />
        <span>Voltar</span>
      </button>
      <button
        v-else
        @click="$emit('cancel')"
        type="button"
        class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg bg-white hover:bg-gray-50 transition-all font-medium"
      >
        Cancelar
      </button>

      <button
        v-if="currentStep < totalSteps"
        @click="nextStep"
        type="button"
        class="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg transition-all flex items-center space-x-2 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 font-medium"
      >
        <span>Próximo</span>
        <Icon icon="lucide:arrow-right" class="w-4 h-4" />
      </button>
      <button
        v-else
        @click="handleSubmit"
        type="button"
        class="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg transition-all flex items-center space-x-2 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 font-medium"
      >
        <Icon icon="lucide:check" class="w-4 h-4" />
        <span>Criar Agendamento</span>
      </button>
    </div>
  </div>
</template>
