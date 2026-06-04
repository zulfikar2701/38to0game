/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        '38-bg': '#0A0E17',
        '38-surface': '#111827',
        '38-border': '#1F2937',
        '38-muted': '#6B7280',
        '38-text': '#E5E7EB',
        '38-accent': '#E5E7EB',
        '38-gold': '#D4AF37',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
