/**
 * Behavioural tests for ThemeContext. AsyncStorage is mocked globally
 * (jest.setup.js → @react-native-async-storage/async-storage/jest/async-storage-mock).
 *
 * What we assert:
 *   - default accent + onboardingDone:false when storage is empty
 *   - accent rehydrates from storage on mount
 *   - onboarding-done rehydrates from storage on mount
 *   - setAccent persists to storage
 *   - setOnboardingDone persists to storage (true → 'true', false → 'false')
 *   - useTheme outside provider throws (guards against silent breakage of
 *     consumers when the provider is removed from the layout)
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';

const ACCENT_KEY = '@pasteclean/accent_color';
const ONBOARDING_KEY = '@pasteclean/onboarding_done';

// Tiny harness that exposes the context value to the test via a ref.
function Probe({ onReady }) {
  const value = useTheme();
  React.useEffect(() => {
    onReady(value);
  });
  return <Text>{value.accent}</Text>;
}

async function mount(onReady) {
  let tree;
  await act(async () => {
    tree = renderer.create(
      <ThemeProvider>
        <Probe onReady={onReady} />
      </ThemeProvider>,
    );
  });
  return tree;
}

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('ThemeContext', () => {
  it('initial defaults when storage is empty', async () => {
    let latest;
    await mount((v) => (latest = v));
    expect(latest.accent).toBe('#FF6B5C');
    expect(latest.onboardingDone).toBe(false);
    expect(latest.isReady).toBe(true);
  });

  it('rehydrates accent from AsyncStorage', async () => {
    await AsyncStorage.setItem(ACCENT_KEY, '#007AFF');
    let latest;
    await mount((v) => (latest = v));
    expect(latest.accent).toBe('#007AFF');
  });

  it('rehydrates onboardingDone=true from AsyncStorage', async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    let latest;
    await mount((v) => (latest = v));
    expect(latest.onboardingDone).toBe(true);
  });

  it('leaves onboardingDone=false for any non-"true" stored value', async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'false');
    let latest;
    await mount((v) => (latest = v));
    expect(latest.onboardingDone).toBe(false);
  });

  it('setAccent persists to AsyncStorage', async () => {
    let latest;
    await mount((v) => (latest = v));
    await act(async () => {
      latest.setAccent('#34C759');
    });
    await expect(AsyncStorage.getItem(ACCENT_KEY)).resolves.toBe('#34C759');
  });

  it('setOnboardingDone persists "true" / "false" strings', async () => {
    let latest;
    await mount((v) => (latest = v));
    await act(async () => {
      latest.setOnboardingDone(true);
    });
    await expect(AsyncStorage.getItem(ONBOARDING_KEY)).resolves.toBe('true');
    await act(async () => {
      latest.setOnboardingDone(false);
    });
    await expect(AsyncStorage.getItem(ONBOARDING_KEY)).resolves.toBe('false');
  });

  it('useTheme outside ThemeProvider throws', () => {
    // Suppress the expected error from React's console output.
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    expect(() => {
      act(() => {
        renderer.create(<Probe onReady={() => {}} />);
      });
    }).toThrow('useTheme must be used within a ThemeProvider');
    consoleError.mockRestore();
  });
});
