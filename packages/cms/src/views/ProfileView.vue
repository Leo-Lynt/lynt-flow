<script setup>
import { ref, onMounted, computed } from 'vue'
import { Icon } from '@iconify/vue'
import AppLayout from '../components/AppLayout.vue'
import BaseCard from '../components/BaseCard.vue'
import PlanManagement from '../components/PlanManagement.vue'
import { useAuth } from '../composables/useAuth.js'
import { useProfileTabs } from '../composables/useProfileTabs.js'

const {
  user,
  loading,
  getProfile,
  updateProfile,
  changePassword,
  sendVerificationEmail,
  getPreferences,
  updatePreferences,
  getProfileStats,
  getActiveSessions,
  revokeSession,
  revokeAllSessions,
  getConnectedAccounts,
  enable2FA,
  verify2FA,
  disable2FA,
  deleteAccount
} = useAuth()

const { activeTab, message, error, tabs, setActiveTab, setMessage, setError } = useProfileTabs()

// Forms
const profileForm = ref({ name: '', email: '' })
const passwordForm = ref({ currentPassword: '', newPassword: '', confirmPassword: '' })
const preferencesForm = ref({
  theme: 'light',
  language: 'pt-BR',
  timezone: 'America/Sao_Paulo',
  emailNotifications: true
})
const deleteForm = ref({ password: '', confirmation: '' })
const twoFactorForm = ref({ password: '', token: '' })

// States
const saving = ref(false)
const stats = ref(null)
const sessions = ref([])
const connectedAccounts = ref(null)
const qrCode = ref(null)
const backupCodes = ref([])
const show2FASetup = ref(false)
const show2FADisable = ref(false)

// Computed
const isEmailVerified = computed(() => user.value?.isVerified || false)
const is2FAEnabled = computed(() => user.value?.twoFactorEnabled || false)

onMounted(async () => {
  // Load profile data first to ensure we have the latest user info
  await getProfile()

  if (user.value) {
    profileForm.value = {
      name: user.value.name || '',
      email: user.value.email || ''
    }
  }

  // Load preferences
  const prefsResult = await getPreferences()
  if (prefsResult.success) {
    preferencesForm.value = { ...prefsResult.data }
  }

  // Load stats
  const statsResult = await getProfileStats()
  if (statsResult.success) {
    stats.value = statsResult.data
  }

  // Load connected accounts
  const accountsResult = await getConnectedAccounts()
  if (accountsResult.success) {
    connectedAccounts.value = accountsResult.data
  }
})

// Profile tab handlers
async function handleUpdateProfile() {
  setError('')
  setMessage('')

  if (!profileForm.value.name || !profileForm.value.email) {
    setError('Please fill in all fields')
    return
  }

  saving.value = true
  const result = await updateProfile(profileForm.value)
  saving.value = false

  if (result.success) {
    setMessage('Profile updated successfully')
  } else {
    setError(result.error)
  }
}

async function handleSendVerification() {
  saving.value = true
  const result = await sendVerificationEmail()
  saving.value = false

  if (result.success) {
    setMessage('Verification email sent successfully')
  } else {
    setError(result.error)
  }
}

// Security tab handlers
async function handleChangePassword() {
  setError('')
  setMessage('')

  if (!passwordForm.value.currentPassword || !passwordForm.value.newPassword || !passwordForm.value.confirmPassword) {
    setError('Please fill in all password fields')
    return
  }

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    setError('New passwords do not match')
    return
  }

  if (passwordForm.value.newPassword.length < 6) {
    setError('New password must be at least 6 characters long')
    return
  }

  saving.value = true
  const result = await changePassword(
    passwordForm.value.currentPassword,
    passwordForm.value.newPassword
  )
  saving.value = false

  if (result.success) {
    setMessage('Password changed successfully')
    passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
  } else {
    setError(result.error)
  }
}

async function handleEnable2FA() {
  if (!twoFactorForm.value.password) {
    setError('Password is required')
    return
  }

  saving.value = true
  const result = await enable2FA(twoFactorForm.value.password)
  saving.value = false

  if (result.success) {
    qrCode.value = result.data.qrCode
    show2FASetup.value = true
    setMessage('Scan the QR code with your authenticator app')
  } else {
    setError(result.error)
  }
}

