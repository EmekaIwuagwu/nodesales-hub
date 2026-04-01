/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        kortana: {
          950: "#04070f",
          900: "#0a0e1a",
          850: "#0d1220",
          800: "#111827",
          750: "#141e2e",
          700: "#1a2235",
          600: "#243052",
          500: "#2e3d6a",
          accent: "#00c2ff",
          "accent-dim": "#0099cc",
          gold:   "#f5a623",
          green:  "#00e599",
          purple: "#a855f7",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
        display: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-slow":   "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow":         "glow 2s ease-in-out infinite alternate",
        "float":        "float 6s ease-in-out infinite",
        "shimmer":      "shimmer 2.5s linear infinite",
        "spin-slow":    "spin 8s linear infinite",
        "fade-up":      "fadeUp 0.5s ease-out forwards",
        "gradient":     "gradientShift 4s ease infinite",
        "border-glow":  "borderGlow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          from: { boxShadow: "0 0 5px #00c2ff40, 0 0 10px #00c2ff20" },
          to:   { boxShadow: "0 0 20px #00c2ff80, 0 0 40px #00c2ff40" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-12px)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%":      { backgroundPosition: "100% 50%" },
        },
        borderGlow: {
          from: { borderColor: "#00c2ff40" },
          to:   { borderColor: "#00c2ffaa" },
        },
      },
      backgroundImage: {
        "grid-pattern": "linear-gradient(rgba(0,194,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,194,255,0.03) 1px, transparent 1px)",
        "hero-gradient": "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,194,255,0.15), transparent)",
        "card-gradient": "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 100%)",
      },
      backgroundSize: {
        "grid": "40px 40px",
      },
      boxShadow: {
        "glow-accent":  "0 0 30px rgba(0,194,255,0.3)",
        "glow-sm":      "0 0 15px rgba(0,194,255,0.15)",
        "glow-gold":    "0 0 30px rgba(245,166,35,0.3)",
        "glow-green":   "0 0 30px rgba(0,229,153,0.3)",
        "card":         "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
        "card-hover":   "0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
      },
    },
  },
  plugins: [],
};
