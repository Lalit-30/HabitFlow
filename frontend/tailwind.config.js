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
        app: {
          bg: '#0B0F14',
          surface: '#111820',
          elevated: '#17212B',
          border: '#26313C',
          text: '#F1F5F9',
          secondary: '#A8B3C2',
          muted: '#718096',
          accent: '#4F7CFF',
          'accent-hover': '#4169E1',
          success: '#3FB950',
          warning: '#D29922',
          danger: '#F85149',
        },
        brand: {
          50: '#F1F5F9',
          100: '#A8B3C2',
          500: '#4F7CFF',
          600: '#4169E1',
          700: '#3859C7',
        },
        slate: {
          850: '#17212B',
          900: '#111820',
          950: '#0B0F14',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
