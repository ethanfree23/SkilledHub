/** Align with web Tailwind-ish grays and TechFlash brand */
export const colors = {
  bg: '#F9FAFB',
  bgElevated: '#FFFFFF',
  white: '#FFFFFF',
  text: '#111827',
  muted: '#6B7280',
  primaryOrange: '#FE6711',
  primaryOrangeDark: '#e55a0a',
  primaryBlue: '#2563EB',
  primaryBlueMuted: '#EFF6FF',
  primaryBlueDark: '#1D4ED8',
  border: '#E5E7EB',
  danger: '#DC2626',
  dangerBg: '#FEE2E2',
  warningBg: '#FFFBEB',
  warningBorder: '#FDE68A',
  success: '#059669',
  tabInactive: '#6B7280',
  tabActive: '#2563EB',
};

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
};

export const typography = {
  title: { fontSize: 26, fontWeight: '700' as const, color: colors.text, lineHeight: 32 },
  heading: { fontSize: 19, fontWeight: '700' as const, color: colors.text, lineHeight: 24 },
  body: { fontSize: 16, color: colors.text, lineHeight: 22 },
  caption: { fontSize: 12, fontWeight: '600' as const, color: colors.muted, letterSpacing: 0.5, lineHeight: 16 },
};
