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
        // BoardTAU Green Theme - used by default (RGB for user/landlord side)
        primary: {
          DEFAULT: 'rgb(47, 125, 109)', // #2f7d6d
          foreground: 'rgb(248, 250, 249)',
          hover: 'rgb(38, 101, 88)',
          light: 'rgb(216, 230, 227)',
          dark: 'rgb(30, 81, 70)',
        },
        secondary: {
          DEFAULT: 'rgb(243, 244, 246)',
          foreground: 'rgb(17, 24, 39)',
        },
        accent: {
          DEFAULT: 'rgb(47, 125, 109)', // #2f7d6d
          foreground: 'rgb(248, 250, 249)',
        },
        background: 'rgb(var(--background-rgb))',
        foreground: 'rgb(var(--foreground-rgb))',
        card: 'rgb(var(--surface-rgb))',
        'card-foreground': 'rgb(var(--foreground-rgb))',
        popover: 'rgb(var(--surface-rgb))',
        'popover-foreground': 'rgb(var(--foreground-rgb))',
        muted: {
          DEFAULT: 'rgb(243, 244, 246)',
          foreground: 'rgb(107, 114, 128)',
        },
        destructive: {
          DEFAULT: 'rgb(239, 68, 68)',
          foreground: 'rgb(248, 250, 249)',
        },
        border: 'rgb(var(--border-rgb))',
        input: 'rgb(var(--border-rgb))',
        ring: 'rgb(47, 125, 109)', // #2f7d6d
        sidebar: 'rgb(var(--surface-rgb))',
        'sidebar-foreground': 'rgb(var(--foreground-rgb))',
        'sidebar-primary': 'rgb(47, 125, 109)', // #2f7d6d
        'sidebar-primary-foreground': 'rgb(248, 250, 249)',
        'sidebar-accent': 'rgb(47, 125, 109)', // #2f7d6d
        'sidebar-accent-foreground': 'rgb(248, 250, 249)',
        'sidebar-border': 'rgb(var(--border-rgb))',
        'sidebar-ring': 'rgb(47, 125, 109)', // #2f7d6d
        chart: {
          1: 'rgb(47, 125, 109)', // Green
          2: 'rgb(59, 130, 246)', // Blue
          3: 'rgb(249, 115, 22)', // Orange
          4: 'rgb(107, 114, 128)', // Gray
          5: 'rgb(229, 231, 235)', // Light gray
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
        serif: ['var(--font-serif)', 'serif'],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
      boxShadow: {
        '2xs': 'var(--shadow-2xs)',
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
        hover: 'var(--shadow-hover)',
      },
      letterSpacing: {
        tighter: 'var(--tracking-tighter)',
        tight: 'var(--tracking-tight)',
        normal: 'var(--tracking-normal)',
        wide: 'var(--tracking-wide)',
        wider: 'var(--tracking-wider)',
        widest: 'var(--tracking-widest)',
      },
      fontSize: {
        hero: ['clamp(2.25rem, 5vw, 3.5rem)', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        section: ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        'body-lg': ['1.0625rem', { lineHeight: '1.6' }],
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
  plugins: [require('tailwindcss-animate')],
};
