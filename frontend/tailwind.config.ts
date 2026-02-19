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
        // Editorial Color System
        surface: {
          DEFAULT: 'var(--surface)',
          50: 'var(--surface-50)',
          100: 'var(--surface-100)',
          200: 'var(--surface-200)',
          300: 'var(--surface-300)',
          400: 'var(--surface-400)',
          500: 'var(--surface-500)',
          600: 'var(--surface-600)',
          700: 'var(--surface-700)',
          800: 'var(--surface-800)',
          900: 'var(--surface-900)',
          950: 'var(--surface-950)',
        },
        
        // Editorial Accents
        'editorial-red': {
          DEFAULT: 'var(--editorial-red)',
          light: 'var(--editorial-red-light)',
          dark: 'var(--editorial-red-dark)',
        },
        'editorial-gold': {
          DEFAULT: 'var(--editorial-gold)',
          light: 'var(--editorial-gold-light)',
        },
        
        // Border System
        border: {
          DEFAULT: 'var(--border)',
          subtle: 'var(--border-subtle)',
          medium: 'var(--border-medium)',
          strong: 'var(--border-strong)',
        },
        
        // Text Hierarchy
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          dim: 'var(--text-dim)',
          subtle: 'var(--text-subtle)',
        },
        
        // Compatibility with old system
        foreground: 'var(--text-primary)',
        accent: {
          DEFAULT: 'var(--editorial-red)',
          muted: 'var(--editorial-red-dark)',
          dim: 'var(--editorial-red-dark)',
        },
      },
      
      fontFamily: {
        serif: [
          'Source Serif Pro',
          'Georgia',
          'Times New Roman',
          'serif',
        ],
        display: [
          'Playfair Display',
          'Georgia',
          'Times New Roman',
          'serif',
        ],
        mono: [
          'var(--font-mono)',
          'JetBrains Mono',
          'Fira Code',
          'Consolas',
          'monospace',
        ],
        sans: [
          'Source Serif Pro',
          'Georgia', 
          'system-ui',
          'sans-serif',
        ],
      },
      
      fontSize: {
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      
      letterSpacing: {
        'tighter': '-0.02em',
        'editorial': '-0.01em',
      },
      
      animation: {
        shimmer: 'shimmer 1.5s ease-in-out infinite',
        'fade-in': 'fade-in 0.4s ease-out',
        'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
      },
      
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInUp: {
          '0%': { 
            opacity: '0', 
            transform: 'translateY(20px)' 
          },
          '100%': { 
            opacity: '1', 
            transform: 'translateY(0)' 
          },
        },
      },
      
      boxShadow: {
        'editorial-soft': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'editorial-medium': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        'editorial-strong': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      },
      
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
};

export default config;