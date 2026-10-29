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
        dark: {
          bg: '#080c14',       // Deep sleek terminal black
          surface: '#0d131f',  // Card background
          card: '#121927',     // Elevated card
          border: '#1e293b',   // Border lines
          muted: '#64748b',    // Subdued text
        },
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        profit: {
          glow: 'rgba(16, 185, 129, 0.15)',
          light: '#064e3b',
          DEFAULT: '#10b981',
          neon: '#00e676',
          dark: '#059669',
        },
        loss: {
          glow: 'rgba(239, 68, 68, 0.15)',
          light: '#7f1d1d',
          DEFAULT: '#ef4444',
          neon: '#ff3b30',
          dark: '#dc2626',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        handwriting: ['Caveat', 'Patrick Hand', 'Comic Sans MS', 'cursive'],
        mono: ['JetBrains Mono', 'Fira Code', 'Roboto Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
