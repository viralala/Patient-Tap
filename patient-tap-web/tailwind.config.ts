import type { Config } from "tailwindcss";

const config: Config = {
  // `relative: true` resolves these globs against this config file's directory
  // instead of process.cwd() — the dev server is launched from the repo root.
  content: {
    relative: true,
    files: [
      "./app/**/*.{ts,tsx}",
      "./components/**/*.{ts,tsx}",
      "./lib/**/*.{ts,tsx}",
    ],
  },
  theme: {
    extend: {
      colors: {
        // Deep ink — cinematic dark chapters (hero, CTA, footer, dark app screens).
        ink: {
          DEFAULT: "#0A0E17",
          soft: "#10151F",
          raised: "#161C29",
          line: "#242C3D",
        },
        // Off-white paper base + white cards (reference design).
        paper: {
          DEFAULT: "#F5F6FB",
          card: "#FFFFFF",
          sunk: "#ECEEF6",
          line: "#E3E6F1",
        },
        // Royal blue — the brand accent from the reference.
        royal: {
          50: "#EEF2FE",
          100: "#DCE4FD",
          200: "#B9C9FB",
          300: "#8FA6F6",
          400: "#5E7DEE",
          500: "#2F5FE0", // brand
          600: "#274FC4",
          700: "#213F9E",
          800: "#1E367F",
          900: "#1B2F66",
        },
        // Life-safety alarm red — DNR flag + allergy warnings.
        critical: {
          DEFAULT: "#F5333F",
          soft: "#FF5A63",
          deep: "#B5121C",
          wash: "#2A0E11",
        },
        // Verified / safe / online signal.
        signal: {
          DEFAULT: "#12C58B",
          soft: "#3FDFA6",
          deep: "#0B7A55",
        },
        // Near-black canvas for the holographic redesign.
        void: {
          DEFAULT: "#0a0a0b",
          soft: "#101013",
          card: "#141417",
          raised: "#1a1a1e",
          line: "#26262b",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-space-grotesk)", "var(--font-geist-sans)", "sans-serif"],
        serif: ["var(--font-instrument-serif)", "Georgia", "serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        card: "22px",
        pill: "999px",
      },
      maxWidth: {
        shell: "1240px",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.22, 1, 0.36, 1)",
        springy: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.85)", opacity: "0.7" },
          "70%": { transform: "scale(1.6)", opacity: "0" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
        "float-slow": {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-14px)" },
        },
        "grain-shift": {
          "0%,100%": { transform: "translate(0,0)" },
          "50%": { transform: "translate(-4%,3%)" },
        },
        "sheen": {
          "0%": { transform: "translateX(-120%)" },
          "100%": { transform: "translateX(220%)" },
        },
      },
      animation: {
        marquee: "marquee 32s linear infinite",
        "marquee-slow": "marquee 60s linear infinite",
        "pulse-ring": "pulse-ring 2.4s cubic-bezier(0.4,0,0.2,1) infinite",
        "float-slow": "float-slow 7s ease-in-out infinite",
        "grain-shift": "grain-shift 8s steps(4) infinite",
        sheen: "sheen 2.2s cubic-bezier(0.22,1,0.36,1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
