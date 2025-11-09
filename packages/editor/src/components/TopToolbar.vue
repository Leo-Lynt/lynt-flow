<template>
  <header class="relative px-4 py-3 lg:pl-4 lg:pr-4 flex-shrink-0 z-[100]">
    <div class="relative border bg-[#ffff] shadow-sm border-white/20 rounded-2xl overflow-hidden">
      <!-- Gradient de fundo sutil -->
      <div class="absolute inset-0 -z-10 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 transition-all duration-700 rounded-2xl"></div>
      <div class="absolute inset-0 -z-10 bg-white/70 rounded-2xl"></div>

      <div class="flex items-center justify-between px-4 sm:px-6 h-14">
        <!-- Left section -->
        <div class="flex items-center space-x-3">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <FlowIcon icon="lucide:workflow" class="w-5 h-5 text-white" />
          </div>
          <span class="hidden sm:block text-xl font-light text-gray-900 tracking-wide">
            Lynt <span class="font-normal text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">Flow</span>
          </span>
        </div>

        <!-- Center section -->
        <div class="flex items-center gap-2 flex-1 justify-center">
          <div class="flex items-center gap-1">
            <button
              @click="handleExecuteClick"
              :disabled="isExecuting"
              :class="{
                'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 cursor-pointer': !isExecuting,
                'bg-gray-400 cursor-not-allowed opacity-60': isExecuting
              }"
              class="inline-flex items-center gap-1.5 px-4 py-2 border-0 rounded-lg text-white text-sm font-semibold transition-all duration-200 tracking-wide"
            >
              <FlowIcon
                :icon="isExecuting ? 'material-symbols:sync' : 'material-symbols:play-arrow'"
                :size="16"
                :class="{ 'animate-spin': isExecuting }"
              />
              {{ isExecuting ? 'Executando...' : 'Executar' }}
            </button>
          </div>

          <template v-if="!playgroundMode">
            <div class="w-px h-6 bg-gray-300 mx-3 opacity-30"></div>

            <div class="flex items-center gap-1">
              <button
                @click="$emit('undo')"
                class="inline-flex items-center gap-1.5 px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-700 text-sm font-medium cursor-pointer transition-all hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                title="Desfazer (Ctrl+Z)"
                :disabled="!canUndo"
              >
                <FlowIcon icon="material-symbols:undo" :size="16" />
              </button>
              <button
                @click="$emit('redo')"
                class="inline-flex items-center gap-1.5 px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-700 text-sm font-medium cursor-pointer transition-all hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                title="Refazer (Ctrl+Y)"
                :disabled="!canRedo"
              >
                <FlowIcon icon="material-symbols:redo" :size="16" />
              </button>
            </div>
          </template>
        </div>

        <!-- Right section -->
        <div v-if="!playgroundMode" class="flex items-center gap-2">
          <!-- Botão de Save Manual -->
          <button
            v-if="!hideSaveButton"
            @click="handleSaveClick"
            :disabled="!hasUnsavedChanges || syncStatus === 'syncing'"
            class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all tracking-wide shadow-sm"
            :class="{
              'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 cursor-pointer': hasUnsavedChanges && syncStatus !== 'syncing',
              'bg-white border border-gray-200 text-gray-400 cursor-not-allowed opacity-60': !hasUnsavedChanges || syncStatus === 'syncing'
            }"
            :title="saveButtonTooltip"
          >
            <FlowIcon
              :icon="syncStatus === 'syncing' ? 'material-symbols:sync' : 'material-symbols:save'"
              :size="16"
              :class="{ 'animate-spin': syncStatus === 'syncing' }"
            />
            {{ saveButtonText }}
          </button>

          <div v-if="!hideSaveButton" class="w-px h-6 bg-gray-300 mx-2 opacity-30"></div>


          <!-- Sync Status Indicator -->
          <div
            v-if="!hideSaveButton"
            class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border shadow-sm"
            :class="{
              'bg-orange-50 border-orange-200': hasUnsavedChanges && syncStatus !== 'syncing',
              'bg-green-50 border-green-200': !hasUnsavedChanges && syncStatus === 'synced',
              'bg-blue-50 border-blue-200': syncStatus === 'syncing',
              'bg-red-50 border-red-200': syncStatus === 'error',
              'bg-gray-50 border-gray-200': syncStatus === 'offline'
            }"
            :title="syncTooltip"
          >
            <FlowIcon
              :icon="syncIcon"
              :size="14"
              :class="{
                'text-orange-600': hasUnsavedChanges && syncStatus !== 'syncing',
                'text-green-600': !hasUnsavedChanges && syncStatus === 'synced',
                'text-blue-600 animate-spin': syncStatus === 'syncing',
                'text-red-600': syncStatus === 'error',
                'text-gray-600': syncStatus === 'offline'
              }"
            />
            <span class="text-xs font-medium tracking-wide" :class="{
              'text-orange-700': hasUnsavedChanges && syncStatus !== 'syncing',
              'text-green-700': !hasUnsavedChanges && syncStatus === 'synced',
              'text-blue-700': syncStatus === 'syncing',
              'text-red-700': syncStatus === 'error',
              'text-gray-700': syncStatus === 'offline'
            }">{{ syncText }}</span>
          </div>

          <div
            class="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-gray-200 shadow-sm"
            v-if="executionStatus"
          >
            <div
              class="w-2 h-2 rounded-full"
              :class="{
                'bg-gray-400': !executionStatus,
                'bg-orange-500 animate-pulse': executionStatus === 'running',
                'bg-green-500': executionStatus === 'success',
                'bg-red-500': executionStatus === 'error'
              }"
            ></div>
            <span class="text-xs text-gray-700 font-medium tracking-wide">{{ statusText }}</span>
          </div>

          <button
            @click="goToDocs"
            class="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 text-sm font-medium cursor-pointer transition-all hover:bg-gray-50 hover:border-gray-300 shadow-sm"
            title="Abrir Documentação"
          >
            <FlowIcon icon="material-symbols:help" :size="16" />
            <span>Ajuda</span>
          </button>

          <button
            @click="toggleTheme"
            class="inline-flex items-center gap-1.5 px-2 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 text-sm font-medium cursor-pointer transition-all hover:bg-gray-50 hover:border-gray-300 shadow-sm"
            :title="`Mudar para modo ${isDark ? 'claro' : 'escuro'}`"
          >
            <FlowIcon :icon="isDark ? 'material-symbols:light-mode' : 'material-symbols:dark-mode'" :size="16" />
          </button>

          <!-- Botão de Export Tutorial (apenas para admins/moderadores) -->
          <button
            v-if="isAdminOrModerator"
            @click="exportAsTutorial"
            class="inline-flex items-center gap-1.5 px-2 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 text-sm font-medium cursor-pointer transition-all hover:bg-gray-50 hover:border-gray-300 shadow-sm"
            title="Exportar como Tutorial"
          >
            <FlowIcon icon="material-symbols:download" :size="16" />
          </button>
        </div>

        <!-- Modo Playground: apenas status de execução -->
        <div v-else class="flex items-center gap-2">
          <div
            class="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-gray-200 shadow-sm"
            v-if="executionStatus"
          >
            <div
              class="w-2 h-2 rounded-full"
              :class="{
                'bg-gray-400': !executionStatus,
                'bg-orange-500 animate-pulse': executionStatus === 'running',
                'bg-green-500': executionStatus === 'success',
                'bg-red-500': executionStatus === 'error'
              }"
            ></div>
            <span class="text-xs text-gray-700 font-medium tracking-wide">{{ statusText }}</span>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFlowStore } from '../stores/flowStore'
