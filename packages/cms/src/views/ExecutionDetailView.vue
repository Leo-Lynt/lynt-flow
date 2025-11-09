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
      <div class="flex items-center justify-between mb-8">
        <div>
          <div class="flex items-center space-x-3 mb-2">
            <button
              @click="router.push('/executions')"
              class="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Icon icon="lucide:arrow-left" class="w-5 h-5" />
            </button>
            <h1 class="text-3xl font-semibold text-gray-800 tracking-wide">Detalhes da Execução</h1>
            <ExecutionStatusBadge :status="execution.status" />
          </div>
          <p class="text-gray-600 ml-8 text-sm tracking-wide">
            Fluxo: <span class="font-medium">{{ execution.flowName || 'Desconhecido' }}</span>
            <span v-if="execution.flowDeleted" class="text-red-600 ml-2">(Fluxo Excluído)</span>
          </p>
        </div>
        <div class="flex items-center space-x-3">
          <button
            v-if="!execution.flowDeleted"
            @click="handleReexecute"
            :disabled="reexecuting"
            class="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-4 py-2.5 rounded-lg disabled:opacity-50 flex items-center space-x-2 transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 text-sm font-medium tracking-wide"
          >
            <Icon
              :icon="reexecuting ? 'lucide:loader-2' : 'lucide:repeat'"
              :class="['w-4 h-4', { 'animate-spin': reexecuting }]"
            />
            <span>{{ reexecuting ? 'Reexecutando...' : 'Reexecutar' }}</span>
          </button>
          <button
            v-if="!execution.flowDeleted"
            @click="viewFlow"
            class="bg-white/70 backdrop-blur-sm border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-white/90 hover:brightness-95 transition-all flex items-center space-x-2 text-sm font-medium tracking-wide"
          >
            <Icon icon="lucide:workflow" class="w-4 h-4" />
            <span>Ver Fluxo</span>
          </button>
        </div>
      </div>

      <!-- Execution Info -->
      <BaseCard title="Informações da Execução" subtitle="Detalhes gerais sobre esta execução" class="mb-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 class="text-sm font-medium text-gray-700 mb-3 tracking-wide">Informações Gerais</h4>
            <dl class="space-y-2">
              <div class="flex justify-between text-sm">
                <dt class="text-gray-600">ID da Execução:</dt>
                <dd class="font-mono text-gray-900 text-xs">{{ execution.executionId || executionId }}</dd>
              </div>
              <div class="flex justify-between text-sm">
                <dt class="text-gray-600">ID do Fluxo:</dt>
                <dd class="font-mono text-gray-900 text-xs">{{ execution.flowId || '-' }}</dd>
              </div>
              <div class="flex justify-between text-sm">
                <dt class="text-gray-600">Nome do Fluxo:</dt>
                <dd class="text-gray-900">{{ execution.flowName || 'Desconhecido' }}</dd>
              </div>
              <div class="flex justify-between text-sm">
                <dt class="text-gray-600">Status:</dt>
                <dd class="text-gray-900">
                  <ExecutionStatusBadge :status="execution.status" />
                </dd>
              </div>
              <div class="flex justify-between text-sm">
                <dt class="text-gray-600">Iniciado em:</dt>
                <dd class="text-gray-900">{{ formatDate(execution.startedAt) }}</dd>
              </div>
              <div class="flex justify-between text-sm">
                <dt class="text-gray-600">Concluído em:</dt>
                <dd class="text-gray-900">{{ formatDate(execution.completedAt) }}</dd>
              </div>
              <div class="flex justify-between text-sm">
                <dt class="text-gray-600">Tempo de Execução:</dt>
                <dd class="text-gray-900 font-medium">{{ formatDuration(execution.executionTime) }}</dd>
              </div>
            </dl>
          </div>
        </div>
      </BaseCard>

      <!-- Input Data -->
      <BaseCard title="Dados de Entrada" subtitle="Dados utilizados para executar este fluxo" class="mb-8">
        <div v-if="execution.inputData && Object.keys(execution.inputData).length > 0" class="bg-white/50 rounded-lg p-4 overflow-x-auto border border-gray-200">
          <pre class="text-sm text-gray-800 font-mono">{{ JSON.stringify(execution.inputData, null, 2) }}</pre>
        </div>
        <div v-else class="text-center py-8 text-gray-500">
          <Icon icon="lucide:file-input" class="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p class="text-sm tracking-wide">Nenhum dado de entrada foi fornecido</p>
        </div>
      </BaseCard>

      <!-- Output Data -->
      <BaseCard title="Dados de Saída" subtitle="Resultado da execução do fluxo" class="mb-8">
        <div v-if="execution.outputData && Object.keys(execution.outputData).length > 0" class="bg-white/50 rounded-lg p-4 overflow-x-auto border border-gray-200">
          <pre class="text-sm text-gray-800 font-mono">{{ JSON.stringify(execution.outputData, null, 2) }}</pre>
        </div>
        <div v-else class="text-center py-8 text-gray-500">
          <Icon icon="lucide:file-text" class="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p class="text-sm tracking-wide">Nenhum dado de saída disponível</p>
        </div>
      </BaseCard>
    </div>

    <div v-else class="text-center py-12">
      <Icon icon="lucide:alert-circle" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-semibold text-gray-800 mb-2 tracking-wide">Execução não encontrada</h3>
      <p class="text-gray-600 mb-6 text-sm tracking-wide">A execução que você está procurando não existe.</p>
      <button
        @click="router.push('/executions')"
        class="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-5 py-2.5 rounded-lg transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 inline-flex items-center space-x-2 text-sm font-medium tracking-wide"
      >
        <Icon icon="lucide:arrow-left" class="w-4 h-4" />
        <span>Voltar para Execuções</span>
      </button>
    </div>
  </AppLayout>
</template>
