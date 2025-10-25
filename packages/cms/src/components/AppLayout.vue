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
    <!-- Animated gradient background -->
    <div class="fixed inset-0 bg-gradient-animated -z-10"></div>

    <!-- Subtle animated shapes -->
    <div class="fixed top-20 left-20 w-96 h-96 bg-gradient-to-br from-blue-200/40 to-purple-200/40 rounded-full blur-3xl animate-float-slow -z-10"></div>
    <div class="fixed bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-purple-200/40 to-pink-200/40 rounded-full blur-3xl animate-float-slow animation-delay-2000 -z-10"></div>
    <div class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-200/30 to-blue-200/30 rounded-full blur-3xl animate-float-slow animation-delay-4000 -z-10"></div>

    <!-- Header - Fixed at top -->
    <AppHeader @toggle-sidebar="toggleSidebar" class="fixed top-0 left-0 right-0 z-40" />

    <!-- Main container -->
    <div class="flex flex-1 pt-16 relative">
      <!-- Page content -->
      <main class="flex-1 px-4 sm:px-6 lg:px-8 py-8 lg:pl-80 lg:pr-8 relative z-10">
        <slot />
      </main>

      <!-- Sidebar - Fixed on the right -->
      <AppSidebar
        :open="sidebarOpen"
        @close="sidebarOpen = false"
      />
    </div>
  </div>
</template>

<style scoped>
/* Animated gradient background */
.bg-gradient-animated {
  background: linear-gradient(
    -45deg,
    #f8e8f3,
    #ede8f5,
    #f0f4e8,
    #fef3ed,
    #fef0f0
  );
  background-size: 400% 400%;
  animation: gradient-shift 15s ease infinite;
}

@keyframes gradient-shift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* Floating animation for blobs */
@keyframes float-slow {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -30px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

.animate-float-slow {
  animation: float-slow 20s ease-in-out infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}
</style>