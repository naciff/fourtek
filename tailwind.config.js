/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: {
            50: "#e6f2ff",
            100: "#cce6ff",
            200: "#99ccff",
            300: "#66b3ff",
            400: "#3399ff",
            500: "#007fff",
            600: "#0066cc",
            700: "#004c99",
            800: "#003366",
            900: "#001933"
          },
          green: {
            50: "#e9f7ef",
            100: "#d4efdf",
            200: "#a9dfbf",
            300: "#7dcea0",
            400: "#52be80",
            500: "#27ae60",
            600: "#1e8a4d",
            700: "#166639",
            800: "#0f4326",
            900: "#072013"
          }
        }
      }
    }
  },
  plugins: []
};