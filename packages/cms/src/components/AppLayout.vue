<script setup>
import { ref } from 'vue'
import AppHeader from './AppHeader.vue'
import AppSidebar from './AppSidebar.vue'

const sidebarOpen = ref(false)

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}
</script>

<template>
  <div class="min-h-screen flex flex-col relative overflow-x-hidden">
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
    <AppHeader @toggle-sidebar="toggleSidebar" class="fixed top-0 left-0 right-0 z-40" />

    <!-- Main container -->
    <div class="flex flex-1 relative overflow-x-hidden">
      <!-- Page content -->
      <main class="flex-1 px-4 sm:px-6 lg:px-8 py-8 lg:pl-72 relative z-10 max-w-full">
        <slot />
      </main>

      <!-- Sidebar - Fixed on the left -->
      <AppSidebar
        :open="sidebarOpen"
        @close="sidebarOpen = false"
      />
    </div>
  </div>
</template>

