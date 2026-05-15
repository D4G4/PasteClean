/**
 * Editor screen snapshot — captures the full tree so we can verify dark-mode
 * styling (no white panels, no white toolbar wrappers, no white WebView
 * containers) without needing a device.
 */
import React from 'react';

// Force dark mode via the useColorScheme alias mock.
jest.mock('@/components/useColorScheme', () => ({
  useColorScheme: () => 'dark',
}));

// Workspace package — irrelevant to layout. Stub the sanitizer call so we
// don't have to resolve the gmail-sanitizer build output. `virtual: true`
// because Jest can't find the package via its module resolver.
jest.mock(
  '@pasteclean/gmail-sanitizer',
  () => ({ sanitizeForGmail: (html: string) => html }),
  { virtual: true },
);

// TenTap's WebView-backed editor relies on native modules; stub it to a plain
// View so we can snapshot the surrounding chrome.
jest.mock('@10play/tentap-editor', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    RichText: ({ style }: { style?: unknown }) =>
      React.createElement(View, { testID: 'rich-text', style }),
    Toolbar: () => React.createElement(View, { testID: 'toolbar' }),
    useEditorBridge: () => ({
      getHTML: async () => '',
      injectCSS: () => {},
      injectJS: () => {},
      setPlaceholder: () => {},
      setLink: () => {},
      blur: () => {},
    }),
    useBridgeState: () => ({ isReady: true }),
    DEFAULT_TOOLBAR_ITEMS: [],
    darkEditorTheme: { webview: { backgroundColor: '#1C1C1E' } },
    defaultEditorTheme: { webview: { backgroundColor: '#FFFFFF' } },
    darkEditorCss: '* { background:#1C1C1E; color:white; }',
    TenTapStartKit: [{ name: 'link' }],
    LinkBridge: {
      name: 'link',
      extendExtension: () => ({ name: 'link' }),
    },
  };
});

// ThemeProvider does an async AsyncStorage load and returns null until
// ready. Bypass that for tests by mocking useTheme directly with a static
// value so the editor renders synchronously.
jest.mock('@/contexts/ThemeContext', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
  useTheme: () => ({
    accent: '#FF6B5C',
    setAccent: () => {},
    onboardingDone: true,
    setOnboardingDone: () => {},
    isReady: true,
  }),
}));

import EditorScreen from '@/app/(tabs)/index';
import { snapshotOf } from '../onboarding/test-utils';

describe('EditorScreen — dark mode', () => {
  it('matches snapshot', () => {
    expect(snapshotOf(<EditorScreen />)).toMatchSnapshot();
  });
});
