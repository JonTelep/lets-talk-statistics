import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: 'var(--surface)',
          paper: 'var(--surface-paper)',
          cream: 'var(--surface-cream)',
          warm: 'var(--surface-warm)',
          accent: 'var(--surface-accent)',
          muted: 'var(--surface-muted)',
          border: 'var(--surface-border)',
          strong: 'var(--surface-strong)',
        },
        editorial: {
          navy: 'var(--editorial-navy)',
          burgundy: 'var(--editorial-burgundy)',
          forest: 'var(--editorial-forest)',
          gold: 'var(--editorial-gold)',
          slate: 'var(--editorial-slate)',
        },
        border: {
          DEFAULT: 'var(--border)',
          subtle: 'var(--border-subtle)',
          medium: 'var(--border-medium)',
          strong: 'var(--border-strong)',
        },
        foreground: 'var(--text-primary)',
        'fg-secondary': 'var(--text-secondary)',
        'fg-muted': 'var(--text-muted)',
        'fg-dim': 'var(--text-dim)',
        'fg-accent': 'var(--text-accent)',
      },
      fontFamily: {
        serif: [
          'Crimson Text',
          'Source Serif 4',
          'Georgia',
          'Times New Roman',
          'serif',
        ],
        sans: [
          'Fira Sans',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'Fira Code',
          'Consolas',
          'monospace',
        ],
      },
      animation: {
        shimmer: 'shimmer 2s ease-in-out infinite',
        'fade-in': 'fadeInUp 0.6s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'typewriter': 'typewriter 2s steps(40) 1s forwards',
        'stagger': 'fadeInUp 0.6s ease-out forwards',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        typewriter: {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
