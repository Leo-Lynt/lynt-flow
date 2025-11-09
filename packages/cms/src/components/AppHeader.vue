<script setup>
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import { Icon } from '@iconify/vue'
import { useAuth } from '../composables/useAuth.js'
import { useRouter } from 'vue-router'

const emit = defineEmits(['toggle-sidebar'])

const { user, logout } = useAuth()
const router = useRouter()

const profileDropdownOpen = ref(false)
const dropdownRef = ref(null)

const userInitials = computed(() => {
  if (!user.value?.name) return 'U'
  const names = user.value.name.split(' ')
  return names.length > 1
    ? `${names[0][0]}${names[names.length - 1][0]}`
    : names[0][0]
})

function toggleProfileDropdown(event) {
  event.stopPropagation()
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

// Fechar dropdown ao clicar fora
function handleClickOutside(event) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    profileDropdownOpen.value = false
  }
}

// Adicionar/remover event listener baseado no estado do dropdown
watch(profileDropdownOpen, (isOpen) => {
  if (isOpen) {
    // Usar nextTick para evitar que o click de abertura já feche o dropdown
    nextTick(() => {
      document.addEventListener('click', handleClickOutside)
    })
  } else {
    document.removeEventListener('click', handleClickOutside)
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

</script>

<template>
  <header class="relative px-4 py-3 lg:pl-4 lg:pr-4">
    <div class="relative border bg-[#ffff] shadow-sm border-white/20 rounded-2xl max-w-full">
      <!-- Gradient de fundo sutil -->
      <div class="absolute inset-0 -z-10 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 transition-all duration-700 rounded-2xl overflow-hidden"></div>
      <div class="absolute inset-0 -z-10 bg-white/70 rounded-2xl overflow-hidden"></div>

      <div class="flex items-center justify-between px-4 sm:px-6 h-14 max-w-full relative">
        <!-- Left section -->
        <div class="flex items-center space-x-4">
          <!-- Mobile menu button -->
          <button
            @click="emit('toggle-sidebar')"
            class="lg:hidden p-2 rounded-xl hover:bg-white/50 transition-all duration-200"
          >
            <Icon icon="lucide:menu" class="w-6 h-6 text-gray-700" />
          </button>

          <!-- Logo -->
          <div class="flex items-center space-x-3">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Icon icon="lucide:workflow" class="w-5 h-5 text-white" />
            </div>
            <span class="hidden sm:block text-xl font-light text-gray-900 tracking-wide">
              Lynt <span class="font-normal text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">Flow</span>
            </span>
          </div>
        </div>

        <!-- Right section -->
        <div class="flex items-center">
          <!-- Profile dropdown -->
          <div class="relative" ref="dropdownRef">
            <button
              @click="toggleProfileDropdown"
              class="flex items-center space-x-2 p-2 rounded-xl hover:bg-white/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-md shadow-blue-500/20">
                <span class="text-sm font-medium text-white">{{ userInitials }}</span>
              </div>
              <div class="hidden md:block text-left">
                <p class="text-sm font-medium text-gray-900">{{ user?.name || 'Usuário' }}</p>
              </div>
              <Icon icon="lucide:chevron-down" class="w-4 h-4 text-gray-600" />
            </button>

            <!-- Dropdown menu -->
            <div
              v-show="profileDropdownOpen"
              class="glass-dropdown absolute right-0 mt-2 w-56 backdrop-blur-xl bg-white/70 rounded-2xl shadow-xl border border-white/40 py-2 z-50 overflow-hidden"
            >
              <!-- Brilho sutil -->
              <div class="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 opacity-50 pointer-events-none"></div>

              <div class="px-4 py-3 border-b border-gray-200/30 relative z-10">
                <p class="text-sm font-medium text-gray-900">{{ user?.name }}</p>
                <p class="text-xs text-gray-600 tracking-wide">{{ user?.email }}</p>
              </div>
              <button
                @click="goToProfile"
                class="relative z-10 flex items-center w-full px-4 py-2.5 text-sm text-gray-700 rounded-lg mx-2 hover:bg-white/50 hover:shadow-sm transition-all duration-200"
              >
                <Icon icon="lucide:user" class="w-4 h-4 mr-3 text-gray-500" />
                Perfil
              </button>
              <button
                @click="handleLogout"
                class="relative z-10 flex items-center w-full px-4 py-2.5 text-sm text-gray-700 rounded-lg mx-2 hover:bg-white/50 hover:shadow-sm transition-all duration-200"
              >
                <Icon icon="lucide:log-out" class="w-4 h-4 mr-3 text-gray-500" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>

.glass-dropdown {
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}
</style>
