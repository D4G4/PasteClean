// Design tokens extracted from Claude Design handoff.
// Font: system default (-apple-system / SF Pro on iOS, Roboto on Android)

export const MONO_ID = '#1c1c1e';
// In dark mode, Mono flips to white-ish so the accent stays visible against
// the black page background. The stored ID stays the same (we resolve at
// render time via resolveAccent).
export const MONO_DARK = '#f5f5f7';

export const ACCENT_OPTIONS = [
  { id: '#6E55FF', name: 'Iris',    sub: 'A confident violet' },
  { id: '#007AFF', name: 'Classic', sub: 'iOS system blue' },
  { id: '#FF6B5C', name: 'Coral',   sub: 'Warm & energetic' },
  { id: '#00B894', name: 'Mint',    sub: 'Fresh & clean' },
  { id: MONO_ID,   name: 'Mono',    sub: 'Adapts to your theme' },
] as const;

export const DEFAULT_ACCENT = '#FF6B5C';

// Effective accent color to render with. Right now only Mono changes — but
// keeping this as a helper means future theme-aware accents (e.g. an "auto"
// swatch) can plug in here without touching every consumer.
export function resolveAccent(id: string, dark: boolean): string {
  if (id === MONO_ID && dark) return MONO_DARK;
  return id;
}

export function getColors(dark: boolean) {
  if (dark) {
    return {
      fg: '#FFFFFF',
      fgMuted: 'rgba(235,235,245,0.6)',
      fgFaint: 'rgba(235,235,245,0.3)',
      bg: '#000000',
      surface: '#1C1C1E',
      cardBg: '#1C1C1E',
      sep: 'rgba(84,84,88,0.5)',
      toolBg: '#1C1C1E',
      toolBtn: '#2C2C2E',
      toolActive: 'rgba(255,255,255,0.18)',
      fieldLabel: 'rgba(235,235,245,0.55)',
      tabInactive: 'rgba(235,235,245,0.45)',
      tabBarBg: 'rgba(28,28,30,0.85)',
      success: '#30D158',
      danger: '#FF453A',
      warning: '#FFD60A',
      warningBg: 'rgba(255,204,0,0.18)',
      warningText: '#FFD60A',
      successBg: 'rgba(52,199,89,0.18)',
      successText: '#30D158',
    };
  }
  return {
    fg: '#1C1C1E',
    fgMuted: 'rgba(60,60,67,0.6)',
    fgFaint: 'rgba(60,60,67,0.3)',
    bg: '#FFFFFF',
    surface: '#F2F2F7',
    cardBg: '#FFFFFF',
    sep: 'rgba(60,60,67,0.18)',
    toolBg: '#F6F6F8',
    toolBtn: 'transparent',
    toolActive: 'rgba(0,0,0,0.08)',
    fieldLabel: 'rgba(60,60,67,0.6)',
    tabInactive: 'rgba(60,60,67,0.55)',
    tabBarBg: 'rgba(255,255,255,0.85)',
    success: '#34C759',
    danger: '#FF3B30',
    warning: '#FFCC00',
    warningBg: 'rgba(255,204,0,0.18)',
    warningText: '#9A6700',
    successBg: 'rgba(52,199,89,0.12)',
    successText: '#248A3D',
  };
}

export type ColorTokens = ReturnType<typeof getColors>;

// Legacy export for existing components that still import the old way
export default {
  light: {
    text: '#1C1C1E',
    textSecondary: 'rgba(60,60,67,0.6)',
    background: '#FFFFFF',
    surface: '#F2F2F7',
    tint: '#007AFF',
    tabIconDefault: 'rgba(60,60,67,0.55)',
    tabIconSelected: '#007AFF',
    border: 'rgba(60,60,67,0.18)',
    success: '#34C759',
    danger: '#FF3B30',
    warning: '#FF9500',
  },
  dark: {
    text: '#FFFFFF',
    textSecondary: 'rgba(235,235,245,0.6)',
    background: '#000000',
    surface: '#1C1C1E',
    tint: '#0A84FF',
    tabIconDefault: 'rgba(235,235,245,0.45)',
    tabIconSelected: '#0A84FF',
    border: 'rgba(84,84,88,0.5)',
    success: '#30D158',
    danger: '#FF453A',
    warning: '#FF9F0A',
  },
};
