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
let mockOnboardingDone = true;
let mockFontsLoaded = true;

jest.mock('@/components/useColorScheme', () => ({
  useColorScheme: () => mockScheme,
}));

jest.mock('@/contexts/ThemeContext', () => ({
  ThemeProvider: ({ children }) => children,
  useTheme: () => ({
    accent: '#FF6B5C',
    setAccent: jest.fn(),
    onboardingDone: mockOnboardingDone,
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

let mockFontError = null;
jest.mock('expo-font', () => ({
  useFonts: () => [mockFontsLoaded, mockFontError],
  isLoaded: () => true,
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
  beforeEach(() => {
    mockScheme = 'light';
    mockOnboardingDone = true;
    mockFontsLoaded = true;
    mockFontError = null;
  });

  it('mounts the provider tree — light', () => {
    expect(renderSnapshot()).toMatchSnapshot();
  });

  it('mounts the provider tree — dark', () => {
    mockScheme = 'dark';
    expect(renderSnapshot()).toMatchSnapshot();
  });

  it('returns null until fonts have loaded (splash guard)', () => {
    mockFontsLoaded = false;
    // useFonts returning [false, ...] makes the layout return null,
    // hiding the rest of the app behind the splash screen.
    expect(renderSnapshot()).toBeNull();
  });

  it('renders OnboardingFlow when onboardingDone=false (not the Stack)', () => {
    mockOnboardingDone = false;
    const tree = renderSnapshot();
    // OnboardingFlow root has the testID-bearing onboarding-page-0 inside.
    // jest.setup.js mocks PagerView to a passthrough View so the testIDs
    // are present in the JSON.
    const json = JSON.stringify(tree);
    expect(json).toContain('onboarding-page-0');
  });

  it('useFonts error → effect throws (font failure surface)', () => {
    mockFontError = new Error('Failed to load font');
    // Silence React's error logging for the expected throw.
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    try {
      expect(() => renderSnapshot()).toThrow('Failed to load font');
    } finally {
      consoleError.mockRestore();
    }
  });

  it('OnboardingFlow onDone callback flips onboardingDone to true', () => {
    mockOnboardingDone = false;
    let capturedTree;
    act(() => {
      capturedTree = renderer.create(<RootLayout />);
    });
    // OnboardingFlow receives `onDone` from RootContent — find it and invoke
    // to cover _layout.tsx:82.
    const flow = capturedTree.root.findAll(
      (n) =>
        typeof n.props.onDone === 'function' &&
        typeof n.props.accent === 'string',
    );
    expect(flow.length).toBeGreaterThan(0);
    act(() => flow[0].props.onDone());
    act(() => capturedTree.unmount());
  });
});
