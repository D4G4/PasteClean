/**
 * Root layout snapshot. Mostly proves the provider tree mounts without
 * throwing under jest-expo. Drift here would catch a provider reorder or
 * a missing required wrapper before the app boots on a sim.
 *
 * expo-font's useFonts is mocked to return [true, null] so the layout
 * skips the SplashScreen guard and renders the Stack.
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';

let mockScheme = 'light';
jest.mock('@/components/useColorScheme', () => ({
  useColorScheme: () => mockScheme,
}));

// Pretend onboarding is done so we render the Stack (not OnboardingFlow).
jest.mock('@/contexts/ThemeContext', () => ({
  ThemeProvider: ({ children }) => children,
  useTheme: () => ({
    accent: '#FF6B5C',
    setAccent: jest.fn(),
    onboardingDone: true,
    setOnboardingDone: jest.fn(),
    isReady: true,
  }),
}));

// Stack/Stack.Screen from expo-router are TurboModule-backed in production;
// in Jest they need a passthrough that just renders children. We don't care
// about navigation behavior in this snapshot.
jest.mock('expo-router', () => {
  const React = require('react');
  const { View } = require('react-native');
  const Stack = ({ children }) =>
    React.createElement(View, { testID: 'mock-stack' }, children);
  Stack.Screen = () => null;
  return {
    Stack,
    Link: ({ children }) => children,
    ErrorBoundary: ({ children }) => children,
  };
});

jest.mock('expo-font', () => ({
  useFonts: () => [true, null],
}));

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
}));

import RootLayout from '@/app/_layout';

function renderSnapshot() {
  let tree;
  act(() => {
    tree = renderer.create(<RootLayout />);
  });
  const json = tree.toJSON();
  act(() => {
    tree.unmount();
  });
  return json;
}

describe('RootLayout', () => {
  it('mounts the provider tree — light', () => {
    mockScheme = 'light';
    expect(renderSnapshot()).toMatchSnapshot();
  });

  it('mounts the provider tree — dark', () => {
    mockScheme = 'dark';
    expect(renderSnapshot()).toMatchSnapshot();
  });
});
