/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["ui-sans-serif","system-ui","Inter","Segoe UI"] },
      colors: {
        'warm-white': '#FAFAF5',
        'cyan-primary': '#00BCD4',
        'cyan-hover': '#00ACC1',
        'cyan-dark': '#0097A7',
        'slate-gray': '#5C6F77',
        'peach-blush': '#FAD4C0',
        'mint-green': '#C8E6C9',
        // Extend existing color palette
        primary: {
          50: '#E0F7FA',
          100: '#B2EBF2',
          200: '#80DEEA',
          300: '#4DD0E1',
          400: '#26C6DA',
          500: '#00BCD4',
          600: '#00ACC1',
          700: '#0097A7',
          800: '#00838F',
          900: '#006064',
        }
      }
    }
  },
  plugins: []
};