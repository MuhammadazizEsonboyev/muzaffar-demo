/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: '#0a0e14', soft: '#11161f', card: '#151b26', hover: '#1b2330' },
        line: '#1f2937',
        brand: { DEFAULT: '#2dd4bf', dim: '#0d9488' },
        ok: '#22c55e', warn: '#f59e0b', crit: '#ef4444', info: '#3b82f6',
        muted: '#64748b', txt: '#e2e8f0',
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
