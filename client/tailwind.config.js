/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060B18',
          900: '#0F172A',
          800: '#1E293B',
          700: '#2D3A52',
          600: '#3D4F6B',
        },
        accent: {
          cyan: '#22D3EE',
          purple: '#A855F7',
          pink: '#EC4899',
          blue: '#3B82F6',
          green: '#10B981',
          amber: '#F59E0B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(34,211,238,0.25)',
        'glow-purple': '0 0 20px rgba(168,85,247,0.25)',
        'glow-pink': '0 0 20px rgba(236,72,153,0.25)',
        'glass': '0 8px 32px 0 rgba(0,0,0,0.37)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'fadeIn': 'fadeIn 0.5s ease-in-out',
        'slideUp': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
