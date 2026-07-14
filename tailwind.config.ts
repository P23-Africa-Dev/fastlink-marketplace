import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "primary-dark": "#380469",
        primary: "#834AB9",
        secondary: "#A06BD2",
        "secondary-border": "#834AB9",
        "accent-orange": "#F99211",
        "accent-orange-alt": "#F39800",
        "surface-light": "#EFE4F5",
        "surface-card": "#F8F5FC",
        dark: "#191919",
      },
    },
  },
  plugins: [],
};
export default config;
