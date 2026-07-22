/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paris: {
          navy: '#14213d',
          gold: '#c8a951',
          cream: '#f8f4ea',
        },
      },
    },
  },
  plugins: [],
}
