import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    deep: "#0A3D62",
                    kortana: "#1A7A8A",
                    bright: "#22D3EE",
                },
                secondary: {
                    deep: "#92400E",
                    warm: "#D97706",
                    soft: "#FCD34D",
                },
                neutral: {
                    obsidian: "#0B0F1A",
                    navy: "#111827",
                    slate: "#1F2937",
                    muted: "#374151",
                    dim: "#6B7280",
                    body: "#D1D5DB",
                    bright: "#F9FAFB",
                },
                success: "#10B981",
                warning: "#F59E0B",
                error: "#EF4444",
                info: "#3B82F6",
            },
            fontFamily: {
                display: ["var(--font-sora)", "Inter", "system-ui", "sans-serif"],
                body: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
                mono: ["var(--font-jetbrains-mono)", "monospace"],
            },
            backgroundImage: {
                "hero-gradient": "linear-gradient(135deg, #0A3D62 0%, #1A7A8A 50%, #0B0F1A 100%)",
                "gold-gradient": "linear-gradient(135deg, #D97706 0%, #FCD34D 100%)",
            },
            backdropBlur: {
                xs: '2px',
            },
        },
    },
    plugins: [],
};
export default config;
