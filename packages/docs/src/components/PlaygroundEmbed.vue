<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  exampleId: {
    type: String,
    default: 'soma-numeros'
  },
  tutorialId: {
    type: String,
    default: null
  },
  height: {
    type: String,
    default: '500px'
  },
  title: {
    type: String,
    default: 'Playground Interativo'
  }
})

// Pegar URL do editor do .env
const editorUrl = import.meta.env.VITE_EDITOR_URL || 'http://localhost:5178/editor'

// Montar URL do playground
const playgroundUrl = computed(() => {
  // Usar tutorialId se fornecido, caso contrário usar exampleId (backward compatibility)
  const id = props.tutorialId || props.exampleId
  return `${editorUrl}/playground?tutorialId=${id}`
})

const isLoading = ref(true)

onMounted(() => {
  // Simular loading
  setTimeout(() => {
    isLoading.value = false
  }, 1000)
})

function openInNewTab() {
  window.open(playgroundUrl.value, '_blank')
}
</script>

<template>
  <div class="playground-embed">
    <!-- Header -->
    <div class="flex items-center justify-between mb-3">
      <h4 class="text-sm font-semibold text-flow-text dark:text-flow-text-dark flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-green-500"></span>
        {{ title }}
      </h4>
      <button
        @click="openInNewTab"
        class="text-xs text-flow-text-secondary dark:text-flow-text-secondary-dark hover:text-primary transition-colors flex items-center gap-1"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
        Abrir em nova aba
      </button>
    </div>

    <!-- Iframe Container -->
    <div
      class="relative rounded-xl border-2 border-flow-border dark:border-flow-border-dark overflow-hidden bg-flow-surface dark:bg-flow-surface-dark"
      :style="{ height }"
    >
      <!-- Loading State -->
      <div
        v-if="isLoading"
        class="absolute inset-0 flex items-center justify-center bg-flow-bg dark:bg-flow-bg-dark z-10"
      >
        <div class="flex flex-col items-center gap-3">
          <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span class="text-sm text-flow-text-secondary dark:text-flow-text-secondary-dark">
            Carregando playground...
          </span>
        </div>
      </div>

      <!-- Iframe -->
      <iframe
        :src="playgroundUrl"
        class="w-full h-full border-0"
        @load="isLoading = false"
        sandbox="allow-scripts allow-same-origin allow-forms"
        loading="lazy"
      ></iframe>
    </div>

    <!-- Info -->
    <div class="mt-2 text-xs text-flow-text-secondary dark:text-flow-text-secondary-dark flex items-center gap-2">
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      Você pode mover os blocos, ajustar valores e clicar em "Executar" para testar
    </div>
  </div>
</template>

<style scoped>
.playground-embed iframe {
  display: block;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
