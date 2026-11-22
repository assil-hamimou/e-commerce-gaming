/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#131B2B',
          hover: '#2F4A63',
          dark: '#5B91A3',
          light: '#CFEAE0',
          glow: '#CFEAE0',
          bg: '#131B2B',
          surface: '#182236',
          card: '#1C273E',
          cardHover: '#23324E',
          cardMuted: '#151E30',
          border: 'rgba(207, 234, 224, 0.12)',
          borderHover: 'rgba(207, 234, 224, 0.3)',
          borderDark: '#2F4A63',
          accent: '#5B91A3',
          mint: '#CFEAE0',
        }
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        display: ['"A Dream Come True"', 'cursive', 'sans-serif'],
        dream: ['"A Dream Come True"', 'cursive', 'sans-serif'],
        bright: ['"Bright Marching"', 'serif'],
        brand: ['"Bright Marching"', 'serif'],
      },
      boxShadow: {
        'brand-glow': '0 0 25px -4px rgba(207, 234, 224, 0.25), 0 0 10px -2px rgba(207, 234, 224, 0.15)',
        'brand-card': '0 8px 30px -4px rgba(10, 14, 24, 0.6), inset 0 1px 0 0 rgba(207, 234, 224, 0.08)',
        'brand-card-hover': '0 16px 40px -4px rgba(10, 14, 24, 0.8), 0 0 20px -2px rgba(91, 145, 163, 0.25), inset 0 1px 0 0 rgba(207, 234, 224, 0.2)',
        'brand-btn': '0 4px 16px rgba(207, 234, 224, 0.25)',
      }
    },
  },
  plugins: [],
}
