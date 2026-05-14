import { useColorScheme } from '@/components/useColorScheme';

// Centralized palette for onboarding chrome. Surfaces (pageBg, surface,
// surface2), ink colors, and borders flip between light and dark modes.
//
// Note: the Gmail message mocks (Problem, Vanish, Fixed) intentionally do
// NOT follow these tokens — those are renderings of real Gmail, so their
// colors stay fixed to mimic Gmail's actual light theme regardless of the
// app's mode.
export interface OnbTokens {
  pageBg: string;
  surface: string;
  surface2: string;
  ink: string;
  inkMuted: string;
  inkFaint: string;
  border: string;
  borderFaint: string;
  rowHover: string;
}

export function tokens(dark: boolean): OnbTokens {
  return {
    pageBg: dark ? '#000' : '#fff',
    surface: dark ? '#1c1c1e' : '#fff',
    surface2: dark ? '#2c2c2e' : '#f2f2f7',
    ink: dark ? '#fff' : '#1c1c1e',
    inkMuted: dark ? 'rgba(235,235,245,0.65)' : 'rgba(60,60,67,0.72)',
    inkFaint: dark ? 'rgba(235,235,245,0.4)' : 'rgba(60,60,67,0.5)',
    border: dark ? 'rgba(255,255,255,0.08)' : 'rgba(60,60,67,0.18)',
    borderFaint: dark ? 'rgba(255,255,255,0.06)' : 'rgba(60,60,67,0.1)',
    rowHover: dark ? 'rgba(255,255,255,0.06)' : 'rgba(60,60,67,0.06)',
  };
}

export function useTokens(): { dark: boolean; t: OnbTokens } {
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  return { dark, t: tokens(dark) };
}
