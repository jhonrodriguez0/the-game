/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#000000',
        surface: '#111111',
        'surface-2': '#1A1A1A',
        border: '#222222',
        accent: '#3B82F6',
        primary: '#FFFFFF',
        muted: '#555555',
        done: '#22C55E',
        missed: '#EF4444',
        rescued: '#F59E0B',
      },
      fontFamily: {
        mono: ['"Space Mono"', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
