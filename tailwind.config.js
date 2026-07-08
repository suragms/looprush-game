/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        neon: {
          cyan: '#00f0ff',
          magenta: '#ff2bd6',
          purple: '#9d4edd',
          green: '#39ff14',
          yellow: '#ffe600',
          orange: '#ff6b35',
          red: '#ff3860',
        },
        bg: {
          deep: '#07070f',
          dark: '#0a0a14',
          panel: '#12121f',
        },
      },
      fontFamily: {
        display: ['"Orbitron"', 'system-ui', 'sans-serif'],
        body: ['"Rajdhani"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        neon: '0 0 12px rgba(0,240,255,0.6), 0 0 24px rgba(0,240,255,0.3)',
        'neon-magenta': '0 0 12px rgba(255,43,214,0.6), 0 0 24px rgba(255,43,214,0.3)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 1.6s ease-in-out infinite',
        'float-in': 'floatIn 0.35s ease-out',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        floatIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
