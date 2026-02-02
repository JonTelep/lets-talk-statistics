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
        // Dark Terminal Theme Colors
        terminal: {
          bg: '#0a0a0a',
          surface: '#111111',
          border: '#1a1a1a',
          text: '#e5e5e5',
          muted: '#888888',
          cyan: '#00ffff',
          green: '#00ff41',
          amber: '#ffbf00',
          red: '#ff0040',
          purple: '#bf00ff',
        },
        // Keep original colors for compatibility
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        success: {
          DEFAULT: '#00ff41',
          dark: '#00cc33',
        },
        warning: {
          DEFAULT: '#ffbf00',
          dark: '#e6ac00',
        },
        danger: {
          DEFAULT: '#ff0040',
          dark: '#cc0033',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'Fira Code',
          'SF Mono',
          'Monaco',
          'Inconsolata',
          'Roboto Mono',
          'monospace',
        ],
      },
      fontFeatureSettings: {
        numeric: ['tnum', 'lnum'],
      },
      animation: {
        shimmer: 'shimmer 1.5s ease-in-out infinite',
        glow: 'glow 2s ease-in-out infinite alternate',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        glow: {
          '0%': { 
            textShadow: '0 0 5px currentColor, 0 0 10px currentColor',
            boxShadow: '0 0 5px currentColor',
          },
          '100%': { 
            textShadow: '0 0 10px currentColor, 0 0 20px currentColor',
            boxShadow: '0 0 10px currentColor',
          },
        },
      },
      backgroundImage: {
        'grid-terminal': `
          linear-gradient(rgba(0, 255, 255, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 255, 255, 0.03) 1px, transparent 1px)
        `,
      },
      backgroundSize: {
        'grid-20': '20px 20px',
      },
    },
  },
  plugins: [],
};

export default config;
