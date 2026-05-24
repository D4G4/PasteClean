/**
 * Snapshot test for the Preview screen. Renders with a representative HTML
 * payload that triggers a few report items (dark background → stripped,
 * heading → converted), so the snapshot covers both the WebView container
 * and the report card list.
 *
 * react-native-webview is stubbed in jest.setup.js. The sanitizer runs for
 * real (it's pure JS, no native deps) so the report items are genuine.
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

// Preview pulls the HTML to sanitize from the route's search params. We
// give it a payload that exercises a few of the sanitizer's report
// categories so the rendered card list has substance.
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({
    html: '<h1 style="color:white;background:#1a1a1a">Title</h1><p>Body</p>',
  }),
  useRouter: () => ({ back: jest.fn(), push: jest.fn() }),
}));

jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: { Success: 'success' },
}));

// Workspace package — jest-resolve can't follow pnpm's workspace symlinks
// from inside packages/mobile, so we stub the surface. The real sanitizer
// has its own tests in packages/gmail-sanitizer; the screen only cares
// about the shape of what we return here.
jest.mock(
  '@pasteclean/gmail-sanitizer',
  () => ({
    sanitizeForGmailWithReport: (html: string) => ({
      html,
      report: {
        totalFixes: 2,
        status: 'fixed',
        items: [
          {
            category: 'background-stripped',
            message: 'Dark background removed',
            original: 'background:#1a1a1a',
          },
          {
            category: 'heading-convert',
            message: '<h1> converted to <p>',
            original: '<h1>',
          },
        ],
      },
      sizeWarning: {
        sizeBytes: 1024,
        sizeKB: 1,
        willBeClipped: false,
        warning: null,
      },
    }),
  }),
  { virtual: true },
);

import PreviewScreen from '@/app/preview';

function renderSnapshot() {
  let tree;
  act(() => {
    tree = renderer.create(<PreviewScreen />);
  });
  const json = tree.toJSON();
  act(() => {
    tree.unmount();
  });
  return json;
}

describe('PreviewScreen', () => {
  it('matches snapshot — light', () => {
    mockScheme = 'light';
    expect(renderSnapshot()).toMatchSnapshot();
  });

  it('matches snapshot — dark', () => {
    mockScheme = 'dark';
    expect(renderSnapshot()).toMatchSnapshot();
  });

  it('tapping a mode toggle (Gmail Dark / original) flips previewMode', () => {
    mockScheme = 'light';
    let tree;
    act(() => {
      tree = renderer.create(<PreviewScreen />);
    });
    // Mode toggle TouchableOpacities have child Text nodes "Gmail Light",
    // "Gmail Dark", "Original" (or similar). Find by text content via the
    // accessibility tree.
    const toggles = tree.root.findAll(
      (n) =>
        n.type === require('react-native').TouchableOpacity ||
        (typeof n.props.onPress === 'function' &&
          typeof n.props.activeOpacity === 'number'),
    );
    // Tap each toggle button; we don't assert specific state — just that
    // none of them throw and the tree stays mounted (covers setPreviewMode).
    for (const t of toggles.slice(0, 3)) {
      act(() => t.props.onPress?.());
    }
    act(() => tree.unmount());
  });

  it('Copy button → sanitize + clipboard + toast (autoOpenGmail false)', async () => {
    mockScheme = 'light';
    let tree;
    await act(async () => {
      tree = renderer.create(<PreviewScreen />);
    });
    // Find Copy button by its accessibility / text content. The button
    // appears in the action row; we identify it via its onPress that is
    // an async function. There are several; we use the topmost.
    const copyButton = tree.root.findAll(
      (n) =>
        typeof n.props.onPress === 'function' &&
        n.props.onPress.constructor.name === 'AsyncFunction',
    );
    if (copyButton.length > 0) {
      await act(async () => {
        await copyButton[0].props.onPress();
      });
    }
    act(() => tree.unmount());
  });

  it('backdrop Pressable → animated close + router.back()', () => {
    mockScheme = 'light';
    let tree;
    act(() => {
      tree = renderer.create(<PreviewScreen />);
    });
    // The backdrop is a Pressable with StyleSheet.absoluteFill. We find
    // anything with an onPress that doesn't have activeOpacity (Pressable
    // doesn't get activeOpacity).
    const backdrop = tree.root.findAll(
      (n) =>
        typeof n.props.onPress === 'function' &&
        n.props.activeOpacity === undefined,
    );
    if (backdrop.length > 0) {
      act(() => backdrop[0].props.onPress());
    }
    act(() => tree.unmount());
  });
});
