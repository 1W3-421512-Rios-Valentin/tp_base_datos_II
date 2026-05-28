/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4CAF50',
        secondary: '#1C293C',
        surface: '#FBFBF9',
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        nb: '4px 4px 0 #1C293C',
        'nb-sm': '3px 3px 0 #1C293C',
        'nb-lg': '6px 6px 0 #1C293C',
      },
    },
  },
  plugins: [],
};