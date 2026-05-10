import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",
          light: "var(--color-primary-light)",
          mid: "var(--color-primary-mid)",
          dark: "var(--color-primary-dark)",
        },
        correct: {
          DEFAULT: "var(--color-correct)",
          light: "var(--color-correct-light)",
          dark: "var(--color-correct-dark)",
        },
        wrong: {
          DEFAULT: "var(--color-wrong)",
          light: "var(--color-wrong-light)",
          dark: "var(--color-wrong-dark)",
        },
        reward: {
          DEFAULT: "var(--color-reward)",
          light: "var(--color-reward-light)",
          dark: "var(--color-reward-dark)",
        },
        canvas: "var(--color-canvas)",
        surface: {
          DEFAULT: "var(--color-surface)",
          alt: "var(--color-surface-alt)",
        },
        border: {
          DEFAULT: "var(--color-border)",
          strong: "var(--color-border-strong)",
        },
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      fontSize: {
        xs: ["11px", { lineHeight: "1.4" }],
        sm: ["13px", { lineHeight: "1.5" }],
        base: ["15px", { lineHeight: "1.6" }],
        md: ["17px", { lineHeight: "1.5" }],
        lg: ["22px", { lineHeight: "1.3" }],
        xl: ["28px", { lineHeight: "1.2" }],
        "2xl": ["38px", { lineHeight: "1.1" }],
      },
      spacing: {
        1: "4px",
        2: "8px",
        3: "12px",
        4: "16px",
        5: "20px",
        6: "24px",
        8: "32px",
        10: "40px",
        12: "48px",
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        full: "9999px",
      },
      boxShadow: {
        card: "0 2px 8px rgba(92, 63, 232, 0.08)",
        modal: "0 8px 32px rgba(92, 63, 232, 0.16)",
        button: "0 4px 12px rgba(92, 63, 232, 0.25)",
      },
      maxWidth: {
        app: "480px",
      },
    },
  },
  plugins: [],
};

export default config;
