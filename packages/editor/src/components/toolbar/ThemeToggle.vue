<template>
  <button
    @click="toggleTheme"
    class="inline-flex items-center gap-1.5 px-2 py-1.5 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md text-text-secondary-light dark:text-text-secondary-dark text-sm font-medium cursor-pointer transition-all hover:bg-surface-hover-light dark:hover:bg-surface-hover-dark hover:border-border-hover-light dark:hover:border-border-hover-dark"
    :title="`Switch to ${isDark ? 'light' : 'dark'} mode`"
  >
    <FlowIcon :icon="isDark ? 'material-symbols:light-mode' : 'material-symbols:dark-mode'" :size="16" />
  </button>
</template>

<script setup>
import { useTheme } from '../../composables/useTheme'
import FlowIcon from '../Icon.vue'

const { isDark, toggleTheme } = useTheme()
</script>