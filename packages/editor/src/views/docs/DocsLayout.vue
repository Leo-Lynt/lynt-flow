<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import DocsSidebar from '../../components/docs/DocsSidebar.vue'
import Icon from '../../components/Icon.vue'

const router = useRouter()
const searchQuery = ref('')

function goToEditor() {
  router.push('/')
}

function handleSearch() {
  // TODO: Implementar busca
  console.log('Buscar:', searchQuery.value)
}
</script>

<template>
  <div class="docs-layout h-screen flex flex-col bg-flow-bg dark:bg-flow-bg-dark">
    <!-- Header -->
    <header class="docs-header flex items-center justify-between px-6 py-4 border-b border-flow-border dark:border-flow-border-dark bg-flow-surface dark:bg-flow-surface-dark">
      <div class="flex items-center gap-4">
        <h1 class="text-2xl font-bold text-flow-text dark:text-flow-text-dark">
          Lynt Flow Docs
        </h1>
      </div>

      <div class="flex items-center gap-4">
        <!-- Search -->
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar na documentação..."
            class="w-64 px-4 py-2 pl-10 rounded-lg bg-flow-bg dark:bg-flow-bg-dark border border-flow-border dark:border-flow-border-dark focus:border-primary focus:ring-1 focus:ring-primary text-flow-text dark:text-flow-text-dark placeholder-flow-text-secondary dark:placeholder-flow-text-secondary-dark"
            @keyup.enter="handleSearch"
          />
          <Icon
            icon="material-symbols:search"
            class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-flow-text-secondary dark:text-flow-text-secondary-dark"
          />
        </div>

        <!-- Back to Editor Button -->
        <button
          @click="goToEditor"
          class="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white transition-colors"
        >
          <Icon icon="material-symbols:arrow-back" class="w-5 h-5" />
          <span>Voltar ao Editor</span>
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <div class="docs-content flex flex-1 overflow-hidden">
      <!-- Sidebar -->
      <aside class="docs-sidebar w-64 border-r border-flow-border dark:border-flow-border-dark bg-flow-surface dark:bg-flow-surface-dark overflow-y-auto">
        <DocsSidebar />
      </aside>

      <!-- Content Area -->
      <main class="docs-main flex-1 overflow-y-auto p-8">
        <div class="max-w-4xl mx-auto">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar for docs sidebar */
.docs-sidebar::-webkit-scrollbar {
  width: 6px;
}

.docs-sidebar::-webkit-scrollbar-track {
  @apply bg-flow-surface dark:bg-flow-surface-dark;
}

.docs-sidebar::-webkit-scrollbar-thumb {
  @apply bg-flow-border dark:bg-flow-border-dark rounded-sm;
}

.docs-sidebar::-webkit-scrollbar-thumb:hover {
  @apply bg-flow-border-hover dark:bg-flow-border-hover-dark;
}
</style>
