/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Official Paper Theme Colors
        paper1: {
          DEFAULT: '#10B981', // Accounting - Emerald
          light: '#D1FAE5',
          dark: '#065F46',
          bg: '#ECFDF5',
          darkBg: '#064E3B',
        },
        paper2: {
          DEFAULT: '#8B5CF6', // Business Laws - Violet
          light: '#EDE9FE',
          dark: '#5B21B6',
          bg: '#F5F3FF',
          darkBg: '#4C1D95',
        },
        paper3: {
          DEFAULT: '#06B6D4', // Quantitative Aptitude - Cyan
          light: '#CFFAFE',
          dark: '#155E75',
          bg: '#ECFEFF',
          darkBg: '#164E63',
        },
        paper4: {
          DEFAULT: '#F59E0B', // Business Economics - Amber
          light: '#FEF3C7',
          dark: '#92400E',
          bg: '#FFFBEB',
          darkBg: '#78350F',
        },
        // Apple Neutral Zinc tokens
        zinc: {
          850: '#1f1f23',
          900: '#18181b',
          950: '#09090b',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Text"',
          '"SF Pro Display"',
          '"Inter"',
          'system-ui',
          'sans-serif',
        ],
        mono: [
          '"SF Mono"',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      boxShadow: {
        'glass-light': '0 8px 32px 0 rgba(0, 0, 0, 0.05)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'hairline': '0 0 0 1px rgba(0, 0, 0, 0.06)',
        'hairline-dark': '0 0 0 1px rgba(255, 255, 255, 0.08)',
        'apple-card': '0 4px 20px -2px rgba(0, 0, 0, 0.04), 0 2px 6px -1px rgba(0, 0, 0, 0.02)',
        'apple-card-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.4), 0 2px 6px -1px rgba(0, 0, 0, 0.2)',
      },
      backdropBlur: {
        'xs': '2px',
        '2xl': '40px',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