async function handleVerify2FA() {
  if (!twoFactorForm.value.token) {
    setError('Token is required')
    return
  }

  saving.value = true
  const result = await verify2FA(twoFactorForm.value.token)
  saving.value = false

  if (result.success) {
    if (result.data?.backupCodes) {
      backupCodes.value = result.data.backupCodes
    }
    show2FASetup.value = false
    twoFactorForm.value = { password: '', token: '' }
    setMessage('2FA enabled successfully! Save your backup codes.')

    // Atualizar dados do usuário para refletir que 2FA está habilitado
    await getProfile()
  } else {
    setError(result.error)
  }
}

async function handleDisable2FA() {
  if (!twoFactorForm.value.password || !twoFactorForm.value.token) {
    setError('Password and token are required')
    return
  }

  saving.value = true
  const result = await disable2FA(twoFactorForm.value.password, twoFactorForm.value.token)
  saving.value = false

  if (result.success) {
    show2FADisable.value = false
    twoFactorForm.value = { password: '', token: '' }
    setMessage('2FA disabled successfully')

    // Atualizar dados do usuário para refletir que 2FA está desabilitado
    await getProfile()
  } else {
    setError(result.error)
  }
}

// Preferences tab handlers
async function handleUpdatePreferences() {
  saving.value = true
  const result = await updatePreferences(preferencesForm.value)
  saving.value = false

  if (result.success) {
    setMessage('Preferences updated successfully')
  } else {
    setError(result.error)
  }
}

// Sessions tab handlers
async function loadSessions() {
  const result = await getActiveSessions()
  if (result.success) {
    sessions.value = result.data || []
  }
}

async function handleRevokeSession(sessionId) {
  if (!confirm('Are you sure you want to revoke this session?')) return

  saving.value = true
  const result = await revokeSession(sessionId)
  saving.value = false

  if (result.success) {
    setMessage('Session revoked successfully')
    await loadSessions()
  } else {
    setError(result.error)
  }
}

async function handleRevokeAllSessions() {
  if (!confirm('Are you sure you want to revoke all other sessions? You will remain logged in on this device.')) return

  saving.value = true
  const result = await revokeAllSessions()
  saving.value = false

  if (result.success) {
    setMessage('All sessions revoked successfully')
    await loadSessions()
  } else {
    setError(result.error)
  }
}

// Account tab handlers
async function handleDeleteAccount() {
  if (!deleteForm.value.password || deleteForm.value.confirmation !== 'DELETE') {
    setError('Please enter your password and type DELETE to confirm')
    return
  }

  if (!confirm('⚠️ WARNING: This action is irreversible! All your data will be permanently deleted. Are you absolutely sure?')) return

  saving.value = true
  const result = await deleteAccount(deleteForm.value.password, deleteForm.value.confirmation)
  saving.value = false

  if (!result.success) {
    setError(result.error)
  }
}

