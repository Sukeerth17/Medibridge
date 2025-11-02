/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // covers all subfolders in /src
    "./pages/**/*.{js,ts,jsx,tsx,mdx}", // fallback for pages outside src
    "./components/**/*.{js,ts,jsx,tsx,mdx}" // fallback for shared components
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
