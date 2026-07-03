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
          // Brand: white canvas + red / blue / purple accents (vibrant, not dim).
          navy: "#1E1B4B", // deep indigo — logo gradient tail
          primary: "#2563EB", // blue
          "primary-dark": "#1D4ED8",
          "primary-soft": "#E7EEFF",
          blue: "#2563EB",
          "blue-bright": "#3B82F6",
          purple: "#7C3AED",
          "purple-dark": "#6D28D9",
          "purple-soft": "#F1E9FF",
          "purple-bright": "#A855F7",
          red: "#F23C50",
          "red-soft": "#FEE7EB",
          pink: "#EC4899",
          teal: "#7C3AED", // legacy alias → brand violet (kept for old imports)
          gold: "#E0A82E", // reserved for semantic "warning" states only
          bg: "#FFFFFF",
          card: "#FFFFFF",
          border: "#E7EAF3",
          ink: "#0F1B2D",
          muted: "#64748B",
          green: "#16A34A",
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
        card: "0 1px 2px rgba(15, 27, 45, 0.04), 0 8px 28px rgba(37, 99, 235, 0.06)",
        "card-hover":
          "0 4px 12px rgba(124, 58, 237, 0.10), 0 20px 46px rgba(37, 99, 235, 0.16)",
        glow: "0 0 0 4px rgba(37, 99, 235, 0.14)",
      },
      borderRadius: {
        xl: "0.9rem",
        "2xl": "1.15rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.55", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.08)" },
        },
        "ring-pulse": {
          "0%": { boxShadow: "0 0 0 0 rgba(37, 99, 235, 0.45)" },
          "100%": { boxShadow: "0 0 0 12px rgba(37, 99, 235, 0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease both",
        "pulse-glow": "pulse-glow 2.4s ease-in-out infinite",
        "ring-pulse": "ring-pulse 1.8s ease-out infinite",
        shimmer: "shimmer 2.4s linear infinite",
        float: "float 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
