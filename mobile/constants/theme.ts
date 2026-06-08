/** Focuspilot light theme — aligned with client/app/globals.css :root + login page */
export const colors = {
  background: '#ffffff',
  canvas: '#f9fafb',
  surface: '#ffffff',
  surfaceElevated: '#f9fafb',
  border: '#e5e7eb',
  borderSoft: '#f3f4f6',
  text: '#111827',
  textSecondary: '#374151',
  textMuted: '#6b7280',
  /** Login / primary CTA — matches client `bg-gray-900` */
  primary: '#111827',
  primaryPressed: '#1f2937',
  primaryForeground: '#ffffff',
  /** Brand navy — `--primary` in globals.css */
  brand: '#0f172a',
  clay: '#cf7a5a',
  /** Auth wordmark curve — matches landing `text-[#E07A57]/55` */
  clayCurve: 'rgba(224, 122, 87, 0.55)',
  success: '#16a34a',
  warning: '#f59e0b',
  danger: '#dc2626',
  dangerSurface: '#fef2f2',
  white: '#ffffff',
  inputBorder: '#e5e7eb',
  inputBorderFocus: '#111827',
  /** Matches client sidebar tokens */
  sidebar: '#ffffff',
  sidebarAccent: '#f4f4f5',
  sidebarBorder: '#e4e4e7',
  sidebarMuted: '#9ca3af',
  overlay: 'rgba(15, 23, 42, 0.45)',
} as const;

export const typography = {
  title: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.5, color: colors.text },
  heading: { fontSize: 20, fontWeight: '700' as const, letterSpacing: -0.3, color: colors.text },
  subheading: { fontSize: 16, fontWeight: '600' as const, color: colors.text },
  body: { fontSize: 15, fontWeight: '400' as const, color: colors.text },
  caption: { fontSize: 13, fontWeight: '400' as const, color: colors.textMuted },
  label: { fontSize: 12, fontWeight: '600' as const, color: colors.textMuted, textTransform: 'uppercase' as const, letterSpacing: 0.6 },
} as const;

export const shadows = {
  sm: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 6,
  md: 8,
  lg: 12,
  full: 999,
} as const;
