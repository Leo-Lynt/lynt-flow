<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import AppLayout from '../components/AppLayout.vue'
import BaseCard from '../components/BaseCard.vue'
import ExecutionStatusBadge from '../components/ExecutionStatusBadge.vue'
import { useFlows } from '../composables/useFlows.js'

const route = useRoute()
const router = useRouter()
const { getExecution, reexecuteFlow, loading } = useFlows()

const executionId = route.params.id
const execution = ref(null)
const reexecuting = ref(false)

onMounted(async () => {
  await loadExecution()
})

async function loadExecution() {
  const result = await getExecution(executionId)
  if (result.success) {
    execution.value = result.data.data || result.data
  } else {
    router.push('/executions')
  }
}

async function handleReexecute() {
  reexecuting.value = true
  const result = await reexecuteFlow(executionId)
  reexecuting.value = false

  if (result.success) {
    const newExecutionId = result.data.data?.newExecutionId || result.data.newExecutionId
    if (newExecutionId) {
      router.push(`/executions/${newExecutionId}`)
    }
  }
}

function viewFlow() {
  if (execution.value?.flowId) {
    const editorUrl = `${import.meta.env.VITE_CMS_URL || 'http://localhost:5174'}/editor/?flowId=${execution.value.flowId}`
    window.open(editorUrl, '_blank')
  }
}

function formatDate(date) {
  if (!date) return '-'
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

function formatDuration(ms) {
  if (!ms) return '-'
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  } else {
    return `${seconds}s`
  }
}
</script>

<template>
  <AppLayout>
    <div v-if="loading" class="flex justify-center items-center h-64">
      <Icon icon="lucide:loader-2" class="w-8 h-8 animate-spin text-gray-400" />
    </div>

    <div v-else-if="execution">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <div class="flex items-center space-x-3 mb-2">
            <button
              @click="router.push('/executions')"
              class="text-gray-600 hover:text-gray-900"
            >
              <Icon icon="lucide:arrow-left" class="w-5 h-5" />
            </button>
            <h1 class="text-2xl font-bold text-gray-900">Execution Response</h1>
            <ExecutionStatusBadge :status="execution.status" />
          </div>
          <p class="text-gray-600 ml-8">
            Flow: <span class="font-medium">{{ execution.flowName || 'Unknown' }}</span>
            <span v-if="execution.flowDeleted" class="text-red-600 ml-2">(Flow Deleted)</span>
          </p>
        </div>
        <div class="flex items-center space-x-3">
          <button
            v-if="!execution.flowDeleted"
            @click="handleReexecute"
            :disabled="reexecuting"
            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <Icon
              :icon="reexecuting ? 'lucide:loader-2' : 'lucide:repeat'"
              :class="['w-4 h-4', { 'animate-spin': reexecuting }]"
            />
            <span>{{ reexecuting ? 'Re-executing...' : 'Re-execute' }}</span>
          </button>
          <button
            v-if="!execution.flowDeleted"
            @click="viewFlow"
            class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center space-x-2"
          >
            <Icon icon="lucide:workflow" class="w-4 h-4" />
            <span>View Flow</span>
          </button>
        </div>
      </div>

      <!-- Execution Info -->
      <BaseCard title="Execution Information" class="mb-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 class="text-sm font-medium text-gray-700 mb-3">General Information</h4>
            <dl class="space-y-2">
              <div class="flex justify-between text-sm">
                <dt class="text-gray-600">Execution ID:</dt>
                <dd class="font-mono text-gray-900">{{ execution.executionId || executionId }}</dd>
              </div>
              <div class="flex justify-between text-sm">
                <dt class="text-gray-600">Flow ID:</dt>
                <dd class="font-mono text-gray-900">{{ execution.flowId || '-' }}</dd>
              </div>
              <div class="flex justify-between text-sm">
                <dt class="text-gray-600">Flow Name:</dt>
                <dd class="text-gray-900">{{ execution.flowName || 'Unknown' }}</dd>
              </div>
              <div class="flex justify-between text-sm">
                <dt class="text-gray-600">Status:</dt>
                <dd class="text-gray-900">
                  <ExecutionStatusBadge :status="execution.status" />
                </dd>
              </div>
              <div class="flex justify-between text-sm">
                <dt class="text-gray-600">Started At:</dt>
                <dd class="text-gray-900">{{ formatDate(execution.startedAt) }}</dd>
              </div>
              <div class="flex justify-between text-sm">
                <dt class="text-gray-600">Completed At:</dt>
                <dd class="text-gray-900">{{ formatDate(execution.completedAt) }}</dd>
              </div>
              <div class="flex justify-between text-sm">
                <dt class="text-gray-600">Execution Time:</dt>
                <dd class="text-gray-900">{{ formatDuration(execution.executionTime) }}</dd>
              </div>
            </dl>
          </div>
        </div>
      </BaseCard>

      <!-- Input Data -->
      <BaseCard title="Input Data" subtitle="Data used to execute this flow" class="mb-8">
        <div v-if="execution.inputData && Object.keys(execution.inputData).length > 0" class="bg-gray-50 rounded-lg p-4 overflow-x-auto">
          <pre class="text-sm text-gray-800">{{ JSON.stringify(execution.inputData, null, 2) }}</pre>
        </div>
        <div v-else class="text-center py-8 text-gray-500">
          <Icon icon="lucide:file-input" class="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>No input data was provided</p>
        </div>
      </BaseCard>

      <!-- Output Data -->
      <BaseCard title="Output Data" subtitle="Result data from the execution" class="mb-8">
        <div v-if="execution.outputData && Object.keys(execution.outputData).length > 0" class="bg-gray-50 rounded-lg p-4 overflow-x-auto">
          <pre class="text-sm text-gray-800">{{ JSON.stringify(execution.outputData, null, 2) }}</pre>
        </div>
        <div v-else class="text-center py-8 text-gray-500">
          <Icon icon="lucide:file-text" class="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>No output data available</p>
        </div>
      </BaseCard>
    </div>

    <div v-else class="text-center py-8">
      <Icon icon="lucide:alert-circle" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">Execution not found</h3>
      <p class="text-gray-600 mb-4">The execution you're looking for doesn't exist.</p>
      <button
        @click="router.push('/executions')"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        Back to Executions
      </button>
    </div>
  </AppLayout>
</template>
