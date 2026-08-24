/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0B0F19',
        surface: '#111827',
        'surface-card': '#1E293B',
        'surface-border': '#334155',
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1'
        },
        risk: {
          info: '#38bdf8',
          low: '#22c55e',
          elevated: '#eab308',
          high: '#f97316',
          critical: '#ef4444'
        }
      }
    },
  },
  plugins: [],
}
