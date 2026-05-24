/**
 * Snapshot tests for the Settings screen. Verifies the rendered tree in both
 * light and dark mode. "How It Works" navigation is via router.push to the
 * formSheet Stack route — the row tap is asserted by spying on the router.
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';

let mockScheme = 'light';
jest.mock('@/components/useColorScheme', () => ({
  useColorScheme: () => mockScheme,
}));

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

const mockRouterPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockRouterPush }),
}));

import SettingsScreen from '@/app/settings';

function renderSnapshot() {
  let tree;
  act(() => {
    tree = renderer.create(<SettingsScreen />);
  });
  const json = tree.toJSON();
  act(() => {
    tree.unmount();
  });
  return json;
}

describe('SettingsScreen', () => {
  it('matches snapshot — light', () => {
    mockScheme = 'light';
    expect(renderSnapshot()).toMatchSnapshot();
  });

  it('matches snapshot — dark', () => {
    mockScheme = 'dark';
    expect(renderSnapshot()).toMatchSnapshot();
  });

  it('tapping "How It Works" navigates to /how-it-works (formSheet route)', () => {
    mockScheme = 'light';
    mockRouterPush.mockClear();
    let tree;
    act(() => {
      tree = renderer.create(<SettingsScreen />);
    });
    const row = tree.root.findByProps({ testID: 'how-it-works-row' });
    act(() => row.props.onPress());
    expect(mockRouterPush).toHaveBeenCalledWith('/how-it-works');
    act(() => tree.unmount());
  });

  it('Version row has no onPress (display-only)', () => {
    mockScheme = 'light';
    let tree;
    act(() => {
      tree = renderer.create(<SettingsScreen />);
    });
    const version = tree.root.findAll((n) => n.props.title === 'Version');
    expect(version[0].props.onPress).toBeUndefined();
    expect(version[0].props.detail).toMatch(/^\d+\.\d+\.\d+$/);
    act(() => tree.unmount());
  });

  // NOTE: this test reassigns Linking.openURL to a stub that returns a
  // pending Promise. The microtask resolution can lands during a SUBSEQUENT
  // test's render and cause react-test-renderer to mark its tree
  // unmounted, breaking that test. Keeping this last in the file
  // sidesteps the ordering issue without inventing a microtask flush
  // that doesn't fully work.
  it('tapping "Send Feedback" opens the GitHub issue URL', () => {
    const { Linking } = require('react-native');
    const orig = Linking.openURL;
    const calls = [];
    Linking.openURL = (url) => {
      calls.push(url);
      return Promise.resolve(true);
    };
    try {
      mockScheme = 'light';
      let tree;
      act(() => {
        tree = renderer.create(<SettingsScreen />);
      });
      const feedback = tree.root.findAll(
        (n) => n.props.title === 'Send Feedback',
      );
      act(() => feedback[0].props.onPress());
      expect(calls[0]).toContain('github.com/D4G4/PasteClean/issues/new');
      act(() => tree.unmount());
    } finally {
      Linking.openURL = orig;
    }
  });
});
