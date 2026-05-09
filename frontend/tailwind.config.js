/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tg: {
          bg: 'var(--tg-theme-bg-color, #ffffff)',
          secondary: 'var(--tg-theme-secondary-bg-color, #f3f4f6)',
          text: 'var(--tg-theme-text-color, #111827)',
          hint: 'var(--tg-theme-hint-color, #6b7280)',
          button: 'var(--tg-theme-button-color, #3b82f6)',
          buttonText: 'var(--tg-theme-button-text-color, #ffffff)',
        }
      },
      padding: {
        'safe': 'env(safe-area-inset-bottom)',
      },
    },
  },
  plugins: [],
}