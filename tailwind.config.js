/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        whitebg: "#FDFDFD",
        purp: "#e0e0fe",
        pink: "#ffc5c5",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      height: {
        preview: "500px",
      },
    },
  },
  plugins: [],
};
