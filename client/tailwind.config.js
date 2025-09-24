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
        'bg-primary': 'rgb(var(--bg-primary-rgb) / <alpha-value>)',
        'bg-secondary': 'rgb(var(--bg-secondary-rgb) / <alpha-value>)',
        'bg-tertiary': 'rgb(var(--bg-tertiary-rgb) / <alpha-value>)',
        'text-primary': 'rgb(var(--text-primary-rgb) / <alpha-value>)',
        'text-secondary': 'rgb(var(--text-secondary-rgb) / <alpha-value>)',
        'accent-primary': 'rgb(var(--accent-primary-rgb) / <alpha-value>)',
        'accent-primary-hover': 'rgb(var(--accent-primary-hover-rgb) / <alpha-value>)',
        'border-color': 'rgb(var(--border-color-rgb) / <alpha-value>)',
      },
      keyframes: {
        'fade-in-scale': {
            '0%': { opacity: '0', transform: 'scale(0.95)' },
            '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in-scale': 'fade-in-scale 0.2s ease-out forwards',
      },
    },
  },
  plugins: [],
}