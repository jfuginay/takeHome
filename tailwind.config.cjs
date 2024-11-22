/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    screens: {
      sm: "0px",
      md: "768px",
      lg: "976px",
      xl: "1440px",
    },
    extend: {},
  },
  darkMode: 'class', // Use class-based dark mode
  plugins: [],
};

module.exports = config;
