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

const colorClasses = computed(() => {
  const colors = {
    blue: 'bg-brand-purple/10 text-brand-purple',
    green: 'bg-brand-green/10 text-brand-green',
    red: 'bg-brand-red/10 text-brand-red',
    yellow: 'bg-brand-orange/10 text-brand-orange',
    purple: 'bg-brand-pink/10 text-brand-pink',
    indigo: 'bg-brand-purple/10 text-brand-purple'
  }
  return colors[props.color] || colors.blue
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
  <div class="glass-card backdrop-blur-xl bg-white/30 rounded-lg border border-white/20 shadow-sm p-6">
    <div class="flex items-center justify-between">
      <div class="flex-1">
        <div class="flex items-center justify-between">
          <p class="text-xs font-medium text-gray-600 uppercase tracking-wider">{{ title }}</p>
          <div v-if="icon" :class="['w-10 h-10 rounded flex items-center justify-center backdrop-blur-sm', colorClasses]">
            <Icon :icon="icon" class="w-5 h-5" />
          </div>
        </div>

        <div class="mt-3">
          <div class="flex items-baseline">
            <p class="text-2xl font-semibold text-gray-900">{{ value }}</p>
            <p
              v-if="change !== undefined"
              :class="[
                'ml-2 flex items-baseline text-sm font-medium',
                isPositive ? 'text-brand-green' : isNegative ? 'text-brand-red' : 'text-gray-500'
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

          <p v-if="subtitle" class="mt-1.5 text-xs text-gray-600 tracking-wide">{{ subtitle }}</p>
        </div>
      </div>
    </div>

    <div v-if="actionText" class="mt-4 pt-4 border-t border-gray-200/30">
      <button
        @click="handleActionClick"
        class="text-sm font-medium text-brand-purple hover:text-brand-purple/80 transition-colors flex items-center"
      >
        {{ actionText }}
        <Icon icon="lucide:arrow-right" class="ml-1 w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.glass-card {
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}
</style>