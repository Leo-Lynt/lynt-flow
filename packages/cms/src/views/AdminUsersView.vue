<script setup>
import { ref, onMounted, computed } from 'vue'
import { Icon } from '@iconify/vue'
import AppLayout from '../components/AppLayout.vue'
import { useAdmin } from '../composables/useAdmin.js'

const {
  listUsers,
  getUserStats,
  updateUserRole,
  toggleUserStatus,
  toggleVerifiedCreator,
  updateUserPlan,
  loading
} = useAdmin()

const users = ref([])
const stats = ref(null)
const currentPage = ref(1)
const totalPages = ref(1)
const searchQuery = ref('')
const roleFilter = ref('all')

const showEditModal = ref(false)
const selectedUser = ref(null)
const editForm = ref({
  role: '',
  isActive: true,
  currentPlanId: 'free'
})

onMounted(async () => {
  await loadStats()
  await loadUsers()
})

async function loadStats() {
  const result = await getUserStats()
  if (result.success) {
    stats.value = result.data
  }
}

async function loadUsers() {
  const filters = {
    page: currentPage.value,
    limit: 20,
    role: roleFilter.value !== 'all' ? roleFilter.value : undefined,
    search: searchQuery.value || undefined
  }

  const result = await listUsers(filters)
  if (result.success) {
    users.value = result.data.users
    totalPages.value = result.data.pagination.pages
  }
}

function handleSearch() {
  currentPage.value = 1
  loadUsers()
}

function handleRoleFilterChange() {
  currentPage.value = 1
  loadUsers()
}

function openEditModal(user) {
  selectedUser.value = user
  editForm.value = {
    role: user.role,
    isActive: user.isActive,
    currentPlanId: user.currentPlanId || 'free'
  }
  showEditModal.value = true
}

async function handleSaveUser() {
  if (!selectedUser.value) return

  const userId = selectedUser.value._id

  // Atualizar role se mudou
  if (editForm.value.role !== selectedUser.value.role) {
    const result = await updateUserRole(userId, editForm.value.role)
    if (!result.success) {
      alert('Erro ao atualizar role: ' + result.error)
      return
    }
  }

  // Atualizar status se mudou
  if (editForm.value.isActive !== selectedUser.value.isActive) {
    const result = await toggleUserStatus(userId, editForm.value.isActive)
    if (!result.success) {
      alert('Erro ao atualizar status: ' + result.error)
      return
    }
  }

  // Atualizar plano se mudou
  if (editForm.value.currentPlanId !== (selectedUser.value.currentPlanId || 'free')) {
    const result = await updateUserPlan(userId, editForm.value.currentPlanId)
    if (!result.success) {
      alert('Erro ao atualizar plano: ' + result.error)
      return
    }
  }

  showEditModal.value = false
  await loadUsers()
  await loadStats()
}

async function handleToggleVerified(user) {
  const newStatus = !user.publicProfile?.isVerifiedCreator
  const result = await toggleVerifiedCreator(user._id, newStatus)

  if (result.success) {
    await loadUsers()
  } else {
    alert('Erro: ' + result.error)
  }
}

function getRoleBadge(role) {
  const badges = {
    user: { color: 'bg-gray-100 text-gray-700 border border-gray-300', label: 'Usuário' },
    moderator: { color: 'bg-cyan-500/10 text-cyan-700 border border-cyan-500/30', label: 'Moderador' },
    administrator: { color: 'bg-orange-500/10 text-orange-700 border border-orange-500/30', label: 'Administrador' }
  }
  return badges[role] || badges.user
}

function getPlanBadge(planId) {
  const badges = {
    free: { color: 'bg-gray-100 text-gray-700 border border-gray-300', label: 'FREE' },
    starter: { color: 'bg-blue-100 text-blue-700 border border-blue-300', label: 'STARTER' },
    pro: { color: 'bg-purple-100 text-purple-700 border border-purple-300', label: 'PRO' }
  }
  return badges[planId] || badges.free
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    loadUsers()
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
    loadUsers()
  }
}
</script>

