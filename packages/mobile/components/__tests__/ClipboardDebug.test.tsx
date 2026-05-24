/**
 * Snapshot + behavior for the /debug/clipboard route. Renders the types
 * fetched from HtmlClipboard.getAvailableTypes() and provides a back
 * button for navigation. Maestro uses this to assert
 * `com.apple.webarchive` lands on the pasteboard after a Copy.
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';

let mockTypes: string[] | null = ['com.apple.webarchive', 'public.html'];
let mockShouldThrow = false;
jest.mock('@/native/html-clipboard', () => ({
  getAvailableClipboardTypes: () => {
    if (mockShouldThrow) return Promise.reject(new Error('bridge unavailable'));
    return Promise.resolve(mockTypes);
  },
}));

const mockRouterBack = jest.fn();
jest.mock('expo-router', () => {
  const React = require('react');
  const { View } = require('react-native');
  const Stack = ({ children }) => React.createElement(View, null, children);
  Stack.Screen = () => null;
  return {
    Stack,
    useRouter: () => ({ back: mockRouterBack }),
  };
});

import ClipboardDebug from '@/app/debug/clipboard';

beforeEach(() => {
  mockTypes = ['com.apple.webarchive', 'public.html'];
  mockShouldThrow = false;
  mockRouterBack.mockClear();
  // Ensure DEBUG_ENABLED resolves truthy via __DEV__ (jest's default).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).__DEV__ = true;
});

describe('ClipboardDebug', () => {
  it('renders the type list when types resolve', async () => {
    let tree;
    await act(async () => {
      tree = renderer.create(<ClipboardDebug />);
    });
    // Effect flush.
    await act(async () => {
      await Promise.resolve();
    });
    const node = tree.root.findByProps({ testID: 'clipboard-types' });
    expect(node.props.children).toContain('com.apple.webarchive');
    act(() => tree.unmount());
  });

  it('shows null marker when native module returns null', async () => {
    mockTypes = null;
    let tree;
    await act(async () => {
      tree = renderer.create(<ClipboardDebug />);
    });
    await act(async () => {
      await Promise.resolve();
    });
    const node = tree.root.findByProps({ testID: 'clipboard-types' });
    expect(node.props.children).toContain('null');
    act(() => tree.unmount());
  });

  it('refresh button re-fetches types', async () => {
    let tree;
    await act(async () => {
      tree = renderer.create(<ClipboardDebug />);
    });
    const refresh = tree.root.findByProps({
      testID: 'clipboard-debug-refresh',
    });
    mockTypes = ['just.text'];
    await act(async () => {
      await refresh.props.onPress();
    });
    const node = tree.root.findByProps({ testID: 'clipboard-types' });
    expect(node.props.children).toContain('just.text');
    act(() => tree.unmount());
  });

  it('back button → router.back()', async () => {
    let tree;
    await act(async () => {
      tree = renderer.create(<ClipboardDebug />);
    });
    const back = tree.root.findByProps({ testID: 'clipboard-debug-back' });
    act(() => back.props.onPress());
    expect(mockRouterBack).toHaveBeenCalled();
    act(() => tree.unmount());
  });

  it('renders error state when the native call throws', async () => {
    mockShouldThrow = true;
    let tree;
    await act(async () => {
      tree = renderer.create(<ClipboardDebug />);
    });
    await act(async () => {
      await Promise.resolve();
    });
    const err = tree.root.findByProps({ testID: 'clipboard-debug-error' });
    expect(err.props.children).toContain('bridge unavailable');
    act(() => tree.unmount());
  });
});
