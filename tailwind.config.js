/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paris: {
          navy: '#123b61',
          blue: '#2367a6',
          red: '#e6404f',
          gold: '#bf8c2c',
          cream: '#eef4f7',
          ink: '#193754',
        },
      },
      boxShadow: {
        card: '0 18px 50px rgba(12, 29, 57, 0.10)',
      },
    },
  },
  plugins: [],
}