import { useTheme } from '../composables/useTheme.js'
import { useAuth } from '../composables/useAuth.js'
import FlowIcon from './Icon.vue'

const router = useRouter()
const { user } = useAuth()

const props = defineProps({
  canUndo: {
    type: Boolean,
    default: false
  },
  canRedo: {
    type: Boolean,
    default: false
  },
  executionStatus: {
    type: String,
    default: null // null, 'running', 'success', 'error'
  },
  hasUnsavedChanges: {
    type: Boolean,
    default: false
  },
  hideSaveButton: {
    type: Boolean,
    default: false
  },
  playgroundMode: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'execute',
  'undo',
  'redo',
  'save'
])

const flowStore = useFlowStore()
const { isDark, toggleTheme } = useTheme()

// Verificar se o usuário é admin ou moderador (seguindo padrão do CMS)
const isAdminOrModerator = computed(() => {
  const role = user.value?.role
  return role === 'administrator' || role === 'moderator'
})

const isExecuting = computed(() => props.executionStatus === 'running')

const statusText = computed(() => {
  switch (props.executionStatus) {
    case 'running': return 'Executando...'
    case 'success': return 'Executado'
    case 'error': return 'Erro'
    default: return ''
  }
})

const syncStatus = computed(() => flowStore.syncStatus)

