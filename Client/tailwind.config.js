/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // adjust based on your file structure
  ],
  theme: {
    extend: {
      backgroundImage: {
        "custom-bg": "url('src/assets/backdrop.jpg')",
      },
    },
  },
  plugins: [],
};
