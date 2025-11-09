/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb',
          hover: '#1d4ed8'
        },
        // Custom Brand Theme Colors (matching CMS)
        'brand': {
          'pink': '#BF1F6A',      // Pink/Magenta
          'purple': '#58328C',    // Purple
          'green': '#8CBF3F',     // Green/Lime
          'orange': '#F27830',    // Orange
          'red': '#D93030',       // Red
        },
        'flow-bg': '#ffffff',
        'flow-bg-dark': '#0f172a',
        'flow-surface': '#f8fafc',
        'flow-surface-dark': '#1e293b',
        'flow-border': '#e2e8f0',
        'flow-border-dark': '#334155',
        'flow-text': '#0f172a',
        'flow-text-dark': '#f1f5f9',
        'flow-text-secondary': '#64748b',
        'flow-text-secondary-dark': '#94a3b8'
      }
    },
  },
  plugins: [],
}
