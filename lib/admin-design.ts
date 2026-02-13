// Admin Dashboard Design System
// Based on Horizon UI design principles

// Color Palette - Modern & Professional
export const adminColors = {
  // Primary Colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Main Blue
    600: '#2563eb',
    700: '#1d4ed8', // Used for primary buttons
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // Secondary Colors
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155', // Used for text
    800: '#1e293b',
    900: '#0f172a', // Dark background
  },

  // Success Colors (Green)
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  // Warning Colors (Orange)
  warning: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },

  // Error Colors (Red)
  error: {
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
  },

  // Neutral Colors (Grayscale)
  neutral: {
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
  },

  // Special Colors
  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
  },

  teal: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6',
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
  },

  cyan: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
  },
};

// Typography System
export const adminTypography = {
  // Headings
  heading: {
    h1: {
      fontSize: '2.5rem', // 40px
      fontWeight: 700,
      lineHeight: '1.2',
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2rem', // 32px
      fontWeight: 700,
      lineHeight: '1.2',
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.5rem', // 24px
      fontWeight: 600,
      lineHeight: '1.3',
      letterSpacing: '0',
    },
    h4: {
      fontSize: '1.25rem', // 20px
      fontWeight: 600,
      lineHeight: '1.4',
      letterSpacing: '0',
    },

    // Subheadings
    sub1: {
      fontSize: '1.125rem', // 18px
      fontWeight: 500,
      lineHeight: '1.5',
      letterSpacing: '0',
    },
    sub2: {
      fontSize: '1rem', // 16px
      fontWeight: 500,
      lineHeight: '1.5',
      letterSpacing: '0',
    },
  },

  // Body Text
  body: {
    lg: {
      fontSize: '1.125rem', // 18px
      fontWeight: 400,
      lineHeight: '1.7',
      letterSpacing: '0',
    },
    base: {
      fontSize: '1rem', // 16px
      fontWeight: 400,
      lineHeight: '1.6',
      letterSpacing: '0',
    },
    sm: {
      fontSize: '0.875rem', // 14px
      fontWeight: 400,
      lineHeight: '1.5',
      letterSpacing: '0',
    },
    xs: {
      fontSize: '0.75rem', // 12px
      fontWeight: 400,
      lineHeight: '1.4',
      letterSpacing: '0',
    },
  },

  // Labels
  label: {
    lg: {
      fontSize: '0.875rem', // 14px
      fontWeight: 500,
      lineHeight: '1.4',
      letterSpacing: '0',
    },
    base: {
      fontSize: '0.8125rem', // 13px
      fontWeight: 500,
      lineHeight: '1.4',
      letterSpacing: '0',
    },
    sm: {
      fontSize: '0.75rem', // 12px
      fontWeight: 500,
      lineHeight: '1.4',
      letterSpacing: '0',
    },
    xs: {
      fontSize: '0.625rem', // 10px
      fontWeight: 500,
      lineHeight: '1.4',
      letterSpacing: '0',
    },
  },

  // Display
  display: {
    xl: {
      fontSize: '3rem', // 48px
      fontWeight: 700,
      lineHeight: '1.1',
      letterSpacing: '-0.03em',
    },
    lg: {
      fontSize: '2.5rem', // 40px
      fontWeight: 700,
      lineHeight: '1.15',
      letterSpacing: '-0.02em',
    },
    md: {
      fontSize: '2rem', // 32px
      fontWeight: 700,
      lineHeight: '1.2',
      letterSpacing: '-0.01em',
    },
  },
};

// Spacing System (4px grid)
export const adminSpacing = {
  xs: '0.25rem', // 4px
  sm: '0.5rem', // 8px
  md: '1rem', // 16px
  lg: '1.5rem', // 24px
  xl: '2rem', // 32px
  '2xl': '3rem', // 48px
  '3xl': '4rem', // 64px
  '4xl': '6rem', // 96px
};

// Border Radius
export const adminBorderRadius = {
  xs: '0.125rem', // 2px
  sm: '0.25rem', // 4px
  md: '0.375rem', // 6px
  lg: '0.5rem', // 8px
  xl: '0.75rem', // 12px
  '2xl': '1rem', // 16px
  '3xl': '1.5rem', // 24px
};

// Shadows
export const adminShadows = {
  soft: '0 2px 8px rgba(0, 0, 0, 0.06)',
  medium: '0 4px 20px rgba(0, 0, 0, 0.08)',
  lgSoft: '0 8px 32px rgba(0, 0, 0, 0.1)',
  hover: '0 12px 40px rgba(0, 0, 0, 0.12)',
  glow: '0 0 40px rgba(59, 130, 246, 0.15)',
  glowDark: '0 0 40px rgba(59, 130, 246, 0.2)',
  glass: '0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
  glassDark: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
};

// Z-Index Values
export const adminZIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
};

// Breakpoints for Responsive Design
export const adminBreakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Spinner Sizes
export const adminSpinnerSizes = {
  xs: '0.75rem', // 12px
  sm: '1rem', // 16px
  md: '1.5rem', // 24px
  lg: '2rem', // 32px
  xl: '3rem', // 48px
};

// Card Styles
export const adminCardStyles = {
  default: 'bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700',
  elevated: 'bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700',
  ghost: 'bg-transparent rounded-xl border border-gray-200 dark:border-slate-700',
};

// Button Styles
export const adminButtonStyles = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
  secondary: 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
  success: 'bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
  warning: 'bg-yellow-600 text-white hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
  error: 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
  ghost: 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
};

// Input Styles
export const adminInputStyles = {
  default: 'w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
  borderless: 'w-full px-4 py-2 bg-transparent border-b border-gray-200 dark:border-slate-700 focus:outline-none focus:border-blue-500 focus:ring-0',
  textarea: 'w-full p-4 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
};

// Badge Styles
export const adminBadgeStyles = {
  primary: 'px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-xs font-medium',
  success: 'px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-medium',
  warning: 'px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full text-xs font-medium',
  error: 'px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs font-medium',
  neutral: 'px-3 py-1 bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-gray-400 rounded-full text-xs font-medium',
};

// Avatar Sizes
export const adminAvatarSizes = {
  xs: 'w-6 h-6', // 24px
  sm: 'w-8 h-8', // 32px
  md: 'w-10 h-10', // 40px
  lg: 'w-12 h-12', // 48px
  xl: 'w-16 h-16', // 64px
};
