/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { navy: { 800: '#16213e', 900: '#0f172a' }, brand: { 50: '#f5f3ff', 100: '#ede9fe', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9' } },
      fontFamily: { sans: ['Inter', 'system-ui', 'Segoe UI', 'sans-serif'] }
    }
  },
  plugins: []
};
