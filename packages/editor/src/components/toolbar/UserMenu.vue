<template>
  <div class="relative" ref="userMenuRef">
    <button
      @click="toggleMenu"
      class="flex items-center gap-1 py-1 px-2 pr-2 bg-transparent border-none rounded-md cursor-pointer transition-colors text-text-muted-light dark:text-text-muted-dark hover:bg-surface-hover-light dark:hover:bg-surface-hover-dark"
    >
      <div class="w-7 h-7 flex items-center justify-center bg-primary text-white rounded-md text-xs font-semibold">
        <FlowIcon icon="material-symbols:person" :size="14" />
      </div>
      <FlowIcon
        icon="material-symbols:keyboard-arrow-down"
        :size="12"
        :class="{ 'rotate-180': showMenu }"
        class="transition-transform duration-200"
      />
    </button>

    <!-- Dropdown -->
    <div
      v-if="showMenu"
      class="absolute right-0 top-full mt-2 w-48 bg-flow-surface dark:bg-flow-surface-dark border border-flow-border dark:border-flow-border-dark rounded-lg shadow-lg backdrop-blur-sm z-50 py-1"
    >
      <div class="px-3 py-2 border-b border-flow-border dark:border-flow-border-dark">
        <div class="text-xs text-flow-text-muted dark:text-flow-text-muted-dark">
          <div v-if="isAuthenticated">
            Flow ID: {{ flowId }}
          </div>
          <div v-else>Not authenticated</div>
        </div>
      </div>

      <button
        v-if="isAuthenticated"
        @click="handleLogout"
        class="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
      >
        <FlowIcon icon="material-symbols:logout" :size="16" />
        Clear Credentials
      </button>

      <button
        @click="showMenu = false"
        class="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-flow-text-secondary dark:text-flow-text-secondary-dark hover:bg-flow-surface-hover dark:hover:bg-flow-surface-hover-dark transition-colors"
      >
        <FlowIcon icon="material-symbols:close" :size="16" />
        Close
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import FlowIcon from '../Icon.vue'

const props = defineProps({
  isAuthenticated: {
    type: Boolean,
    default: false
  },
  flowId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['logout'])

const showMenu = ref(false)
const userMenuRef = ref(null)

const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

const handleLogout = () => {
  if (confirm('Are you sure you want to clear your credentials? You will need to reload with a new token to continue.')) {
    emit('logout')
    showMenu.value = false
    alert('Credentials cleared. Please reload the page with a valid token to continue.')
  }
}

const handleClickOutside = (event) => {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target)) {
    showMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>