/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    // আপনার প্রজেক্টের পাথ অনুযায়ী
  ],
  theme: {
    extend: {
      colors: {
        primary: '#d10000',
        secondary: '#f5f8ff',
        third: '#1D2D52',
        fourth: '#0E2047',
        fifth: '#4b5563',
        red: {
          50: '#fff1f1',
          100: '#ffe0e0',
          200: '#ffbcbc',
          300: '#ff8d8d',
          400: '#ff5e5e',
          500: '#ff2a2a',
          600: '#d10000',
          700: '#b00000',
          800: '#820000',
          900: '#5a0000',
          950: '#330000',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}