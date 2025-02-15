import { heroui } from "@heroui/theme";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Add any Tailwind-specific theme extensions here
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
          '2xl': '6rem',
        },
      },
    },
  },
  darkMode: "class",
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            primary: {
              DEFAULT: "#7C3AED",
              foreground: "#FFFFFF",
            },
            focus: "#7C3AED",
          },
        },
        dark: {
          colors: {
            primary: {
              DEFAULT: "#9F67FF",
              foreground: "#FFFFFF",
            },
            focus: "#9F67FF",
          },
        },
        // You can add custom themes here
        "purple-dark": {
          extend: "dark", // extends the dark theme
          colors: {
            primary: {
              DEFAULT: "#9F67FF",
              50: '#faf5ff',
              100: '#f3e8ff',
              200: '#e9d5ff',
              300: '#d8b4fe',
              400: '#c084fc',
              500: '#a855f7',
              600: '#9333ea',
              700: '#7c3aed',
              800: '#6b21a8',
              900: '#581c87',
              foreground: "#FFFFFF",
            },
            focus: "#9F67FF",
          },
        },
      },
      layout: {
        radius: {
          small: "0.25rem",
          medium: "0.5rem",
          large: "0.75rem",
        },
        borderWidth: {
          small: "1px",
          medium: "2px",
          large: "3px",
        },
      },
    }),
  ],
}