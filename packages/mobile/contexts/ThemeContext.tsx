// Provides accent color globally. Persists to AsyncStorage.
// Usage: const { accent, setAccent } = useTheme();

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCENT_KEY = '@pasteclean/accent_color';
const ONBOARDING_KEY = '@pasteclean/onboarding_done';
const DEFAULT_ACCENT = '#FF6B5C';

interface ThemeContextValue {
  accent: string;
  setAccent: (color: string) => void;
  onboardingDone: boolean;
  setOnboardingDone: (done: boolean) => void;
  isReady: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [accent, setAccentState] = useState(DEFAULT_ACCENT);
  const [onboardingDone, setOnboardingDoneState] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [storedAccent, storedOnboarding] = await Promise.all([
          AsyncStorage.getItem(ACCENT_KEY),
          AsyncStorage.getItem(ONBOARDING_KEY),
        ]);
        if (storedAccent) setAccentState(storedAccent);
        if (storedOnboarding === 'true') setOnboardingDoneState(true);
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  const setAccent = useCallback((color: string) => {
    setAccentState(color);
    AsyncStorage.setItem(ACCENT_KEY, color);
  }, []);

  const setOnboardingDone = useCallback((done: boolean) => {
    setOnboardingDoneState(done);
    AsyncStorage.setItem(ONBOARDING_KEY, done ? 'true' : 'false');
  }, []);

  if (!isReady) return null;

  return (
    <ThemeContext.Provider
      value={{ accent, setAccent, onboardingDone, setOnboardingDone, isReady }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