function formatDate(date) {
  if (!date) return 'Never'
  return new Date(date).toLocaleString()
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// Watch tab changes to load data
async function onTabChange(tabId) {
  setActiveTab(tabId)

  if (tabId === 'sessions') {
    await loadSessions()
  }
}
</script>

<template>
  <AppLayout>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-semibold text-gray-800 tracking-wide">Configurações de Perfil</h1>
      <p class="text-gray-600 mt-1 tracking-wide">Gerencie suas configurações e preferências de conta</p>
    </div>

    <!-- Messages -->
    <div v-if="message" class="mb-6 bg-green-500/10 border border-green-500/30 text-green-600 px-4 py-3 rounded-lg flex items-center backdrop-blur-sm">
      <Icon icon="lucide:check-circle" class="w-5 h-5 mr-2" />
      {{ message }}
    </div>

    <div v-if="error" class="mb-6 bg-red-500/10 border border-red-500/30 text-red-600 px-4 py-3 rounded-lg flex items-center backdrop-blur-sm">
      <Icon icon="lucide:alert-circle" class="w-5 h-5 mr-2" />
      {{ error }}
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <!-- Sidebar navigation -->
      <div class="lg:col-span-1">
        <nav class="space-y-1">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="onTabChange(tab.id)"
            :class="[
              'w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg text-left transition-all',
              activeTab === tab.id
                ? 'bg-blue-500/10 text-blue-600 border-l-2 border-blue-500'
                : 'text-gray-700 hover:bg-white/50'
            ]"
          >
            <Icon :icon="tab.icon" class="w-5 h-5 mr-3" />
            {{ tab.name }}
          </button>
        </nav>

        <!-- Stats Card -->
        <div v-if="stats" class="mt-6 glass-card backdrop-blur-xl bg-white/70 border border-white/40 shadow-sm rounded-xl p-4">
          <h4 class="text-sm font-semibold text-gray-800 mb-3 tracking-wide">Visão Geral</h4>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Fluxos:</span>
              <span class="font-medium text-gray-900">{{ stats.totalFlows }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Execuções:</span>
              <span class="font-medium text-gray-900">{{ stats.totalExecutions }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Armazenamento:</span>
              <span class="font-medium text-gray-900">{{ Math.round(stats.storageUsedPercentage) }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Main content -->
      <div class="lg:col-span-3">
        <!-- Profile Tab -->
        <div v-if="activeTab === 'profile'">
          <BaseCard title="Profile Information" subtitle="Update your account details">
            <form @submit.prevent="handleUpdateProfile" class="space-y-6">
              <div>
                <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  v-model="profileForm.name"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div class="relative">
                  <input
                    id="email"
                    v-model="profileForm.email"
                    type="email"
                    disabled
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                  <div v-if="isEmailVerified" class="absolute right-3 top-2.5">
                    <Icon icon="lucide:check-circle" class="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <p class="mt-1 text-xs text-gray-500">
                  O email não pode ser alterado por questões de segurança
                </p>
                <div v-if="!isEmailVerified" class="mt-2 flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <span class="text-sm text-yellow-800">Email not verified</span>
                  <button
                    @click="handleSendVerification"
                    type="button"
                    :disabled="saving"
                    class="text-sm text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
                  >
                    Send verification email
                  </button>
                </div>
              </div>

              <div class="flex justify-end">
                <button
                  type="submit"
                  :disabled="saving"
                  class="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-4 py-2.5 rounded-lg transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50 flex items-center space-x-2"
                >
                  <Icon
                    :icon="saving ? 'lucide:loader-2' : 'lucide:save'"
                    :class="['w-4 h-4', { 'animate-spin': saving }]"
                  />
                  <span>{{ saving ? 'Saving...' : 'Save Changes' }}</span>
                </button>
              </div>
            </form>
          </BaseCard>

          <!-- Account Info -->
          <BaseCard v-if="stats" title="Account Information" subtitle="Your account details" class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-gray-600">Account created:</span>
                <p class="font-medium text-gray-900 mt-1">{{ formatDate(stats.accountCreated) }}</p>
              </div>
              <div>
                <span class="text-gray-600">Last login:</span>
                <p class="font-medium text-gray-900 mt-1">{{ formatDate(stats.lastLogin) }}</p>
              </div>
              <div>
                <span class="text-gray-600">Storage used:</span>
                <p class="font-medium text-gray-900 mt-1">
                  {{ formatBytes(stats.storageUsed) }} / {{ formatBytes(stats.storageQuota) }}
                </p>
              </div>
              <div>
                <span class="text-gray-600">Provider:</span>
                <p class="font-medium text-gray-900 mt-1 capitalize">{{ connectedAccounts?.provider || 'Local' }}</p>
              </div>
            </div>
          </BaseCard>
        </div>

        <!-- Security Tab -->
        <div v-if="activeTab === 'security'">
          <!-- Change Password -->
          <BaseCard title="Change Password" subtitle="Update your account password">
            <form @submit.prevent="handleChangePassword" class="space-y-6">
              <div>
                <label for="currentPassword" class="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  id="currentPassword"
                  v-model="passwordForm.currentPassword"
                  type="password"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  id="newPassword"
                  v-model="passwordForm.newPassword"
                  type="password"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p class="mt-1 text-xs text-gray-500">Must be at least 6 characters</p>
              </div>

              <div>
                <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div class="flex justify-end">
                <button
                  type="submit"
                  :disabled="saving"
                  class="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-4 py-2.5 rounded-lg transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50 flex items-center space-x-2"
                >
                  <Icon
                    :icon="saving ? 'lucide:loader-2' : 'lucide:shield-check'"
                    :class="['w-4 h-4', { 'animate-spin': saving }]"
                  />
                  <span>{{ saving ? 'Updating...' : 'Change Password' }}</span>
                </button>
              </div>
            </form>
          </BaseCard>

          <!-- Two-Factor Authentication -->
          <BaseCard title="Two-Factor Authentication (2FA)" subtitle="Add an extra layer of security" class="mt-6">
            <div v-if="!is2FAEnabled && !show2FASetup" class="space-y-4">
              <p class="text-sm text-gray-600">
                Secure your account with two-factor authentication using Google Authenticator or similar apps.
              </p>
              <div>
                <label for="2fa-password" class="block text-sm font-medium text-gray-700 mb-2">
                  Enter your password to enable 2FA
                </label>
                <input
                  id="2fa-password"
                  v-model="twoFactorForm.password"
                  type="password"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                @click="handleEnable2FA"
                :disabled="saving"
                class="bg-brand-purple text-white px-4 py-2 rounded-lg hover:brightness-110 transition-all disabled:opacity-50 flex items-center space-x-2"
              >
                <Icon :icon="saving ? 'lucide:loader-2' : 'lucide:shield-plus'" :class="['w-4 h-4', { 'animate-spin': saving }]" />
                <span>Enable 2FA</span>
              </button>
            </div>

            <div v-if="show2FASetup" class="space-y-4">
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 class="font-medium text-blue-900 mb-2">Step 1: Scan QR Code</h4>
                <p class="text-sm text-blue-800 mb-4">Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)</p>
                <div class="flex justify-center bg-white p-4 rounded-lg">
                  <img :src="qrCode" alt="QR Code" class="w-48 h-48" />
                </div>
              </div>

              <div>
                <h4 class="font-medium text-gray-900 mb-2">Step 2: Enter Verification Code</h4>
                <input
                  v-model="twoFactorForm.token"
                  type="text"
                  placeholder="000000"
                  maxlength="6"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent focus:border-transparent text-center text-2xl tracking-widest"
                />
              </div>

              <div class="flex space-x-3">
                <button
                  @click="handleVerify2FA"
                  :disabled="saving || twoFactorForm.token.length !== 6"
                  class="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-4 py-2.5 rounded-lg transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <Icon :icon="saving ? 'lucide:loader-2' : 'lucide:check'" :class="['w-4 h-4', { 'animate-spin': saving }]" />
                  <span>Verify & Enable</span>
                </button>
                <button
                  @click="show2FASetup = false; twoFactorForm = { password: '', token: '' }"
                  class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>

            <div v-if="is2FAEnabled && !show2FADisable" class="space-y-4">
              <div class="flex items-center space-x-2 text-green-600">
                <Icon icon="lucide:shield-check" class="w-5 h-5" />
                <span class="font-medium">2FA is enabled</span>
              </div>
              <button
                @click="show2FADisable = true"
                class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all shadow-lg shadow-red-500/30 flex items-center space-x-2"
              >
                <Icon icon="lucide:shield-off" class="w-4 h-4" />
                <span>Disable 2FA</span>
              </button>
            </div>

            <div v-if="show2FADisable" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  v-model="twoFactorForm.password"
                  type="password"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">2FA Code</label>
                <input
                  v-model="twoFactorForm.token"
                  type="text"
                  maxlength="6"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div class="flex space-x-3">
                <button
                  @click="handleDisable2FA"
                  :disabled="saving"
                  class="bg-brand-red text-white px-4 py-2 rounded-lg hover:brightness-110 transition-all disabled:opacity-50 flex items-center space-x-2"
                >
                  <Icon :icon="saving ? 'lucide:loader-2' : 'lucide:shield-off'" :class="['w-4 h-4', { 'animate-spin': saving }]" />
                  <span>Disable 2FA</span>
                </button>
                <button
                  @click="show2FADisable = false; twoFactorForm = { password: '', token: '' }"
                  class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>

            <!-- Backup Codes -->
            <div v-if="backupCodes.length > 0" class="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 class="font-medium text-yellow-900 mb-2 flex items-center">
                <Icon icon="lucide:alert-triangle" class="w-5 h-5 mr-2" />
                Save Your Backup Codes
              </h4>
              <p class="text-sm text-yellow-800 mb-3">
                Save these codes in a secure location. You can use them to access your account if you lose your authenticator device.
              </p>
              <div class="grid grid-cols-2 gap-2 bg-white p-3 rounded font-mono text-sm">
                <div v-for="code in backupCodes" :key="code" class="text-gray-900">
                  {{ code }}
                </div>
              </div>
            </div>
          </BaseCard>
        </div>

        <!-- Preferences Tab -->
        <div v-if="activeTab === 'preferences'">
          <BaseCard title="Preferences" subtitle="Customize your experience">
            <form @submit.prevent="handleUpdatePreferences" class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                <select
                  v-model="preferencesForm.theme"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Language</label>
                <select
                  v-model="preferencesForm.language"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en-US">English (US)</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                <input
                  v-model="preferencesForm.timezone"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p class="mt-1 text-xs text-gray-500">e.g., America/Sao_Paulo, America/New_York</p>
              </div>

              <div>
                <label class="flex items-center space-x-3 cursor-pointer">
                  <input
                    v-model="preferencesForm.emailNotifications"
                    type="checkbox"
                    class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:border-transparent"
                  />
                  <span class="text-sm font-medium text-gray-700">Email Notifications</span>
                </label>
                <p class="mt-1 ml-7 text-xs text-gray-500">Receive email notifications about your flows and executions</p>
              </div>

              <div class="flex justify-end">
                <button
                  type="submit"
                  :disabled="saving"
                  class="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-4 py-2.5 rounded-lg transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50 flex items-center space-x-2"
                >
                  <Icon :icon="saving ? 'lucide:loader-2' : 'lucide:save'" :class="['w-4 h-4', { 'animate-spin': saving }]" />
                  <span>{{ saving ? 'Saving...' : 'Save Preferences' }}</span>
                </button>
              </div>
            </form>
          </BaseCard>
        </div>


        <!-- Plan Tab -->
        <div v-if="activeTab === 'plan'">
          <PlanManagement />
        </div>

        <!-- Sessions Tab -->
        <div v-if="activeTab === 'sessions'">
          <BaseCard title="Active Sessions" subtitle="Manage your logged-in devices">
            <div v-if="sessions.length === 0" class="text-center py-8 text-gray-500">
              <Icon icon="lucide:monitor-off" class="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>No active sessions found</p>
            </div>

            <div v-else class="space-y-4">
              <div
                v-for="session in sessions"
                :key="session.id"
                class="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center space-x-2 mb-2">
                      <Icon icon="lucide:monitor" class="w-5 h-5 text-gray-600" />
                      <span class="font-medium text-gray-900">{{ session.device || 'Unknown Device' }}</span>
                    </div>
                    <div class="text-sm text-gray-600 space-y-1">
                      <div class="flex items-center space-x-2">
                        <Icon icon="lucide:map-pin" class="w-4 h-4" />
                        <span>IP: {{ session.ip || 'Unknown' }}</span>
                      </div>
                      <div class="flex items-center space-x-2">
                        <Icon icon="lucide:clock" class="w-4 h-4" />
                        <span>Last activity: {{ formatDate(session.lastActivity) }}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    @click="handleRevokeSession(session.id)"
                    class="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Revoke
                  </button>
                </div>
              </div>

              <div class="pt-4 border-t border-gray-200">
                <button
                  @click="handleRevokeAllSessions"
                  :disabled="saving"
                  class="bg-brand-red text-white px-4 py-2 rounded-lg hover:brightness-110 transition-all disabled:opacity-50 flex items-center space-x-2"
                >
                  <Icon :icon="saving ? 'lucide:loader-2' : 'lucide:log-out'" :class="['w-4 h-4', { 'animate-spin': saving }]" />
                  <span>Revoke All Other Sessions</span>
                </button>
              </div>
            </div>
          </BaseCard>
        </div>

        <!-- Account Tab -->
        <div v-if="activeTab === 'account'">
          <BaseCard title="Delete Account" subtitle="Permanently delete your account and all data">
            <div class="space-y-6">
              <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                <div class="flex items-start">
                  <Icon icon="lucide:alert-triangle" class="w-6 h-6 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div class="text-sm text-red-800">
                    <p class="font-medium mb-2">Warning: This action is irreversible!</p>
                    <ul class="list-disc list-inside space-y-1">
                      <li>All your flows will be permanently deleted</li>
                      <li>All execution history will be lost</li>
                      <li>All schedules will be removed</li>
                      <li>All connected integrations will be disconnected</li>
                      <li>Your account cannot be recovered</li>
                    </ul>
                  </div>
                </div>
              </div>

              <form @submit.prevent="handleDeleteAccount" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Enter your password to confirm
                  </label>
                  <input
                    v-model="deleteForm.password"
                    type="password"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Type <span class="font-mono font-bold text-red-600">DELETE</span> to confirm
                  </label>
                  <input
                    v-model="deleteForm.confirmation"
                    type="text"
                    required
                    placeholder="DELETE"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <button
                  type="submit"
                  :disabled="saving || deleteForm.confirmation !== 'DELETE'"
                  class="w-full bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium"
                >
                  <Icon :icon="saving ? 'lucide:loader-2' : 'lucide:trash-2'" :class="['w-5 h-5', { 'animate-spin': saving }]" />
                  <span>{{ saving ? 'Deleting Account...' : 'Delete My Account Forever' }}</span>
                </button>
              </form>
            </div>
          </BaseCard>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
