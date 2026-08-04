/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
        secondary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        accent: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
        },
        surface: {
          light: "#ffffff",
          DEFAULT: "#f8fafc",
          dark: "#0b0f19",
          "dark-elevated": "#131826",
        },
        sidebar: {
          DEFAULT: "#0f172a",
          hover: "#1e293b",
          active: "#16a34a",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "8px",
        lg: "12px",
        xl: "14px",
        "2xl": "16px",
        "3xl": "20px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(15,23,42,.04), 0 4px 16px -4px rgba(15,23,42,.08)",
        "card-hover":
          "0 4px 6px rgba(15,23,42,.04), 0 12px 32px -8px rgba(15,23,42,.14)",
        "card-dark":
          "0 1px 3px rgba(0,0,0,.3), 0 4px 16px -4px rgba(0,0,0,.45)",
        "card-dark-hover":
          "0 4px 6px rgba(0,0,0,.3), 0 12px 32px -8px rgba(0,0,0,.55)",
        glow: "0 0 0 1px rgba(34,197,94,.15), 0 8px 30px -10px rgba(34,197,94,.3)",
        "glow-sm": "0 0 0 1px rgba(34,197,94,.1), 0 4px 12px -4px rgba(34,197,94,.2)",
        "input-focus": "0 0 0 3px rgba(34,197,94,.12)",
        navbar: "0 1px 0 0 rgba(15,23,42,.06)",
        dropdown:
          "0 4px 6px -1px rgba(15,23,42,.08), 0 12px 24px -4px rgba(15,23,42,.12)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: 0, transform: "translateY(8px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        "slide-in-right": {
          "0%": { opacity: 0, transform: "translateX(8px)" },
          "100%": { opacity: 1, transform: "translateX(0)" },
        },
        "scale-in": {
          "0%": { opacity: 0, transform: "scale(0.96)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-700px 0" },
          "100%": { backgroundPosition: "700px 0" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.6 },
        },
        spin: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "fade-up": "fade-up .4s ease-out both",
        "fade-in": "fade-in .3s ease-out both",
        "slide-in-right": "slide-in-right .3s ease-out both",
        "scale-in": "scale-in .2s ease-out both",
        shimmer: "shimmer 1.6s infinite linear",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
