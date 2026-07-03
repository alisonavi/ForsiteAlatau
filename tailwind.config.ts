import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bank: {
          navy: "#0B2447",
          primary: "#2563EB",
          "primary-dark": "#1D4ED8",
          "primary-soft": "#EAF0FE",
          teal: "#0EA5A4",
          gold: "#E0A82E",
          bg: "#F4F6FB",
          card: "#FFFFFF",
          border: "#E6EAF3",
          ink: "#0F1B2D",
          muted: "#64748B",
          green: "#16A34A",
          red: "#DC2626",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 27, 45, 0.04), 0 6px 24px rgba(15, 27, 45, 0.05)",
        "card-hover":
          "0 2px 4px rgba(15, 27, 45, 0.06), 0 12px 32px rgba(37, 99, 235, 0.10)",
      },
      borderRadius: {
        xl: "0.9rem",
        "2xl": "1.15rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease both",
      },
    },
  },
  plugins: [],
};

export default config;
