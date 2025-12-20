/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1D4D6B", // Matching your Flutter App's primary color
        secondary: "#3498DB",
      }
    },
  },
  plugins: [],
}