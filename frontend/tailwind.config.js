/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#073ca5',
          yellow: '#ffbc00',
          purple: '#891a61',
          orange: '#ff5b00',
          red: '#cc0530',
        }
      }
    },
  },
  plugins: [],
};
