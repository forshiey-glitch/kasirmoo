/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        chinese: {
          red: '#C8102E',
          darkred: '#8B0000',
          gold: '#D4AF37',
          lightgold: '#F5C542',
          cream: '#FAF3E0',
          jade: '#2E7D32',
          amber: '#F57C00',
        },
      },
      fontFamily: {
        calligraphy: ['"Ma Shan Zheng"', 'cursive', 'serif'],
        sc: ['"Noto Sans SC"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
