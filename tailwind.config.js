/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#2F7D6D',
        'primary-hover': '#4FA89A',
        'primary-light': '#E6F4F1',
        'primary-dark': '#1F4D3A',
        accent: '#4FA89A',
        'text-primary': '#1F2937',
        'text-secondary': '#6B7280',
        border: '#E5E7EB',
        surface: 'rgba(255, 255, 255, 0.72)',
        'surface-dark': 'rgba(15, 23, 42, 0.72)', // slate-900
        'surface-elevated': 'rgba(255, 255, 255, 0.88)',
        'surface-elevated-dark': 'rgba(30, 41, 59, 0.88)', // slate-800
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        hero: ['clamp(2.25rem, 5vw, 3.5rem)', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        section: ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        'body-lg': ['1.0625rem', { lineHeight: '1.6' }],
      },
      boxShadow: {
        soft: '0 2px 8px rgba(0, 0, 0, 0.06)',
        medium: '0 4px 20px rgba(0, 0, 0, 0.08)',
        'lg-soft': '0 8px 32px rgba(0, 0, 0, 0.1)',
        hover: '0 12px 40px rgba(0, 0, 0, 0.12)',
        glass: '0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
        'glass-dark': '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
        glow: '0 0 40px rgba(47, 125, 109, 0.15)',
        'glow-dark': '0 0 40px rgba(79, 168, 154, 0.2)',
        'glow-green': '0 0 40px rgba(34, 197, 94, 0.15)',
        'glow-green-dark': '0 0 40px rgba(34, 197, 94, 0.25)',
        'glow-red': '0 0 40px rgba(239, 68, 68, 0.15)',
        'glow-red-dark': '0 0 40px rgba(239, 68, 68, 0.25)',
        'glow-blue': '0 0 40px rgba(59, 130, 246, 0.15)',
        'glow-blue-dark': '0 0 40px rgba(59, 130, 246, 0.25)',
        'glow-amber': '0 0 40px rgba(245, 158, 11, 0.15)',
        'glow-amber-dark': '0 0 40px rgba(245, 158, 11, 0.25)',
      },
      backdropBlur: {
        xs: '2px',
        glass: '20px',
        'glass-xl': '24px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, var(--tw-gradient-stops))',
      },
      borderRadius: {
        card: '16px',
        input: '12px',
        pill: '9999px',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
        bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        apple: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
      animation: {
        gradient: 'gradient 8s ease infinite',
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 1.5s ease-in-out infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundSize: {
        'gradient-large': '200% 200%',
      },
    },
  },
  plugins: [],
};
