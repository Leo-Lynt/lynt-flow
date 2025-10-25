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
        // Background colors with proper semantic naming
        'flow': {
          'bg': '#f9fafb',
          'bg-dark': '#0f172a',
          'surface': '#ffffff',
          'surface-dark': '#1e293b',
          'surface-hover': '#f3f4f6',
          'surface-hover-dark': '#334155',
          'border': '#e5e7eb',
          'border-dark': '#475569',
          'border-hover': '#d1d5db',
          'border-hover-dark': '#64748b',
          'text': '#111827',
          'text-dark': '#f8fafc',
          'text-secondary': '#374151',
          'text-secondary-dark': '#cbd5e1',
          'text-muted': '#6b7280',
          'text-muted-dark': '#94a3af'
        },

        // Custom Brand Theme Colors
        'brand': {
          'pink': '#BF1F6A',      // Pink/Magenta
          'purple': '#58328C',    // Purple
          'green': '#8CBF3F',     // Green/Lime
          'orange': '#F27830',    // Orange
          'red': '#D93030',       // Red
        },

        // Brand colors (mantido para compatibilidade)
        'primary': {
          DEFAULT: '#58328C',     // Usando purple do tema
          hover: '#BF1F6A',       // Usando pink do tema
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#58328C',
          600: '#BF1F6A',
          700: '#BF1F6A',
        },
        'accent': '#8CBF3F',      // Usando green do tema
        'success': '#8CBF3F',     // Usando green do tema
        'warning': '#F27830',     // Usando orange do tema
        'error': '#D93030',       // Usando red do tema

        // Node specific colors
        'node': {
          'connector': '#58328C',   // Purple
          'math': '#BF1F6A',        // Pink
          'processor': '#8CBF3F',   // Green
          'extractor': '#F27830',   // Orange
          'output': '#D93030',      // Red
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'],
        mono: ['Monaco', 'Menlo', 'monospace']
      },
      fontSize: {
        '11': '11px',
        '13': '13px',
      },
      boxShadow: {
        'focus': '0 0 0 3px rgba(99, 102, 241, 0.1)',
        'focus-2': '0 0 0 2px rgba(99, 102, 241, 0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        }
      },
      spacing: {
        '70': '280px',
      }
    },
  },
  plugins: [],
}
