// Dark Theme Colors
export const colors = {
  primary: '#818cf8',
  primaryDark: '#6366f1',
  primaryLight: '#a5b4fc',
  secondary: '#a78bfa',
  success: '#34d399',
  warning: '#fbbf24',
  error: '#f87171',
  info: '#60a5fa',
  
  // Background Colors
  bgPrimary: '#0f172a',
  bgSecondary: '#1e293b',
  bgTertiary: '#334155',
  
  // Text Colors
  textPrimary: '#f1f5f9',
  textSecondary: '#cbd5e1',
  textTertiary: '#94a3b8',
  
  // Neutral Colors
  gray100: '#374151',
  gray200: '#4b5563',
  gray300: '#6b7280',
  gray400: '#9ca3af',
  gray500: '#d1d5db',
  
  white: '#ffffff',
  black: '#000000',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  body: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  caption: {
    fontSize: 14,
    color: colors.textTertiary,
  },
};
