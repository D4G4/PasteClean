/**
 * Toolbar visibility regression test (Jest equivalent of Maestro 06).
 *
 * The bug: KeyboardAvoidingView was mounted conditionally on `keyboardVisible`,
 * so its UIKeyboardWillShow listener attached AFTER the event fired and the
 * toolbar sat behind the keyboard with no inset.
 *
 * The fix: KAV is always mounted; only the toolbar contents render
 * conditionally on `keyboardVisible`.
 *
 * This test fires synthetic Keyboard events and asserts:
 *   1. toolbar-dismiss-keyboard is NOT in the tree before the keyboard opens
 *   2. toolbar-dismiss-keyboard IS in the tree after keyboardWillShow
 *   3. toolbar-dismiss-keyboard is NOT in the tree after keyboardWillHide
 *   4. The KAV wrapper (toolbarKav) is ALWAYS in the tree regardless of
 *      keyboard state — this is the structural invariant that prevents the
 *      regression.
 */
import React from 'react';
import { Keyboard, Platform } from 'react-native';
import renderer, { act, ReactTestRenderer } from 'react-test-renderer';

// ---- Mocks (same as EditorScreen.test.tsx) ----

jest.mock('@/components/useColorScheme', () => ({
  useColorScheme: () => 'dark',
}));

jest.mock(
  '@pasteclean/gmail-sanitizer',
  () => ({ sanitizeForGmail: (html: string) => html }),
  { virtual: true },
);

const mockBlur = jest.fn();

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
      blur: mockBlur,
    }),
    useBridgeState: () => ({ isReady: true }),
    DEFAULT_TOOLBAR_ITEMS: [],
    Images: { Aa: 'Aa', checkList: 'checkList' },
    darkEditorTheme: { webview: { backgroundColor: '#1C1C1E' } },
    defaultEditorTheme: { webview: { backgroundColor: '#FFFFFF' } },
    darkEditorCss: '* { background:#1C1C1E; color:white; }',
    TenTapStartKit: [{ name: 'link' }],
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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Recursively find a node by testID in the JSON tree. */
function findByTestID(tree: any, testID: string): any | null {
  if (!tree) return null;
  if (tree.props?.testID === testID) return tree;
  if (Array.isArray(tree.children)) {
    for (const child of tree.children) {
      const found = findByTestID(child, testID);
      if (found) return found;
    }
  }
  return null;
}

/** Check whether the absolute-positioned KAV wrapper is present. */
function hasToolbarKav(tree: any): boolean {
  // The KAV renders as a plain View with style containing position:'absolute',
  // bottom:0, left:0, right:0 — the toolbarKav style.
  return !!findAbsoluteBottomView(tree);
}

function findAbsoluteBottomView(node: any): any | null {
  if (!node) return null;
  const styles = Array.isArray(node.props?.style)
    ? node.props.style
    : [node.props?.style];
  for (const s of styles) {
    if (s?.position === 'absolute' && s?.bottom === 0) return node;
  }
  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      const found = findAbsoluteBottomView(child);
      if (found) return found;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Toolbar visibility — keyboard interaction', () => {
  // Capture the Keyboard listeners so we can fire events manually.
  let listeners: Record<string, Array<() => void>>;
  const origAddListener = Keyboard.addListener;

  beforeEach(() => {
    jest.useFakeTimers();
    listeners = {};
    // @ts-expect-error — overriding for test
    Keyboard.addListener = jest.fn((event: string, cb: () => void) => {
      (listeners[event] ??= []).push(cb);
      return { remove: () => {} };
    });
    // Force iOS platform so the component subscribes to keyboardWillShow/Hide.
    (Platform as any).OS = 'ios';
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    // @ts-expect-error — restoring
    Keyboard.addListener = origAddListener;
  });

  function fireKeyboardEvent(event: string) {
    for (const cb of listeners[event] ?? []) {
      cb();
    }
  }

  it('toolbar-dismiss-keyboard absent before keyboard opens', () => {
    let root: ReactTestRenderer;
    act(() => {
      root = renderer.create(<EditorScreen />);
    });
    const tree = root!.toJSON();
    expect(findByTestID(tree, 'toolbar-dismiss-keyboard')).toBeNull();
  });

  it('toolbar-dismiss-keyboard appears after keyboardWillShow', () => {
    let root: ReactTestRenderer;
    act(() => {
      root = renderer.create(<EditorScreen />);
    });

    act(() => {
      fireKeyboardEvent('keyboardWillShow');
    });

    const tree = root!.toJSON();
    expect(findByTestID(tree, 'toolbar-dismiss-keyboard')).not.toBeNull();
  });

  it('toolbar-dismiss-keyboard disappears after keyboardWillHide', () => {
    let root: ReactTestRenderer;
    act(() => {
      root = renderer.create(<EditorScreen />);
    });

    // Open keyboard
    act(() => {
      fireKeyboardEvent('keyboardWillShow');
    });
    expect(findByTestID(root!.toJSON(), 'toolbar-dismiss-keyboard')).not.toBeNull();

    // Close keyboard
    act(() => {
      fireKeyboardEvent('keyboardWillHide');
    });
    expect(findByTestID(root!.toJSON(), 'toolbar-dismiss-keyboard')).toBeNull();
  });

  it('tapping dismiss calls editor.blur() (not Keyboard.dismiss)', () => {
    mockBlur.mockClear();
    let root: ReactTestRenderer;
    act(() => {
      root = renderer.create(<EditorScreen />);
    });

    // Open keyboard so the dismiss button renders
    act(() => {
      fireKeyboardEvent('keyboardWillShow');
    });

    // Find the dismiss button and invoke its onPress
    const instance = root!.root;
    const dismissBtn = instance.findByProps({ testID: 'toolbar-dismiss-keyboard' });
    act(() => {
      dismissBtn.props.onPress();
    });

    expect(mockBlur).toHaveBeenCalledTimes(1);
  });

  it('KAV wrapper is always in the tree regardless of keyboard state', () => {
    let root: ReactTestRenderer;
    act(() => {
      root = renderer.create(<EditorScreen />);
    });

    // Keyboard down — KAV present
    expect(hasToolbarKav(root!.toJSON())).toBe(true);

    // Keyboard up — KAV still present
    act(() => {
      fireKeyboardEvent('keyboardWillShow');
    });
    expect(hasToolbarKav(root!.toJSON())).toBe(true);

    // Keyboard down again — KAV still present
    act(() => {
      fireKeyboardEvent('keyboardWillHide');
    });
    expect(hasToolbarKav(root!.toJSON())).toBe(true);
  });
});
