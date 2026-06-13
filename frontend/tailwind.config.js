/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'Helvetica Neue', 'sans-serif'] },
      colors: {
        brand: { DEFAULT: '#000000', light: '#333333' },
        accent: '#E0E0E0',
        muted: '#757575',
      }
    }
  },
  plugins: []
}
