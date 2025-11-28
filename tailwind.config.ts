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
                "osrs-bg": "#c0a886",
                "osrs-text": "#1a1a1a",
                "osrs-primary": "#5a3820",
                "osrs-accent": "#936039",
                "osrs-panel": "#d1c6a6",
                "osrs-input": "#e2dbc8",
                "osrs-button": "#b8a282",
                "osrs-button-hover": "#d0bd97",
                "osrs-border": "#94866d",
                "osrs-profit": "#014cc0",
                "osrs-loss": "#c02614",
            },
            fontFamily: {
                main: ["Inter", "sans-serif"],
                header: ["Cinzel", "serif"],
            },
        },
    },
    plugins: [],
};
export default config;
