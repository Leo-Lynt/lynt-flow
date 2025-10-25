<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useAuth } from '../composables/useAuth.js'

const route = useRoute()
const router = useRouter()
const { resetPassword, loading } = useAuth()

const token = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const message = ref('')
const error = ref('')

onMounted(() => {
  token.value = route.query.token || ''
  if (!token.value) {
    error.value = 'Invalid or missing reset token'
  }
})

async function handleSubmit() {
  error.value = ''
  message.value = ''

  if (!newPassword.value || !confirmPassword.value) {
    error.value = 'Please fill in all fields'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  if (newPassword.value.length < 6) {
    error.value = 'Password must be at least 6 characters long'
    return
  }

  const result = await resetPassword(token.value, newPassword.value)

  if (result.success) {
    message.value = 'Password reset successfully! Redirecting to login...'
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } else {
    error.value = result.error
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
    <div class="max-w-md w-full">
      <!-- Logo/Header -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4">
          <Icon icon="lucide:lock-keyhole" class="w-8 h-8 text-white" />
        </div>
        <h1 class="text-3xl font-bold text-gray-900">Reset Password</h1>
        <p class="text-gray-600 mt-2">Enter your new password below</p>
      </div>

      <!-- Card -->
      <div class="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <!-- Messages -->
        <div v-if="message" class="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center text-sm">
          <Icon icon="lucide:check-circle" class="w-5 h-5 mr-2 flex-shrink-0" />
          <span>{{ message }}</span>
        </div>

        <div v-if="error" class="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center text-sm">
          <Icon icon="lucide:alert-circle" class="w-5 h-5 mr-2 flex-shrink-0" />
          <span>{{ error }}</span>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div>
            <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon icon="lucide:lock" class="w-5 h-5 text-gray-400" />
              </div>
              <input
                id="newPassword"
                v-model="newPassword"
                type="password"
                required
                placeholder="Enter new password"
                class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <p class="mt-1 text-xs text-gray-500">Must be at least 6 characters</p>
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon icon="lucide:lock-keyhole" class="w-5 h-5 text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                v-model="confirmPassword"
                type="password"
                required
                placeholder="Confirm new password"
                class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            type="submit"
            :disabled="loading || !token"
            class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all flex items-center justify-center space-x-2"
          >
            <Icon
              :icon="loading ? 'lucide:loader-2' : 'lucide:check'"
              :class="['w-5 h-5', { 'animate-spin': loading }]"
            />
            <span>{{ loading ? 'Resetting...' : 'Reset Password' }}</span>
          </button>
        </form>

        <!-- Back to login -->
        <div class="mt-6 text-center">
          <router-link
            to="/login"
            class="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center space-x-1"
          >
            <Icon icon="lucide:arrow-left" class="w-4 h-4" />
            <span>Back to login</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
