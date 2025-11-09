<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import DocsSidebar from '../components/DocsSidebar.vue'
import Icon from '../components/Icon.vue'

const router = useRouter()
const sidebarOpen = ref(false)
const searchQuery = ref('')

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

function goToEditor() {
  router.push('/')
}

function handleSearch() {
  // TODO: Implementar busca
  console.log('Buscar:', searchQuery.value)
}
</script>

<template>
  <div class="h-screen flex flex-col relative overflow-hidden">
    <!-- Background base branco -->
    <div class="fixed inset-0 bg-white -z-10"></div>

    <!-- Background Gradient Orbs (sutis, estáticos) -->
    <div class="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-[#f2f7ff]">
      <div class="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-blue-300/20 rounded-full blur-3xl"></div>
      <div class="absolute top-1/3 left-1/4 w-[450px] h-[450px] bg-cyan-300/15 rounded-full blur-3xl"></div>
      <div class="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-purple-300/10 rounded-full blur-3xl"></div>
    </div>

    <!-- Grid pattern sutil -->
    <div class="fixed inset-0 opacity-[0.02] -z-5 pointer-events-none">
      <div class="absolute inset-0" style="background-image: radial-gradient(circle, #3B82F6 1px, transparent 1px); background-size: 40px 40px;"></div>
    </div>

    <!-- Header - Fixed at top -->
    <header class="relative px-4 py-3 lg:pl-4 lg:pr-4 flex-shrink-0 z-40">
      <div class="relative border bg-[#ffff] shadow-sm border-white/20 rounded-2xl overflow-hidden max-w-full">
        <!-- Gradient de fundo sutil -->
        <div class="absolute inset-0 -z-10 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 transition-all duration-700 rounded-2xl"></div>
        <div class="absolute inset-0 -z-10 bg-white/70 rounded-2xl"></div>

        <div class="flex items-center justify-between px-4 sm:px-6 h-14 max-w-full">
          <!-- Left section -->
          <div class="flex items-center space-x-4">
            <!-- Mobile menu button -->
            <button
              @click="toggleSidebar"
              class="lg:hidden p-2 rounded-xl hover:bg-white/50 transition-all duration-200"
            >
              <Icon icon="material-symbols:menu" class="w-6 h-6 text-gray-700" />
            </button>

            <!-- Logo -->
            <div class="flex items-center space-x-3">
              <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Icon icon="material-symbols:book" class="w-5 h-5 text-white" />
              </div>
              <span class="hidden sm:block text-xl font-light text-gray-900 tracking-wide">
                Lynt <span class="font-normal text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">Flow</span> <span class="text-gray-500 text-base">Docs</span>
              </span>
            </div>
          </div>

          <!-- Right section -->
          <div class="flex items-center gap-4">
            <!-- Search -->
            <div class="relative hidden md:block">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Buscar..."
                class="w-48 lg:w-64 px-4 py-2 pl-10 rounded-xl bg-white border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-900 placeholder-gray-500 text-sm transition-all shadow-sm"
                @keyup.enter="handleSearch"
              />
              <Icon
                icon="material-symbols:search"
                class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              />
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main container -->
    <div class="flex flex-1 relative overflow-hidden">
      <!-- Content Area -->
      <main class="flex-1 px-4 sm:px-6 lg:px-8 py-8 lg:pl-80 lg:pr-8 relative z-10 overflow-y-auto">
        <div class="max-w-4xl mx-auto pb-8">
          <router-view />
        </div>
      </main>

      <!-- Sidebar - Fixed on the left -->
      <DocsSidebar
        :open="sidebarOpen"
        @close="sidebarOpen = false"
      />
    </div>
  </div>
</template>

<style scoped>
/* Estilos do DocsLayout */
</style>
