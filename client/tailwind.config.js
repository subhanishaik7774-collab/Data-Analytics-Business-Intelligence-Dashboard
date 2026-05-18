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
          bg: '#0B0F19',        // Deep Space Obsidian
          card: 'rgba(17, 24, 39, 0.7)', // Translucent Glassmorphic Dark
          border: 'rgba(255, 255, 255, 0.08)',
          text: '#F3F4F6'
        },
        brand: {
          primary: '#6366F1',   // Indigo
          secondary: '#3B82F6', // Ocean Blue
          accent: '#10B981',    // Emerald
          warning: '#F59E0B',   // Amber
          danger: '#EF4444'     // Rose
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-glow': '0 0 20px 0 rgba(99, 102, 241, 0.15)',
        'emerald-glow': '0 0 20px 0 rgba(16, 185, 129, 0.15)',
        'rose-glow': '0 0 20px 0 rgba(239, 68, 68, 0.15)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-subtle': 'pulseSubtle 3s infinite ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.02)' },
        }
      }
    },
  },
  plugins: [],
}
