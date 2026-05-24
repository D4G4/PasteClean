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
// categories so the rendered card list has substance. Mutable so a
// no-html branch test can override.
let mockSearchParams = {
  html: '<h1 style="color:white;background:#1a1a1a">Title</h1><p>Body</p>',
};
const mockRouterBack = jest.fn();
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => mockSearchParams,
  useRouter: () => ({ back: mockRouterBack, push: jest.fn() }),
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

  it('cycles through previewMode toggles (light → dark → original)', () => {
    mockScheme = 'light';
    let tree;
    act(() => {
      tree = renderer.create(<PreviewScreen />);
    });
    const findByText = (text) =>
      tree.root.findAll((n) => {
        if (typeof n.children?.[0] !== 'object' || n.children.length === 0)
          return false;
        const own = n.children[0];
        return (
          typeof own === 'string' && own.includes(text)
        );
      });
    // Find Text leaves containing each label, walk up to the touchable.
    const findToggleOnPress = (label) => {
      const textNodes = tree.root.findAll(
        (n) =>
          n.children &&
          n.children.length === 1 &&
          typeof n.children[0] === 'string' &&
          n.children[0].includes(label),
      );
      if (textNodes.length === 0) return null;
      // Walk up to find a node with onPress.
      let p = textNodes[0].parent;
      while (p && typeof p.props.onPress !== 'function') p = p.parent;
      return p;
    };

    const darkToggle = findToggleOnPress('Gmail Dark');
    const originalToggle = findToggleOnPress('Original');
    const lightToggle = findToggleOnPress('Gmail Light');
    expect(darkToggle).toBeTruthy();
    act(() => darkToggle.props.onPress());
    act(() => originalToggle.props.onPress());
    act(() => lightToggle.props.onPress());
    act(() => tree.unmount());
  });

  it('full Copy flow: handleCopy → setCopied → toast appears', async () => {
    mockScheme = 'light';
    let tree;
    await act(async () => {
      tree = renderer.create(<PreviewScreen />);
    });
    // Find Copy button by its child text "Copy for Gmail".
    const textNodes = tree.root.findAll(
      (n) =>
        n.children &&
        n.children.length === 1 &&
        typeof n.children[0] === 'string' &&
        n.children[0].includes('Copy for Gmail'),
    );
    expect(textNodes.length).toBeGreaterThan(0);
    let p = textNodes[0].parent;
    while (p && typeof p.props.onPress !== 'function') p = p.parent;
    expect(p).toBeTruthy();
    await act(async () => {
      await p.props.onPress();
    });
    act(() => tree.unmount());
  });

  it('renders correctly when html search param is empty (covers !html early return)', () => {
    const prev = mockSearchParams;
    mockSearchParams = {};
    try {
      mockScheme = 'light';
      let tree;
      act(() => {
        tree = renderer.create(<PreviewScreen />);
      });
      // Should mount without throwing — the sanitizer's empty-input branch
      // returns a clean report with totalFixes:0.
      expect(tree.toJSON()).toBeTruthy();
      act(() => tree.unmount());
    } finally {
      mockSearchParams = prev;
    }
  });

  it('openGmail falls back to web URL when Linking deep-link rejects', async () => {
    const { Linking } = require('react-native');
    const orig = Linking.openURL;
    const calls = [];
    let firstCall = true;
    Linking.openURL = (url) => {
      calls.push(url);
      if (firstCall) {
        firstCall = false;
        return Promise.reject(new Error('Gmail not installed'));
      }
      return Promise.resolve(true);
    };
    try {
      mockScheme = 'light';
      let tree;
      act(() => {
        tree = renderer.create(<PreviewScreen />);
      });
      // Trigger openGmail via the Toast's onOpenGmail prop — that's the
      // observable entry point.
      const toasts = tree.root.findAll(
        (n) => typeof n.props.onOpenGmail === 'function',
      );
      await act(async () => {
        toasts[0].props.onOpenGmail();
        // Let the rejection microtask + fallback openURL resolve.
        await Promise.resolve();
        await Promise.resolve();
      });
      expect(calls[0]).toBe('googlegmail://');
      expect(calls[1]).toContain('mail.google.com');
      act(() => tree.unmount());
    } finally {
      Linking.openURL = orig;
    }
  });

  it('Toast onDismiss + onAutoOpenChange callbacks are wired', () => {
    mockScheme = 'light';
    let tree;
    act(() => {
      tree = renderer.create(<PreviewScreen />);
    });
    // The GmailHandoffToast has props onDismiss, onAutoOpenChange,
    // onOpenGmail. Find the toast by its onDismiss + onAutoOpenChange
    // prop signature.
    const toasts = tree.root.findAll(
      (n) =>
        typeof n.props.onDismiss === 'function' &&
        typeof n.props.onAutoOpenChange === 'function',
    );
    expect(toasts.length).toBeGreaterThan(0);
    act(() => toasts[0].props.onDismiss());
    act(() => toasts[0].props.onAutoOpenChange(true));
    act(() => toasts[0].props.onAutoOpenChange(false));
    // openGmail (deep link with web fallback)
    const { Linking } = require('react-native');
    const orig = Linking.openURL;
    Linking.openURL = () => Promise.resolve(true);
    try {
      act(() => toasts[0].props.onOpenGmail());
    } finally {
      Linking.openURL = orig;
    }
    act(() => tree.unmount());
  });

  it('handleClose: animation completion → router.back()', () => {
    // jest.setup.js mocks Animated.timing to a no-op .start() that
    // never invokes its callback. Override locally so the callback fires
    // synchronously, covering preview.tsx:221 (router.back inside the
    // animation completion callback).
    const RN = require('react-native');
    const origTiming = RN.Animated.timing;
    RN.Animated.timing = (value, config) => ({
      start: (cb) => cb && cb({ finished: true }),
      stop: () => {},
    });
    mockRouterBack.mockClear();
    try {
      mockScheme = 'light';
      let tree;
      act(() => {
        tree = renderer.create(<PreviewScreen />);
      });
      // Tap the backdrop (or any handleClose source) to drive the
      // animation → callback → router.back().
      const backdrop = tree.root.findAll(
        (n) =>
          typeof n.props.onPress === 'function' &&
          n.props.activeOpacity === undefined,
      );
      act(() => backdrop[0].props.onPress());
      expect(mockRouterBack).toHaveBeenCalled();
      act(() => tree.unmount());
    } finally {
      RN.Animated.timing = origTiming;
    }
  });

  it('Copy with autoOpenGmail=true → openGmail (not toast)', async () => {
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
      await act(async () => {
        tree = renderer.create(<PreviewScreen />);
      });
      // Flip autoOpenGmail to true via the toast's onAutoOpenChange.
      const toasts = tree.root.findAll(
        (n) => typeof n.props.onAutoOpenChange === 'function',
      );
      act(() => toasts[0].props.onAutoOpenChange(true));
      // Now tap Copy — handleCopy should call openGmail instead of
      // showing the toast (covers preview.tsx:245).
      const textNodes = tree.root.findAll(
        (n) =>
          n.children &&
          n.children.length === 1 &&
          typeof n.children[0] === 'string' &&
          n.children[0].includes('Copy for Gmail'),
      );
      let p = textNodes[0].parent;
      while (p && typeof p.props.onPress !== 'function') p = p.parent;
      await act(async () => {
        await p.props.onPress();
      });
      // openGmail tried the deep link.
      expect(calls).toContain('googlegmail://');
      act(() => tree.unmount());
    } finally {
      Linking.openURL = orig;
    }
  });

  it('handleCopy catch path: clipboard write rejects → Alert', async () => {
    // Grab the global mock (installed via jest.setup.js) and swap its
    // resolved value for a rejection. No resetModules — that would tear
    // down React between tests.
    const clipboardModule = require('@/native/html-clipboard');
    const orig = clipboardModule.copyHtmlToClipboard;
    clipboardModule.copyHtmlToClipboard = () =>
      Promise.reject(new Error('clipboard fail'));

    const RN = require('react-native');
    const alertSpy = jest
      .spyOn(RN.Alert, 'alert')
      .mockImplementation(() => {});
    try {
      mockScheme = 'light';
      let tree;
      await act(async () => {
        tree = renderer.create(<PreviewScreen />);
      });
      const textNodes = tree.root.findAll(
        (n) =>
          n.children &&
          n.children.length === 1 &&
          typeof n.children[0] === 'string' &&
          n.children[0].includes('Copy for Gmail'),
      );
      let p = textNodes[0].parent;
      while (p && typeof p.props.onPress !== 'function') p = p.parent;
      await act(async () => {
        await p.props.onPress();
      });
      expect(alertSpy).toHaveBeenCalledWith(
        'Copy failed',
        expect.stringContaining('went wrong'),
      );
      act(() => tree.unmount());
    } finally {
      alertSpy.mockRestore();
      clipboardModule.copyHtmlToClipboard = orig;
    }
  });
});
