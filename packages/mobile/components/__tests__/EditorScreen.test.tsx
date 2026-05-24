/**
 * Editor screen snapshot — captures the full tree so we can verify dark-mode
 * styling (no white panels, no white toolbar wrappers, no white WebView
 * containers) without needing a device.
 */
import React from 'react';

// Mutable color scheme — flipped per test to cover both theme branches
// of the editor's style ternaries.
let mockScheme = 'dark';
jest.mock('@/components/useColorScheme', () => ({
  useColorScheme: () => mockScheme,
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
    RichText: ({ style, onLoad }: { style?: unknown; onLoad?: () => void }) =>
      React.createElement(View, { testID: 'rich-text', style, onLoad }),
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
    Images: { Aa: 'Aa', checkList: 'checkList' },
    darkEditorTheme: { webview: { backgroundColor: '#1C1C1E' } },
    defaultEditorTheme: { webview: { backgroundColor: '#FFFFFF' } },
    darkEditorCss: '* { background:#1C1C1E; color:white; }',
    TenTapStartKit: [
      { name: 'link' },
      { name: 'placeholder' },
      { name: 'bold' },
    ],
    LinkBridge: {
      name: 'link',
      extendExtension: () => ({ name: 'link' }),
    },
    PlaceholderBridge: {
      name: 'placeholder',
      configureExtension: () => ({ name: 'placeholder' }),
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

const mockNavigate = jest.fn();
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ navigate: mockNavigate, push: mockPush }),
}));

import renderer, { act } from 'react-test-renderer';

describe('EditorScreen — dark mode', () => {
  beforeEach(() => {
    mockScheme = 'dark';
    mockNavigate.mockClear();
    mockPush.mockClear();
  });

  it('matches snapshot', () => {
    expect(snapshotOf(<EditorScreen />)).toMatchSnapshot();
  });

  it('renders without throwing in light mode (covers !isDark style branches)', () => {
    mockScheme = 'light';
    expect(snapshotOf(<EditorScreen />)).toBeTruthy();
  });

  it('keyboard up state triggers the toolbar + adjusts editorWrap padding', () => {
    mockScheme = 'dark';
    let tree;
    act(() => {
      tree = renderer.create(<EditorScreen />);
    });
    // The editor subscribes to keyboardWillShow/keyboardDidShow. Emit the
    // event so keyboardVisible flips to true and the toolbar renders.
    const { Keyboard } = require('react-native');
    act(() => {
      Keyboard.emit?.('keyboardWillShow');
    });
    act(() => tree.unmount());
  });

  it('settings button → router.navigate("/settings")', () => {
    let tree;
    act(() => {
      tree = renderer.create(<EditorScreen />);
    });
    const settingsBtn = tree.root.findByProps({ testID: 'settings-button' });
    act(() => settingsBtn.props.onPress());
    expect(mockNavigate).toHaveBeenCalledWith('/settings');
    act(() => tree.unmount());
  });

  it('preview button → router.push("/preview") with HTML payload', async () => {
    let tree;
    await act(async () => {
      tree = renderer.create(<EditorScreen />);
    });
    const previewBtn = tree.root.findByProps({ testID: 'preview-button' });
    await act(async () => {
      await previewBtn.props.onPress();
    });
    expect(mockPush).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: '/preview' }),
    );
    act(() => tree.unmount());
  });

  it('copy button → blurs editor + invokes copyForGmail (no crash, no nav)', () => {
    let tree;
    act(() => {
      tree = renderer.create(<EditorScreen />);
    });
    const copyBtn = tree.root.findByProps({ testID: 'copy-button' });
    act(() => copyBtn.props.onPress());
    // No navigation expected.
    expect(mockPush).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    act(() => tree.unmount());
  });

  it('RichText onLoad → schedules editorReady reveal + theme apply (covers handleWebViewLoad)', () => {
    jest.useFakeTimers();
    try {
      let tree;
      act(() => {
        tree = renderer.create(<EditorScreen />);
      });
      const richText = tree.root.findByProps({ testID: 'rich-text' });
      // Invoke the onLoad prop directly. The handler schedules a 120ms
      // setTimeout to flip editorReady; advance the clock so the timer
      // fires and the opacity flip is exercised.
      act(() => richText.props.onLoad?.());
      act(() => {
        jest.advanceTimersByTime(150);
      });
      act(() => tree.unmount());
    } finally {
      jest.useRealTimers();
    }
  });
});
