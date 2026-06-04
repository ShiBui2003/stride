// Tailwind config — STRIDE design system tokens (all colors and fonts as named classes)
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0A0A0A',
        surface: '#111111',
        accent: '#C8FF00',
        danger: '#FF3B30',
        textPrimary: '#FFFFFF',
        textSecondary: '#888888',
      },
      fontFamily: {
        heading: ['var(--font-space-grotesk)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif'],
        stats: ['var(--font-bebas-neue)', 'cursive'],
      },
      screens: {
        // Mobile-first base: 375px → md: 768px → lg: 1280px
        sm: '375px',
        md: '768px',
        lg: '1280px',
      },
    },
  },
  plugins: [],
};

export default config;
