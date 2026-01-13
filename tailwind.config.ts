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
        // Yes.cz brand colors
        'yes-blue': {
          DEFAULT: '#1e3a8a',
          light: '#3b82f6',
          dark: '#1e40af',
        },
        'yes-orange': {
          DEFAULT: '#f97316',
          light: '#fb923c',
          dark: '#ea580c',
        },
        'yes-gray': {
          DEFAULT: '#64748b',
          light: '#94a3b8',
          dark: '#475569',
        },
        'yes-dark': {
          DEFAULT: '#1e293b',
          light: '#334155',
          dark: '#0f172a',
        },
      },
    },
  },
  plugins: [],
};
export default config;
