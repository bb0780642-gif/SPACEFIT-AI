/**
 * SpaceFit AI Design System Tokens
 * Strict adherence to:
 * - Primary background: deep midnight navy (#070B14, #0A0F1D)
 * - Secondary surfaces: layered dark blue and charcoal (#0D1322, #131C31, #18223C)
 * - Primary accent: electric blue (#3B82F6, #2563EB, #60A5FA)
 * - Secondary accent: elegant violet (#8B5CF6, #7C3AED, #A78BFA)
 * - Text: high-contrast white (#F8FAFC) and soft gray (#94A3B8, #64748B)
 * - Borders: subtle, low-contrast blue-gray (rgba(59, 130, 246, 0.12), rgba(148, 163, 184, 0.14))
 */

export const THEME_COLORS = {
  background: {
    primary: '#070B14',
    secondary: '#0D1322',
    tertiary: '#111827',
  },
  surface: {
    base: '#131C31',
    hover: '#18243E',
    active: '#1D2C4D',
    subtle: 'rgba(19, 28, 49, 0.65)',
    card: '#0E1729',
    cardBorder: 'rgba(59, 130, 246, 0.12)',
  },
  accent: {
    blue: {
      default: '#3B82F6',
      hover: '#2563EB',
      light: '#60A5FA',
      glow: 'rgba(59, 130, 246, 0.35)',
      soft: 'rgba(59, 130, 246, 0.12)',
    },
    violet: {
      default: '#8B5CF6',
      hover: '#7C3AED',
      light: '#A78BFA',
      glow: 'rgba(139, 92, 246, 0.35)',
      soft: 'rgba(139, 92, 246, 0.12)',
    },
    cyan: '#06B6D4',
    emerald: '#10B981',
    amber: '#F59E0B',
    rose: '#F43F5E',
  },
  text: {
    primary: '#F8FAFC',
    secondary: '#94A3B8',
    muted: '#64748B',
    accent: '#60A5FA',
    inverted: '#070B14',
  },
  border: {
    subtle: 'rgba(59, 130, 246, 0.12)',
    hover: 'rgba(59, 130, 246, 0.28)',
    active: 'rgba(59, 130, 246, 0.45)',
    divider: 'rgba(148, 163, 184, 0.08)',
  },
} as const

export const SHADOWS = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.3)',
  glowBlue: '0 0 25px -4px rgba(59, 130, 246, 0.35)',
  glowViolet: '0 0 25px -4px rgba(139, 92, 246, 0.35)',
  glowCombined: '0 0 35px -5px rgba(59, 130, 246, 0.25), 0 0 20px -5px rgba(139, 92, 246, 0.25)',
} as const

export const TRANSITIONS = {
  fast: '150ms cubic-bezier(0.16, 1, 0.3, 1)',
  normal: '250ms cubic-bezier(0.16, 1, 0.3, 1)',
  slow: '400ms cubic-bezier(0.16, 1, 0.3, 1)',
} as const
