/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        // We can extend slate or define custom colors if needed
        // keeping default slate for now as requested (slate-950)
      }
    },
  },
  plugins: [],
}
