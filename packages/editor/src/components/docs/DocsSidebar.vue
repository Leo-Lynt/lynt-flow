<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Icon from '../Icon.vue'

const route = useRoute()
const router = useRouter()

const menuItems = [
  {
    title: 'Início',
    icon: 'material-symbols:home',
    route: '/docs',
  },
  {
    title: 'Primeiros Passos',
    icon: 'material-symbols:rocket-launch',
    route: '/docs/getting-started',
  },
  {
    title: 'Nodes',
    icon: 'material-symbols:extension',
    route: '/docs/nodes',
  },
]

function isActive(itemRoute) {
  return route.path === itemRoute
}

function navigate(itemRoute) {
  router.push(itemRoute)
}
</script>

<template>
  <nav class="docs-sidebar-nav p-4">
    <ul class="space-y-2">
      <li v-for="item in menuItems" :key="item.route">
        <button
          @click="navigate(item.route)"
          :class="[
            'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-left',
            isActive(item.route)
              ? 'bg-primary text-white'
              : 'text-flow-text dark:text-flow-text-dark hover:bg-flow-bg dark:hover:bg-flow-bg-dark'
          ]"
        >
          <Icon :icon="item.icon" class="w-5 h-5" />
          <span class="font-medium">{{ item.title }}</span>
        </button>
      </li>
    </ul>

    <!-- Divider -->
    <div class="my-6 border-t border-flow-border dark:border-flow-border-dark"></div>

    <!-- Categories Section -->
    <div class="space-y-2">
      <h3 class="px-4 text-xs font-semibold text-flow-text-secondary dark:text-flow-text-secondary-dark uppercase tracking-wider">
        Categorias
      </h3>
      <ul class="space-y-1">
        <li>
          <a
            href="#"
            class="flex items-center gap-2 px-4 py-2 text-sm text-flow-text dark:text-flow-text-dark hover:bg-flow-bg dark:hover:bg-flow-bg-dark rounded-lg transition-colors"
          >
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Data & Input</span>
          </a>
        </li>
        <li>
          <a
            href="#"
            class="flex items-center gap-2 px-4 py-2 text-sm text-flow-text dark:text-flow-text-dark hover:bg-flow-bg dark:hover:bg-flow-bg-dark rounded-lg transition-colors"
          >
            <span class="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>Logic & Control</span>
          </a>
        </li>
        <li>
          <a
            href="#"
            class="flex items-center gap-2 px-4 py-2 text-sm text-flow-text dark:text-flow-text-dark hover:bg-flow-bg dark:hover:bg-flow-bg-dark rounded-lg transition-colors"
          >
            <span class="w-2 h-2 rounded-full bg-purple-500"></span>
            <span>Operations</span>
          </a>
        </li>
        <li>
          <a
            href="#"
            class="flex items-center gap-2 px-4 py-2 text-sm text-flow-text dark:text-flow-text-dark hover:bg-flow-bg dark:hover:bg-flow-bg-dark rounded-lg transition-colors"
          >
            <span class="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Data Processing</span>
          </a>
        </li>
      </ul>
    </div>
  </nav>
</template>

<style scoped>
/* Smooth transitions */
button, a {
  @apply transition-all duration-200;
}
</style>
