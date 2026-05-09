/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0F172A',
        surface: '#1E293B',
        border: '#334155',
        accent: '#3B82F6',
        primary: '#F8FAFC',
        muted: '#64748B',
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
