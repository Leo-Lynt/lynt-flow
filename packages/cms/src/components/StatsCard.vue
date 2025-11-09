<script setup>
import { computed } from 'vue'
import { Icon } from '@iconify/vue'

const props = defineProps({
  title: String,
  value: [String, Number],
  change: Number,
  changeType: {
    type: String,
    default: 'percentage',
    validator: (value) => ['percentage', 'absolute'].includes(value)
  },
  subtitle: String,
  icon: String,
  color: {
    type: String,
    default: 'blue',
    validator: (value) => ['blue', 'green', 'red', 'yellow', 'purple', 'indigo'].includes(value)
  },
  actionText: String,
  actionHref: String
})

const emit = defineEmits(['action-click'])

const isPositive = computed(() => props.change > 0)
const isNegative = computed(() => props.change < 0)

const changeText = computed(() => {
  if (!props.change) return ''

  const prefix = isPositive.value ? '+' : ''
  const suffix = props.changeType === 'percentage' ? '%' : ''

  return `${prefix}${props.change}${suffix}`
})

const gradientClasses = computed(() => {
  const gradients = {
    blue: 'from-purple-500 to-pink-500',
    green: 'from-green-500 to-emerald-500',
    red: 'from-red-500 to-orange-500',
    yellow: 'from-orange-500 to-yellow-500',
    purple: 'from-purple-500 to-pink-500',
    indigo: 'from-indigo-500 to-purple-500'
  }
  return gradients[props.color] || gradients.blue
})

const shadowClasses = computed(() => {
  const shadows = {
    blue: 'shadow-purple-500/30',
    green: 'shadow-green-500/30',
    red: 'shadow-red-500/30',
    yellow: 'shadow-orange-500/30',
    purple: 'shadow-purple-500/30',
    indigo: 'shadow-indigo-500/30'
  }
  return shadows[props.color] || shadows.blue
})

function handleActionClick() {
  if (props.actionHref) {
    window.open(props.actionHref, '_blank')
  } else {
    emit('action-click')
  }
}
</script>

<template>
  <div class="glass-card relative bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-xl shadow-gray-900/5 transition-all duration-500 hover:shadow-2xl hover:shadow-gray-900/10 hover:-translate-y-2 h-full overflow-hidden group">
    <!-- Brilho no hover -->
    <div class="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

    <div class="relative z-10">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <p class="text-xs font-medium text-gray-600 uppercase tracking-wider">{{ title }}</p>
        </div>

        <!-- Icon container com gradiente -->
        <div
          v-if="icon"
          :class="[
            'inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br',
            gradientClasses,
            'group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg',
            shadowClasses
          ]"
        >
          <Icon :icon="icon" class="w-7 h-7 text-white" />
        </div>
      </div>

      <div class="mt-4">
        <div class="flex items-baseline">
          <p class="text-3xl font-semibold text-gray-900">{{ value }}</p>
          <p
            v-if="change !== undefined"
            :class="[
              'ml-2 flex items-baseline text-sm font-medium',
              isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-500'
            ]"
          >
            <Icon
              v-if="isPositive"
              icon="lucide:trending-up"
              class="self-center flex-shrink-0 h-4 w-4 mr-1"
            />
            <Icon
              v-else-if="isNegative"
              icon="lucide:trending-down"
              class="self-center flex-shrink-0 h-4 w-4 mr-1"
            />
            {{ changeText }}
          </p>
        </div>

        <p v-if="subtitle" class="mt-2 text-sm text-gray-600 leading-relaxed">{{ subtitle }}</p>
      </div>
    </div>

    <!-- Action button -->
    <div v-if="actionText" class="relative z-10 mt-6 pt-4 border-t border-gray-200/30">
      <button
        @click="handleActionClick"
        class="group/btn inline-flex items-center text-sm font-semibold text-purple-600 hover:text-purple-700 transition-all duration-200"
      >
        {{ actionText }}
        <Icon icon="lucide:arrow-right" class="ml-1.5 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
      </button>
    </div>

    <!-- Corner decoration -->
    <div :class="[
      'absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br',
      gradientClasses,
      'opacity-5 rounded-full blur-2xl group-hover:opacity-15 transition-opacity duration-500'
    ]"></div>
  </div>
</template>

<style scoped>
.glass-card {
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}
</style>
