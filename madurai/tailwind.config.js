/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        civic: {
          blue: '#22C55E', // Fresh Green (Primary)
          'blue-dark': '#174C2F', // Forest Light
          'blue-light': '#1DB954',
          green: '#22C55E', // Primary Fresh Green
          'green-dark': '#0F2E1C', // Forest Dark (Deep Background)
          'green-light': '#A3E635', // Lime Highlight
          lime: '#A3E635',
        },
        alert: {
          red: '#E53935',
          amber: '#FFC107',
          purple: '#6C5CE7',
        },
        navy: {
          50: '#F4F8FB',
          100: '#e8f1f8',
          800: '#0d2a45',
          900: '#0B1E33',
          950: '#070f1a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'spin-slow': 'spin 8s linear infinite',
        float: 'float 6s ease-in-out infinite',
        'glow-red': 'glowRed 2s ease-in-out infinite',
        'glow-green': 'glowGreen 2s ease-in-out infinite',
        'count-up': 'countUp 1s ease-out forwards',
        shimmer: 'shimmer 2s linear infinite',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'fade-in-up': 'fadeInUp 0.5s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glowRed: {
          '0%, 100%': { boxShadow: '0 0 5px #E53935, 0 0 10px #E53935' },
          '50%': { boxShadow: '0 0 20px #E53935, 0 0 40px #E53935' },
        },
        glowGreen: {
          '0%, 100%': { boxShadow: '0 0 5px #A3E635, 0 0 10px #A3E635' },
          '50%': { boxShadow: '0 0 20px #A3E635, 0 0 40px #A3E635' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        slideInLeft: {
          from: { transform: 'translateX(-100%)', opacity: 0 },
          to: { transform: 'translateX(0)', opacity: 1 },
        },
        slideInRight: {
          from: { transform: 'translateX(100%)', opacity: 0 },
          to: { transform: 'translateX(0)', opacity: 1 },
        },
        fadeInUp: {
          from: { transform: 'translateY(20px)', opacity: 0 },
          to: { transform: 'translateY(0)', opacity: 1 },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(34, 197, 94, 0.15)',
        'glass-dark': '0 8px 32px rgba(0, 0, 0, 0.6)',
        glow: '0 0 15px rgba(163, 230, 53, 0.5)',
        'glow-green': '0 0 15px rgba(34, 197, 94, 0.5)',
        'glow-red': '0 0 15px rgba(229, 57, 53, 0.5)',
      },
    },
  },
  plugins: [],
};
