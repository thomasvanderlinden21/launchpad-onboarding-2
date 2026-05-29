/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        'content-primary': '#121621',
        'content-secondary': '#525d5d',
        'surface-page': '#f5f7f7',
        'surface-neutral': '#ffffff',
        'border-neutral': '#e6ebeb',
        'brand-teal': '#0D6E6E',
        'brand-teal-light': '#e8f4f4',
      },
      boxShadow: {
        'page': '0px 0px 38px 0px rgba(0,0,0,0.16)',
      },
      borderRadius: {
        'sm': '8px',
      },
      maxWidth: {
        'content': '800px',
      },
    },
  },
  plugins: [],
}
