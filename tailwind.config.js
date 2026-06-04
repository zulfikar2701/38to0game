/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'treble-bg': '#0B0F19',
        'treble-surface': '#1F2937',
        'treble-gold': '#FFD700',
        'treble-gk': '#A855F7',
        'treble-def': '#3B82F6',
        'treble-mid': '#22C55E',
        'treble-fwd': '#EF4444',
      },
    },
  },
  plugins: [],
}