const syncIcon = computed(() => {
  // 🚀 NOVO: Se há mudanças pendentes, mostrar ícone de "upload pending"
  if (props.hasUnsavedChanges && syncStatus.value !== 'syncing') {
    return 'material-symbols:cloud-upload'
  }

  switch (syncStatus.value) {
    case 'synced': return 'material-symbols:cloud-done'
    case 'syncing': return 'material-symbols:sync'
    case 'error': return 'material-symbols:cloud-off'
    case 'offline': return 'material-symbols:wifi-off'
    default: return 'material-symbols:cloud'
  }
})

const syncText = computed(() => {
  // Se há mudanças pendentes, mostrar "Não Salvo"
  if (props.hasUnsavedChanges && syncStatus.value !== 'syncing') {
    return 'Não Salvo'
  }

  switch (syncStatus.value) {
    case 'synced': return 'Salvo'
    case 'syncing': return 'Salvando...'
    case 'error': return 'Erro'
    case 'offline': return 'Offline'
    default: return ''
  }
})

const syncTooltip = computed(() => {
  // Tooltip específico para mudanças pendentes
  if (props.hasUnsavedChanges && syncStatus.value !== 'syncing') {
    return 'Você tem alterações não salvas (salvamento automático em até 2 minutos)'
  }

  switch (syncStatus.value) {
    case 'synced': return 'Todas as alterações salvas na nuvem'
    case 'syncing': return 'Salvando alterações...'
    case 'error': return 'Falha ao salvar alterações'
    case 'offline': return 'Sem conexão com o servidor'
    default: return ''
  }
})

const handleExecuteClick = () => {
  emit('execute')
}

// Computeds e handler para botão de save
const saveButtonText = computed(() => {
  if (syncStatus.value === 'syncing') return 'Salvando...'
  if (props.hasUnsavedChanges) return 'Salvar'
  return 'Salvo'
})

const saveButtonTooltip = computed(() => {
  if (syncStatus.value === 'syncing') return 'Salvando alterações na nuvem...'
  if (props.hasUnsavedChanges) return 'Salvar alterações na nuvem (Ctrl+S)'
  return 'Sem alterações não salvas'
})

const handleSaveClick = () => {
  if (props.hasUnsavedChanges && syncStatus.value !== 'syncing') {
    emit('save')
  }
}

const goToDocs = () => {
  router.push('/docs')
}

const exportAsTutorial = () => {
  try {
    // Criar objeto com dados do flow
    const tutorialData = {
      id: flowStore.apiConfig.flowId || `tutorial_${Date.now()}`,
      title: prompt('Nome do Tutorial:') || 'Tutorial Sem Nome',
      description: prompt('Descrição do Tutorial:') || '',
      flow: {
        nodes: flowStore.nodes,
        edges: flowStore.edges,
        nodeData: flowStore.nodeData,
        detectedTypes: flowStore.savedDetectedTypes,
        variables: flowStore.globalVariables
      },
      exportedAt: new Date().toISOString()
    }

    // Criar blob com JSON
    const json = JSON.stringify(tutorialData, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    // Criar link de download
    const a = document.createElement('a')
    a.href = url
    a.download = `tutorial-${tutorialData.id}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    console.log('✅ Tutorial exportado com sucesso!')
    alert(`Tutorial exportado! Salve o arquivo "${tutorialData.id}.json" em:\npackages/editor/src/data/tutorials/`)
  } catch (error) {
    console.error('❌ Erro ao exportar tutorial:', error)
    alert('Erro ao exportar tutorial: ' + error.message)
  }
}
</script>

<style scoped>
.glass-header {
  box-shadow:
    0 2px 16px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.glass-dropdown {
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}
</style>