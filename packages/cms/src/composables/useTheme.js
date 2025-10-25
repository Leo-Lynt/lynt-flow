import { ref, computed, watch } from 'vue'

const isDark = ref(false)

// Detect system preference
const systemPrefersDark = () => {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
}

// Initialize theme
const initTheme = () => {
  const stored = localStorage.getItem('flow-forge-theme')
  if (stored) {
    isDark.value = stored === 'dark'
  } else {
    isDark.value = systemPrefersDark()
  }
  applyTheme()
}

// Apply theme to document
const applyTheme = () => {
  const root = document.documentElement
  if (isDark.value) {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

// Watch for theme changes
watch(isDark, () => {
  localStorage.setItem('flow-forge-theme', isDark.value ? 'dark' : 'light')
  applyTheme()
})

// Listen for system theme changes
if (window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const stored = localStorage.getItem('flow-forge-theme')
    if (!stored) {
      isDark.value = e.matches
    }
  })
}

export const useTheme = () => {
  const toggleTheme = () => {
    isDark.value = !isDark.value
  }

  const setTheme = (theme) => {
    isDark.value = theme === 'dark'
  }

  const theme = computed(() => isDark.value ? 'dark' : 'light')

  return {
    isDark,
    theme,
    toggleTheme,
    setTheme,
    initTheme
  }
}