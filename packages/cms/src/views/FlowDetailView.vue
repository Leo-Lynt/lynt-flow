<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import AppLayout from '../components/AppLayout.vue'
import BaseCard from '../components/BaseCard.vue'
import ExecutionStatusBadge from '../components/ExecutionStatusBadge.vue'
import ScheduleStatusBadge from '../components/ScheduleStatusBadge.vue'
import { useFlows } from '../composables/useFlows.js'
import { useSchedules } from '../composables/useSchedules.js'

const route = useRoute()
const router = useRouter()
const { currentFlow, loading, getFlow, executeFlow, getFlowStats, getExecutions } = useFlows()
const { getSchedules } = useSchedules()

const flowId = route.params.id
const stats = ref({})
const executing = ref(false)
const recentExecutions = ref([])
const flowSchedules = ref([])

onMounted(async () => {
  await loadFlow()
  await loadStats()
  await loadRecentExecutions()
  await loadSchedules()
})

async function loadFlow() {
  const result = await getFlow(flowId)
  if (!result.success) {
    router.push('/dashboard')
  }
}

async function loadStats() {
  const result = await getFlowStats(flowId)
  if (result.success) {
    stats.value = result.data
  }
}

async function loadRecentExecutions() {
  const result = await getExecutions({ flowId, limit: 5, page: 1 })
  if (result.success) {
    recentExecutions.value = result.data || []
  }
}

async function loadSchedules() {
  const result = await getSchedules({ flowId, enabled: true })
  if (result.success) {
    flowSchedules.value = result.data || []
  }
}

const nodeCount = computed(() => {
  return currentFlow.value?.flowData?.nodes?.length || 0
})

const edgeCount = computed(() => {
  return currentFlow.value?.flowData?.edges?.length || 0
})

function editFlow() {
  router.push(`/flows/${flowId}/edit`)
}