<template>
  <AppLayout>
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-semibold text-gray-800 mb-2 tracking-wide">Gerenciamento de Usuários</h1>
        <p class="text-gray-600 tracking-wide">Gerencie usuários, roles e permissões</p>
      </div>

      <!-- Stats Cards -->
      <div v-if="stats" class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="glass-card backdrop-blur-xl bg-white/70 rounded-xl border border-white/40 shadow-sm p-6 hover:bg-white/80 transition-all">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700 tracking-wide">Total de Usuários</span>
            <Icon icon="lucide:users" class="w-5 h-5 text-blue-600" />
          </div>
          <p class="text-3xl font-bold text-gray-900">{{ stats.totalUsers }}</p>
        </div>

        <div class="glass-card backdrop-blur-xl bg-white/70 rounded-xl border border-white/40 shadow-sm p-6 hover:bg-white/80 transition-all">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700 tracking-wide">Usuários Ativos</span>
            <Icon icon="lucide:check-circle" class="w-5 h-5 text-green-600" />
          </div>
          <p class="text-3xl font-bold text-gray-900">{{ stats.activeUsers }}</p>
        </div>

        <div class="glass-card backdrop-blur-xl bg-white/70 rounded-xl border border-white/40 shadow-sm p-6 hover:bg-white/80 transition-all">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700 tracking-wide">Moderadores</span>
            <Icon icon="lucide:shield" class="w-5 h-5 text-cyan-600" />
          </div>
          <p class="text-3xl font-bold text-gray-900">{{ stats.roleStats.moderator }}</p>
        </div>

        <div class="glass-card backdrop-blur-xl bg-white/70 rounded-xl border border-white/40 shadow-sm p-6 hover:bg-white/80 transition-all">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700 tracking-wide">Administradores</span>
            <Icon icon="lucide:crown" class="w-5 h-5 text-orange-600" />
          </div>
          <p class="text-3xl font-bold text-gray-900">{{ stats.roleStats.administrator }}</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="glass-card backdrop-blur-xl bg-white/70 rounded-xl border border-white/40 shadow-sm p-4 mb-6">
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1">
            <div class="relative">
              <Icon icon="lucide:search" class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                v-model="searchQuery"
                @keyup.enter="handleSearch"
                type="text"
                placeholder="Buscar por nome ou email..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            v-model="roleFilter"
            @change="handleRoleFilterChange"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os roles</option>
            <option value="user">Usuários</option>
            <option value="moderator">Moderadores</option>
            <option value="administrator">Administradores</option>
          </select>
          <button
            @click="handleSearch"
            class="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 flex items-center gap-2"
          >
            <Icon icon="lucide:search" class="w-5 h-5" />
            Buscar
          </button>
        </div>
      </div>

      <!-- Users Table -->
      <div class="glass-card backdrop-blur-xl bg-white/70 rounded-xl border border-white/40 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plano
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Criado em
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="loading">
                <td colspan="6" class="px-6 py-12 text-center">
                  <Icon icon="lucide:loader-2" class="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                </td>
              </tr>
              <tr v-else-if="users.length === 0">
                <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                  Nenhum usuário encontrado
                </td>
              </tr>
              <tr v-else v-for="user in users" :key="user._id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span class="text-blue-600 font-semibold">{{ user.name.charAt(0).toUpperCase() }}</span>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900 flex items-center gap-2">
                        {{ user.name }}
                        <Icon
                          v-if="user.publicProfile?.isVerifiedCreator"
                          icon="lucide:badge-check"
                          class="w-4 h-4 text-blue-500"
                          title="Criador Verificado"
                        />
                      </div>
                      <div class="text-sm text-gray-500">{{ user.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="['px-2 py-1 text-xs font-medium rounded-full', getRoleBadge(user.role).color]">
                    {{ getRoleBadge(user.role).label }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="['px-2 py-1 text-xs font-medium rounded-full', getPlanBadge(user.currentPlanId || 'free').color]">
                    {{ getPlanBadge(user.currentPlanId || 'free').label }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="[
                      'px-2 py-1 text-xs font-medium rounded-full',
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    ]"
                  >
                    {{ user.isActive ? 'Ativo' : 'Inativo' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(user.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    @click="openEditModal(user)"
                    class="text-blue-600 hover:text-blue-900 mr-4"
                    title="Editar usuário"
                  >
                    <Icon icon="lucide:edit" class="w-5 h-5" />
                  </button>
                  <button
                    @click="handleToggleVerified(user)"
                    class="text-purple-600 hover:text-purple-900"
                    :title="user.publicProfile?.isVerifiedCreator ? 'Remover verificação' : 'Verificar criador'"
                  >
                    <Icon icon="lucide:badge-check" class="w-5 h-5" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div class="text-sm text-gray-700">
            Página {{ currentPage }} de {{ totalPages }}
          </div>
          <div class="flex gap-2">
            <button
              @click="prevPage"
              :disabled="currentPage === 1"
              class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próxima
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit User Modal -->
    <div v-if="showEditModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" @click="showEditModal = false"></div>

        <div class="relative inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform glass-card backdrop-blur-xl bg-white/90 border border-white/40 shadow-xl rounded-2xl">
          <div class="flex items-start justify-between mb-6">
            <div>
              <h3 class="text-xl font-bold text-gray-900">Editar Usuário</h3>
              <p class="text-sm text-gray-600 mt-1">{{ selectedUser?.name }}</p>
            </div>
            <button @click="showEditModal = false" class="text-gray-400 hover:text-gray-600">
              <Icon icon="lucide:x" class="w-6 h-6" />
            </button>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                v-model="editForm.role"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="user">Usuário</option>
                <option value="moderator">Moderador</option>
                <option value="administrator">Administrador</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Plano</label>
              <select
                v-model="editForm.currentPlanId"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="free">FREE</option>
                <option value="starter">STARTER (R$ 35,90/mês)</option>
                <option value="pro">PRO (R$ 130/mês)</option>
              </select>
              <p class="text-xs text-gray-500 mt-1">
                Alterar o plano atualiza automaticamente os limites do usuário
              </p>
            </div>

            <div>
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  v-model="editForm.isActive"
                  class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:border-transparent"
                />
                <span class="text-sm font-medium text-gray-700">Usuário ativo</span>
              </label>
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              @click="showEditModal = false"
              class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              @click="handleSaveUser"
              :disabled="loading"
              class="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50 flex items-center gap-2"
            >
              <Icon :icon="loading ? 'lucide:loader-2' : 'lucide:save'" :class="['w-4 h-4', { 'animate-spin': loading }]" />
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.glass-card {
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}
</style>
