/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paris: {
          navy: '#0c1d39',
          blue: '#1b52ab',
          red: '#e6404f',
          gold: '#bf8c2c',
          cream: '#f6f5f0',
          ink: '#17243a',
        },
      },
      boxShadow: {
        card: '0 18px 50px rgba(12, 29, 57, 0.10)',
      },
    },
  },
  plugins: [],
}
