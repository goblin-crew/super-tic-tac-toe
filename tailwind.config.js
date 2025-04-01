/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          100: 'rgba(23, 25, 35, 0.3)',
          200: 'rgba(23, 25, 35, 0.5)',
          300: 'rgba(23, 25, 35, 0.7)',
          400: 'rgba(23, 25, 35, 0.8)',
          500: 'rgba(23, 25, 35, 0.9)',
          900: '#171923',
        },
        glass: {
          100: 'rgba(255, 255, 255, 0.05)',
          200: 'rgba(255, 255, 255, 0.1)',
          300: 'rgba(255, 255, 255, 0.15)',
        },
        glow: {
          blue: '#4299e1',
          red: '#f56565',
          purple: '#9f7aea',
          green: '#48bb78',
        }
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-sm': '0 2px 8px 0 rgba(0, 0, 0, 0.37)',
        'glass-inner': 'inset 0 0 8px 0 rgba(255, 255, 255, 0.1)',
        'glow-blue': '0 0 15px rgba(66, 153, 225, 0.5)',
        'glow-red': '0 0 15px rgba(245, 101, 101, 0.5)',
        'glow-purple': '0 0 15px rgba(159, 122, 234, 0.5)',
        'glow-green': '0 0 15px rgba(72, 187, 120, 0.5)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}
