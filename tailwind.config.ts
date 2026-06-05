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
        body: ['Inter', 'var(--font-inter)', 'sans-serif'],
        stats: ['var(--font-bebas-neue)', 'cursive'],
        // Landing page fonts (Bebas Neue display, JetBrains Mono)
        display: ['"Bebas Neue"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      // Landing page display + mono type scale (from the landing design system)
      fontSize: {
        'display-xl': ['clamp(4rem, 10vw, 8rem)', { lineHeight: '0.9', letterSpacing: '0.02em' }],
        'display-l': ['clamp(2.5rem, 5vw, 4rem)', { lineHeight: '0.95', letterSpacing: '0.02em' }],
        'display-m': ['clamp(1.5rem, 3vw, 2.5rem)', { lineHeight: '1.0', letterSpacing: '0.02em' }],
        'mono-l': ['clamp(2rem, 4vw, 3.5rem)', { lineHeight: '1.0', letterSpacing: '-0.02em' }],
        'mono-m': ['1.25rem', { lineHeight: '1.2', letterSpacing: '0' }],
        'mono-s': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.02em' }],
      },
      keyframes: {
        // Landing page animations
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'pulse-dot': {
          '0%, 100%': { transform: 'scale(0.8)', opacity: '0.6' },
          '50%': { transform: 'scale(1.2)', opacity: '1' },
        },
      },
      animation: {
        marquee: 'marquee 40s linear infinite',
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
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
