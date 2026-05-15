import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  content: ["./client/index.html", "./client/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          green: "#22C55E",
          "green-dark": "#15803D",
          "green-light": "#86EFAC",
          teal: "#0EA5E9",
          navy: "#1E293B",
        },
        smiley: {
          "very-happy": "#16A34A",
          happy: "#86EFAC",
          neutral: "#FCD34D",
          unhappy: "#FCA5A5",
          "very-unhappy": "#DC2626",
        },
        surface: {
          DEFAULT: "#F8FAFC",
          card: "#FFFFFF",
          dim: "#F1F5F9",
        },
      },
      fontFamily: {
        display: ['"Bungee"', "system-ui", "sans-serif"],
        body: ['"Poppins"', "system-ui", "sans-serif"],
        mono: ['"Poppins"', "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        card: "0 1px 3px rgba(15,23,42,0.04), 0 1px 2px rgba(15,23,42,0.06)",
        "card-hover": "0 18px 40px rgba(15,23,42,0.10)",
        "smiley-happy": "0 0 20px rgba(34,197,94,0.35)",
        "smiley-unhappy": "0 0 20px rgba(239,68,68,0.35)",
        "smiley-selected": "0 0 0 4px rgba(34,197,94,0.3)",
      },
      animation: {
        "counter-up": "counterUp 1.2s ease-out",
        "pulse-green": "pulseGreen 2s infinite",
        "smiley-bounce": "smileyBounce 0.3s ease",
        "fade-slide-up": "fadeSlideUp 0.4s ease",
        "live-dot": "liveDot 1.5s ease-in-out infinite",
      },
      keyframes: {
        counterUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGreen: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(34,197,94,0.4)" },
          "50%": { boxShadow: "0 0 0 8px rgba(34,197,94,0)" },
        },
        smileyBounce: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(0.92)" },
          "100%": { transform: "scale(1)" },
        },
        fadeSlideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        liveDot: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
      },
    },
  },
  plugins: [animate],
};

export default config;
