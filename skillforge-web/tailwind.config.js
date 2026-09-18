/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6C63FF',
        secondary: '#3ECFCF',
        background: '#0F0F1A',
        surface: '#1A1A2E',
        success: '#48BB78',
        warning: '#ECC94B',
        error: '#FC8181',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
