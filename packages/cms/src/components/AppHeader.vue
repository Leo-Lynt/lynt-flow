<script setup>
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useAuth } from '../composables/useAuth.js'
import { useRouter } from 'vue-router'

const emit = defineEmits(['toggle-sidebar'])

const { user, logout } = useAuth()
const router = useRouter()

const profileDropdownOpen = ref(false)

const userInitials = computed(() => {
  if (!user.value?.name) return 'U'
  const names = user.value.name.split(' ')
  return names.length > 1
    ? `${names[0][0]}${names[names.length - 1][0]}`
    : names[0][0]
})

function toggleProfileDropdown() {
  profileDropdownOpen.value = !profileDropdownOpen.value
}

function goToProfile() {
  router.push('/profile')
  profileDropdownOpen.value = false
}

async function handleLogout() {
  await logout()
  profileDropdownOpen.value = false
}

</script>

<template>
  <header class="glass-header backdrop-blur-xl bg-white/30 shadow-sm border-b border-white/20">
    <div class="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-14">
      <!-- Left section -->
      <div class="flex items-center space-x-4">
        <!-- Mobile menu button -->
        <button
          @click="emit('toggle-sidebar')"
          class="lg:hidden p-2 rounded text-gray-600 hover:opacity-70 transition-opacity"
        >
          <Icon icon="lucide:menu" class="w-6 h-6" />
        </button>

        <!-- Logo -->
        <div class="flex items-center space-x-3">
          <img src="/favicon.svg" alt="Lynt flow" class="w-8 h-8 object-contain" />
          <span class="hidden sm:block text-xl font-light text-gray-800 tracking-wide">Lynt Flow</span>
        </div>
      </div>


      <!-- Right section -->
      <div class="flex items-center">
        <!-- Profile dropdown -->
        <div class="relative">
          <button
            @click="toggleProfileDropdown"
            class="flex items-center space-x-2 p-2 rounded hover:bg-white/40 hover:brightness-95 transition-all focus:outline-none focus:ring-2 focus:ring-brand-purple/30"
          >
            <div class="w-8 h-8 bg-gradient-to-br from-brand-purple to-brand-pink rounded-full flex items-center justify-center shadow-sm">
              <span class="text-sm font-medium text-white">{{ userInitials }}</span>
            </div>
            <div class="hidden md:block text-left">
              <p class="text-sm font-medium text-gray-800">{{ user?.name || 'Usuário' }}</p>
            </div>
            <Icon icon="lucide:chevron-down" class="w-4 h-4 text-gray-600" />
          </button>

          <!-- Dropdown menu -->
          <div
            v-show="profileDropdownOpen"
            class="absolute right-0 mt-2 w-56 backdrop-blur-xl bg-white/30 rounded-lg shadow-lg border border-white/20 py-2 z-50 glass-dropdown"
          >
            <div class="px-4 py-3 border-b border-gray-200/30">
              <p class="text-sm font-medium text-gray-900">{{ user?.name }}</p>
              <p class="text-xs text-gray-600 tracking-wide">{{ user?.email }}</p>
            </div>
            <button
              @click="goToProfile"
              class="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-white/40 hover:brightness-95 transition-all"
            >
              <Icon icon="lucide:user" class="w-4 h-4 mr-3 text-gray-500" />
              Perfil
            </button>
            <button
              @click="handleLogout"
              class="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-white/40 hover:brightness-95 transition-all"
            >
              <Icon icon="lucide:log-out" class="w-4 h-4 mr-3 text-gray-500" />
              Sair
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

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