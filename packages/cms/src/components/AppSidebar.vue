<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { jwtDecode } from 'jwt-decode'

const props = defineProps({
  open: Boolean
})

const emit = defineEmits(['close'])

const route = useRoute()
const router = useRouter()
const userRole = ref('user')

onMounted(() => {
  // Decodificar token para obter role do usuário
  const token = localStorage.getItem('accessToken')

  if (token) {
    try {
      const decoded = jwtDecode(token)

      userRole.value = decoded.role || 'user'
    } catch (error) {
      userRole.value = 'user'
    }
  } else {
    userRole.value = 'user'
  }
})

const menuItems = [
  {
    name: 'Painel',
    icon: 'lucide:layout-dashboard',
    route: '/dashboard',
    section: 'main'
  },
  {
    name: 'Fluxos',
    icon: 'lucide:workflow',
    route: '/flows',
    section: 'main'
  },
  {
    name: 'Execuções',
    icon: 'lucide:play-circle',
    route: '/executions',
    section: 'main'
  },
  {
    name: 'Agendamentos',
    icon: 'lucide:calendar-clock',
    route: '/schedules',
    section: 'main'
  },
  {
    name: 'Biblioteca Pública',
    icon: 'lucide:globe',
    route: '/library',
    section: 'main'
  },
  {
    name: 'Perfil',
    icon: 'lucide:user-circle',
    route: '/profile',
    section: 'others'
  },
  {
    name: 'Documentação',
    icon: 'lucide:book-open',
    route: '/docs',
    section: 'others'
  }
]

const adminItems = [
  {
    name: 'Usuários',
    icon: 'lucide:users',
    route: '/admin/users',
    requiredRole: 'administrator'
  },
  {
    name: 'Moderação',
    icon: 'lucide:shield',
    route: '/admin/moderation',
    requiredRole: 'moderator'
  }
]

const mainItems = computed(() => menuItems.filter(item => item.section === 'main'))
const otherItems = computed(() => menuItems.filter(item => item.section === 'others'))

const visibleAdminItems = computed(() => {

  if (userRole.value === 'administrator') {
    return adminItems // Admin vê tudo
  } else if (userRole.value === 'moderator') {
    return adminItems.filter(item => item.requiredRole === 'moderator') // Moderador vê só moderação
  }
  return []
})

const showAdminSection = computed(() => {
  const show = userRole.value === 'administrator' || userRole.value === 'moderator'
  return show
})

function isActive(itemRoute) {
  return route.path === itemRoute || route.path.startsWith(itemRoute + '/')
}

function navigateTo(routePath) {
  router.push(routePath)
  emit('close')
}
</script>

<template>
  <!-- Mobile sidebar overlay -->
  <div
    v-show="open"
    class="fixed inset-0 bg-gray-900/50 lg:hidden z-40"
    @click="emit('close')"
  ></div>

  <!-- Sidebar -->
  <div
    :class="[
      'glass-sidebar fixed top-20 bottom-4 left-4 w-64 backdrop-blur-xl bg-white/30 border border-white/20 rounded-lg shadow-lg z-30 transition-transform duration-300 ease-in-out',
      'lg:translate-x-0',
      open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    ]"
  >
    <!-- Close button for mobile -->
    <div class="flex justify-end p-4 lg:hidden">
      <button
        @click="emit('close')"
        class="p-2 rounded text-gray-600 hover:opacity-70 transition-opacity"
      >
        <Icon icon="lucide:x" class="w-5 h-5" />
      </button>
    </div>

    <!-- Sidebar content -->
    <div class="flex flex-col h-full">
      <!-- Navigation -->
      <nav class="flex-1 px-4 pb-4 space-y-8">
        <!-- Main section -->
        <div class="space-y-1">
          <div class="text-xs font-medium text-gray-600 uppercase tracking-wider px-3 py-2 mb-2">
            Menu
          </div>
          <div v-for="item in mainItems" :key="item.name">
            <button
              @click="navigateTo(item.route)"
              :class="[
                'group flex items-center w-full px-3 py-2.5 text-sm font-medium rounded transition-all',
                isActive(item.route)
                  ? 'bg-brand-purple/10 text-brand-purple border-r-2 border-brand-purple'
                  : 'text-gray-700 hover:bg-white/40 hover:brightness-95'
              ]"
            >
              <Icon
                :icon="item.icon"
                :class="[
                  'w-5 h-5 mr-3 flex-shrink-0 transition-colors',
                  isActive(item.route) ? 'text-brand-purple' : 'text-gray-500'
                ]"
              />
              {{ item.name }}
            </button>
          </div>
        </div>

        <!-- Admin section -->
        <div v-if="showAdminSection" class="space-y-1">
          <div class="text-xs font-medium text-brand-pink uppercase tracking-wider px-3 py-2 mb-2">
            Admin
          </div>
          <div v-for="item in visibleAdminItems" :key="item.name">
            <button
              @click="navigateTo(item.route)"
              :class="[
                'group flex items-center w-full px-3 py-2.5 text-sm font-medium rounded transition-all',
                isActive(item.route)
                  ? 'bg-brand-pink/10 text-brand-pink border-r-2 border-brand-pink'
                  : 'text-gray-700 hover:bg-white/40 hover:brightness-95'
              ]"
            >
              <Icon
                :icon="item.icon"
                :class="[
                  'w-5 h-5 mr-3 flex-shrink-0 transition-colors',
                  isActive(item.route) ? 'text-brand-pink' : 'text-gray-500'
                ]"
              />
              {{ item.name }}
            </button>
          </div>
        </div>

        <!-- Others section -->
        <div class="space-y-1">
          <div class="text-xs font-medium text-gray-600 uppercase tracking-wider px-3 py-2 mb-2">
            Outros
          </div>
          <div v-for="item in otherItems" :key="item.name">
            <button
              @click="navigateTo(item.route)"
              :class="[
                'group flex items-center w-full px-3 py-2.5 text-sm font-medium rounded transition-all',
                isActive(item.route)
                  ? 'bg-brand-purple/10 text-brand-purple border-r-2 border-brand-purple'
                  : 'text-gray-700 hover:bg-white/40 hover:brightness-95'
              ]"
            >
              <Icon
                :icon="item.icon"
                :class="[
                  'w-5 h-5 mr-3 flex-shrink-0 transition-colors',
                  isActive(item.route) ? 'text-brand-purple' : 'text-gray-500'
                ]"
              />
              {{ item.name }}
            </button>
          </div>
        </div>
      </nav>
    </div>
  </div>
</template>

<style scoped>
.glass-sidebar {
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}
</style>
