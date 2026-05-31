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
        "u-bg": "var(--u-bg)",
        "u-surface": "var(--u-surface)",
        "u-surface-2": "var(--u-surface-2)",
        "u-ink": "var(--u-ink)",
        "u-ink-2": "var(--u-ink-2)",
        "u-ink-3": "var(--u-ink-3)",
        "u-ember": "var(--u-ember)",
        "u-indigo": "var(--u-indigo)",
      },
      maxWidth: {
        container: "1240px",
      },
    },
  },
  plugins: [],
};
export default config;
