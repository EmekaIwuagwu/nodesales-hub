/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        kortana: {
          900: "#0a0e1a",
          800: "#111827",
          700: "#1a2235",
          600: "#243052",
          accent: "#00c2ff",
          gold:   "#f5a623",
          green:  "#00e599",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow":       "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          from: { boxShadow: "0 0 5px #00c2ff, 0 0 10px #00c2ff" },
          to:   { boxShadow: "0 0 20px #00c2ff, 0 0 40px #00c2ff" },
        },
      },
    },
  },
  plugins: [],
};