async function handleExecute() {
  executing.value = true
  const result = await executeFlow(flowId)
  executing.value = false

  if (result.success) {
    router.push(`/executions/${result.data.id}`)
  }
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatDateShort(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function createSchedule() {
  router.push('/schedules')
}

function viewAllExecutions() {
  router.push(`/executions?flowId=${flowId}`)
}

function viewExecution(executionId) {
  router.push(`/executions/${executionId}`)
}
</script>

<template>
  <AppLayout>
    <div v-if="loading" class="flex justify-center items-center h-64">
      <Icon icon="lucide:loader-2" class="w-8 h-8 animate-spin text-gray-400" />
    </div>

    <div v-else-if="currentFlow">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ currentFlow.name }}</h1>
          <p class="text-gray-600 mt-1">{{ currentFlow.description || 'No description' }}</p>
        </div>
        <div class="flex items-center space-x-3">
          <button
            @click="handleExecute"
            :disabled="executing"
            class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <Icon
              :icon="executing ? 'lucide:loader-2' : 'lucide:play'"
              :class="['w-4 h-4', { 'animate-spin': executing }]"
            />
            <span>{{ executing ? 'Executing...' : 'Execute' }}</span>
          </button>
          <button
            @click="editFlow"
            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Icon icon="lucide:edit" class="w-4 h-4" />
            <span>Edit</span>
          </button>
        </div>
      </div>

      <!-- Flow info cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <BaseCard title="Flow Structure">
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-gray-600">Nodes:</span>
              <span class="font-medium">{{ nodeCount }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Connections:</span>
              <span class="font-medium">{{ edgeCount }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Status:</span>
              <span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Active</span>
            </div>
          </div>
        </BaseCard>

        <BaseCard title="Execution Stats">
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-gray-600">Total Runs:</span>
              <span class="font-medium">{{ stats.totalExecutions || 0 }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Success Rate:</span>
              <span class="font-medium">{{ stats.successRate || 0 }}%</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Last Run:</span>
              <span class="font-medium text-sm">{{ stats.lastExecution ? formatDate(stats.lastExecution) : 'Never' }}</span>
            </div>
          </div>
        </BaseCard>

        <BaseCard title="Flow Details">
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-gray-600">Created:</span>
              <span class="font-medium text-sm">{{ formatDate(currentFlow.createdAt) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Updated:</span>
              <span class="font-medium text-sm">{{ formatDate(currentFlow.updatedAt) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Visibility:</span>
              <span class="font-medium">{{ currentFlow.isPublic ? 'Public' : 'Private' }}</span>
            </div>
          </div>
        </BaseCard>
      </div>

      <!-- Schedules Section -->
      <BaseCard title="Active Schedules" subtitle="Automated execution schedules for this flow" class="mb-8">
        <div v-if="flowSchedules.length > 0" class="space-y-3">
          <div
            v-for="schedule in flowSchedules"
            :key="schedule._id"
            class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div class="flex items-center space-x-3">
              <Icon icon="lucide:clock" class="w-5 h-5 text-gray-400" />
              <div>
                <div class="font-medium text-gray-900">
                  {{ schedule.scheduleType.charAt(0).toUpperCase() + schedule.scheduleType.slice(1) }} Schedule
                </div>
                <div class="text-sm text-gray-600">
                  Next run: {{ formatDateShort(schedule.nextExecutionAt) }}
                </div>
              </div>
            </div>
            <ScheduleStatusBadge
              :enabled="schedule.enabled"
              :is-currently-running="schedule.isCurrentlyRunning"
            />
          </div>
        </div>
        <div v-else class="text-center py-8">
          <Icon icon="lucide:calendar-off" class="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p class="text-gray-500 mb-4">No active schedules for this flow</p>
          <button
            @click="createSchedule"
            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center space-x-2"
          >
            <Icon icon="lucide:plus" class="w-4 h-4" />
            <span>Create Schedule</span>
          </button>
        </div>
      </BaseCard>

      <!-- Recent Executions -->
      <BaseCard title="Recent Executions" subtitle="Latest execution history" class="mb-8">
        <div v-if="recentExecutions.length > 0" class="space-y-3">
          <div
            v-for="execution in recentExecutions"
            :key="execution._id"
            @click="viewExecution(execution._id)"
            class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
          >
            <div class="flex items-center space-x-3">
              <Icon icon="lucide:play-circle" class="w-5 h-5 text-gray-400" />
              <div>
                <div class="text-sm text-gray-600">
                  {{ formatDateShort(execution.startedAt) }}
                </div>
                <div class="text-xs text-gray-500">
                  Triggered by: {{ execution.triggeredBy }}
                </div>
              </div>
            </div>
            <ExecutionStatusBadge :status="execution.status" />
          </div>
          <button
            @click="viewAllExecutions"
            class="w-full text-center text-sm text-blue-600 hover:text-blue-700 py-2"
          >
            View all executions →
          </button>
        </div>
        <div v-else class="text-center py-8">
          <Icon icon="lucide:inbox" class="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p class="text-gray-500">No executions yet</p>
        </div>
      </BaseCard>

      <!-- Flow diagram preview -->
      <BaseCard title="Flow Diagram" subtitle="Visual representation of your workflow">
        <div class="bg-gray-50 border border-gray-200 rounded-lg h-64 flex items-center justify-center">
          <div class="text-center">
            <Icon icon="lucide:workflow" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p class="text-gray-500">Flow diagram preview</p>
            <p class="text-sm text-gray-400 mt-1">{{ nodeCount }} nodes, {{ edgeCount }} connections</p>
          </div>
        </div>
      </BaseCard>
    </div>

    <div v-else class="text-center py-8">
      <Icon icon="lucide:alert-circle" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">Flow not found</h3>
      <p class="text-gray-600 mb-4">The flow you're looking for doesn't exist or has been deleted.</p>
      <button
        @click="router.push('/dashboard')"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        Back to Dashboard
      </button>
    </div>
  </AppLayout>
</template>