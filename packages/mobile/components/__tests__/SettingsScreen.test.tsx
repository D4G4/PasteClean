/**
 * Snapshot tests for the Settings screen. Verifies the rendered tree in both
 * light and dark mode. Gorhom + gesture-handler are stubbed globally by
 * jest.setup.js, so PipelineSheet (rendered inside Settings) collapses to a
 * plain mock View tree — fine for snapshot drift detection at the screen
 * level; the sheet's gesture wiring is exercised by Maestro flow 07.
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';

// Mutable flag controls which scheme the mocked hook returns. Set before
// each renderSnapshot(). We deliberately avoid jest.resetModules() — that
// would tear down React mid-suite and the next useState() throws "Cannot
// read properties of null".
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
});
