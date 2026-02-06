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
        // Federal Brutalism Color Scheme
        federal: {
          navy: {
            50: '#f8fafc',
            100: '#f1f5f9',
            200: '#e2e8f0',
            300: '#cbd5e1',
            400: '#94a3b8',
            500: '#64748b',
            600: '#475569',
            700: '#334155',
            800: '#1e293b',
            900: '#0f172a',
            950: '#020617',
          },
          red: {
            50: '#fef2f2',
            100: '#fee2e2',
            200: '#fecaca',
            300: '#fca5a5',
            400: '#f87171',
            500: '#ef4444',
            600: '#dc2626',
            700: '#b91c1c',
            800: '#991b1b',
            900: '#7f1d1d',
            950: '#450a0a',
          },
          gold: {
            50: '#fffbeb',
            100: '#fef3c7',
            200: '#fde68a',
            300: '#fcd34d',
            400: '#fbbf24',
            500: '#f59e0b',
            600: '#d97706',
            700: '#b45309',
            800: '#92400e',
            900: '#78350f',
            950: '#451a03',
          },
          charcoal: {
            50: '#f9fafb',
            100: '#f3f4f6',
            200: '#e5e7eb',
            300: '#d1d5db',
            400: '#9ca3af',
            500: '#6b7280',
            600: '#4b5563',
            700: '#374151',
            800: '#1f2937',
            900: '#111827',
            950: '#030712',
          }
        },
        primary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        accent: {
          DEFAULT: '#dc2626',
          light: '#ef4444',
          dark: '#b91c1c',
        },
        success: {
          DEFAULT: '#16a34a',
          dark: '#15803d',
        },
        warning: {
          DEFAULT: '#d97706',
          dark: '#b45309',
        },
        danger: {
          DEFAULT: '#dc2626',
          dark: '#b91c1c',
        },
      },
      fontFamily: {
        sans: [
          'Source Sans Pro',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif',
        ],
        serif: [
          'Zilla Slab',
          'Charter',
          'Bitstream Charter',
          'Sitka Text',
          'Cambria',
          'serif',
        ],
        mono: [
          'JetBrains Mono',
          'Fira Code',
          'Consolas',
          'monospace',
        ],
      },
      fontSize: {
        'display': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'hero': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'section': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
      },
      fontFeatureSettings: {
        numeric: ['tnum', 'lnum'],
      },
      animation: {
        shimmer: 'shimmer 1.5s ease-in-out infinite',
        'slide-in-up': 'slide-in-up 0.4s ease-out',
        'slide-in-left': 'slide-in-left 0.4s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'geometric-pulse': 'geometric-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        'slide-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'geometric-pulse': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.02)' },
        },
      },
      boxShadow: {
        'brutal': '4px 4px 0px 0px rgb(15, 23, 42)',
        'brutal-red': '4px 4px 0px 0px rgb(220, 38, 38)',
        'brutal-gold': '4px 4px 0px 0px rgb(217, 119, 6)',
        'brutal-lg': '8px 8px 0px 0px rgb(15, 23, 42)',
      },
      backgroundImage: {
        'federal-gradient': 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        'accent-gradient': 'linear-gradient(135deg, #b91c1c 0%, #dc2626 50%, #ef4444 100%)',
        'gold-gradient': 'linear-gradient(135deg, #b45309 0%, #d97706 50%, #f59e0b 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
