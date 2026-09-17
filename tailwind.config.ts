import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#12151A",
        paper: "#EEF0EC",
        panel: "#1A1E24",
        line: "#2A2F37",
        amber: {
          DEFAULT: "#E8A33D",
          soft: "#3A2E1C",
        },
        sage: {
          DEFAULT: "#3EA88B",
          soft: "#16302A",
        },
        clay: {
          DEFAULT: "#C7684F",
          soft: "#3A2420",
        },
        mute: "#8B93A1",
      },
      fontFamily: {
        display: ["var(--font-grotesk)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        tag: "2px",
      },
    },
  },
  plugins: [],
};
export default config;
