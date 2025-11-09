<script setup>
defineProps({
  title: String,
  subtitle: String,
  padding: {
    type: String,
    default: 'p-6'
  },
  shadow: {
    type: String,
    default: 'shadow-sm'
  }
})
</script>

<template>
  <div :class="['glass-card backdrop-blur-xl bg-white/30 rounded-lg border border-white/20', shadow, padding]">
    <div v-if="title || subtitle" class="mb-4">
      <h3 v-if="title" class="text-lg font-semibold text-gray-900 tracking-wide">{{ title }}</h3>
      <p v-if="subtitle" class="text-sm text-gray-600 mt-1 tracking-wide">{{ subtitle }}</p>
    </div>
    <slot />
  </div>
</template>

<style scoped>
.glass-card {
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}
</style>
