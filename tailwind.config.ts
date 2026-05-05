import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#190019",
        plum: "#2b124c",
        mauve: "#522b5b",
        rose: "#854f6c",
        blush: "#dfb6b2",
        cream: "#fbe4d8",
        // legacy aliases so existing classes keep working
        paper: "#fbe4d8",
        muted: "#854f6c",
        accent: "#2b124c",
        line: "#dfb6b2",
      },
      fontFamily: {
        sans: ["var(--font-quicksand)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-quicksand)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 8px 24px rgba(25, 0, 25, 0.08)",
        plum: "0 12px 32px rgba(43, 18, 76, 0.18)",
      },
    },
  },
  plugins: [],
} satisfies Config;
