<template>
  <div class="h-14 glass-header backdrop-blur-xl bg-white/30 dark:bg-gray-900/30 shadow-sm border-b border-white/20 dark:border-gray-700/20 flex items-center justify-between px-4 relative z-[100]">
    <div class="flex items-center gap-2">
      <div class="flex items-center gap-3 px-2">
        <img src="/favicon.svg" alt="Lynt Flow" class="w-8 h-8 object-contain" />
        <span class="text-xl font-light text-gray-800 dark:text-gray-200 tracking-wide">Lynt Flow</span>
      </div>
    </div>

    <div class="flex items-center gap-2 flex-1 justify-center">
      <div class="flex items-center gap-1">
        <button
          @click="handleExecuteClick"
          class="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-purple border border-brand-purple rounded-lg text-white text-sm font-semibold cursor-pointer transition-all duration-200 hover:brightness-110 hover:shadow-lg hover:scale-105 active:scale-95 tracking-wide"
        >
          <FlowIcon icon="material-symbols:play-arrow" :size="16" />
          Executar
        </button>
      </div>

      <div class="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-3 opacity-50"></div>

      <div class="flex items-center gap-1">
        <button
          @click="$emit('undo')"
          class="inline-flex items-center gap-1.5 px-2 py-1.5 bg-white/40 dark:bg-gray-800/40 border border-gray-300 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-300 text-sm font-medium cursor-pointer transition-all hover:bg-white/60 dark:hover:bg-gray-800/60 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Desfazer (Ctrl+Z)"
          :disabled="!canUndo"
        >
          <FlowIcon icon="material-symbols:undo" :size="16" />
        </button>
        <button
          @click="$emit('redo')"
          class="inline-flex items-center gap-1.5 px-2 py-1.5 bg-white/40 dark:bg-gray-800/40 border border-gray-300 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-300 text-sm font-medium cursor-pointer transition-all hover:bg-white/60 dark:hover:bg-gray-800/60 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Refazer (Ctrl+Y)"
          :disabled="!canRedo"
        >
          <FlowIcon icon="material-symbols:redo" :size="16" />
        </button>
      </div>

    </div>

    <div class="flex items-center gap-2">
      <!-- Botão de Save Manual -->
      <button
        @click="handleSaveClick"
        :disabled="!hasUnsavedChanges || syncStatus === 'syncing'"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all tracking-wide"
        :class="{
          'bg-brand-purple border border-brand-purple text-white hover:brightness-110 hover:shadow-lg cursor-pointer': hasUnsavedChanges && syncStatus !== 'syncing',
          'bg-white/40 dark:bg-gray-800/40 border border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed opacity-50': !hasUnsavedChanges || syncStatus === 'syncing'
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

      <div class="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-2 opacity-50"></div>


      <!-- Sync Status Indicator -->
      <div
        class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
        :class="{
          'bg-brand-orange/10 dark:bg-brand-orange/20 border border-brand-orange/30': hasUnsavedChanges && syncStatus !== 'syncing',
          'bg-brand-green/10 dark:bg-brand-green/20 border border-brand-green/30': !hasUnsavedChanges && syncStatus === 'synced',
          'bg-brand-purple/10 dark:bg-brand-purple/20 border border-brand-purple/30': syncStatus === 'syncing',
          'bg-brand-red/10 dark:bg-brand-red/20 border border-brand-red/30': syncStatus === 'error',
          'bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700': syncStatus === 'offline'
        }"
        :title="syncTooltip"
      >
        <FlowIcon
          :icon="syncIcon"
          :size="14"
          :class="{
            'text-brand-orange': hasUnsavedChanges && syncStatus !== 'syncing',
            'text-brand-green': !hasUnsavedChanges && syncStatus === 'synced',
            'text-brand-purple animate-spin': syncStatus === 'syncing',
            'text-brand-red': syncStatus === 'error',
            'text-gray-600 dark:text-gray-400': syncStatus === 'offline'
          }"
        />
        <span class="text-xs font-medium tracking-wide" :class="{
          'text-brand-orange': hasUnsavedChanges && syncStatus !== 'syncing',
          'text-brand-green': !hasUnsavedChanges && syncStatus === 'synced',
          'text-brand-purple': syncStatus === 'syncing',
          'text-brand-red': syncStatus === 'error',
          'text-gray-700 dark:text-gray-300': syncStatus === 'offline'
        }">{{ syncText }}</span>
      </div>

      <div
        class="flex items-center gap-1.5 px-3 py-1 bg-white/40 dark:bg-gray-800/40 rounded-2xl border border-gray-300 dark:border-gray-700"
        v-if="executionStatus"
      >
        <div
          class="w-2 h-2 rounded-full"
          :class="{
            'bg-gray-400': !executionStatus,
            'bg-brand-orange animate-pulse': executionStatus === 'running',
            'bg-brand-green': executionStatus === 'success',
            'bg-brand-red': executionStatus === 'error'
          }"
        ></div>
        <span class="text-xs text-gray-700 dark:text-gray-300 font-medium tracking-wide">{{ statusText }}</span>
      </div>

      <button
        @click="goToDocs"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/40 dark:bg-gray-800/40 border border-gray-300 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-300 text-sm font-medium cursor-pointer transition-all hover:bg-white/60 dark:hover:bg-gray-800/60 hover:brightness-110"
        title="Abrir Documentação"
      >
        <FlowIcon icon="material-symbols:help" :size="16" />
        <span>Ajuda</span>
      </button>

      <button
        @click="toggleTheme"
        class="inline-flex items-center gap-1.5 px-2 py-1.5 bg-white/40 dark:bg-gray-800/40 border border-gray-300 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-300 text-sm font-medium cursor-pointer transition-all hover:bg-white/60 dark:hover:bg-gray-800/60 hover:brightness-110"
        :title="`Mudar para modo ${isDark ? 'claro' : 'escuro'}`"
      >
        <FlowIcon :icon="isDark ? 'material-symbols:light-mode' : 'material-symbols:dark-mode'" :size="16" />
      </button>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFlowStore } from '../stores/flowStore'
import { useTheme } from '../composables/useTheme.js'
import FlowIcon from './Icon.vue'

const router = useRouter()

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