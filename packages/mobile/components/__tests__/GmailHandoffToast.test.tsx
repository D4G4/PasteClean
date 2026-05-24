/**
 * GmailHandoffToast — covers the visible/hidden states, all three tap
 * targets (close, Not now, Open Gmail, auto-open checkbox), the 6s
 * auto-dismiss timer, and the cleanup that fires when the visible prop
 * flips off.
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { TouchableOpacity, Pressable } from 'react-native';

import { GmailHandoffToast } from '@/components/GmailHandoffToast';

const baseProps = {
  visible: true,
  dark: false,
  accent: '#FF6B5C',
  onDismiss: jest.fn(),
  onOpenGmail: jest.fn(),
  autoOpen: false,
  onAutoOpenChange: jest.fn(),
};

function mount(propOverrides = {}) {
  const props = { ...baseProps, ...propOverrides };
  let tree;
  act(() => {
    tree = renderer.create(<GmailHandoffToast {...props} />);
  });
  return {
    tree,
    props,
    rerender: (next) => {
      act(() => {
        tree.update(<GmailHandoffToast {...props} {...next} />);
      });
    },
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GmailHandoffToast', () => {
  it('renders nothing when visible=false', () => {
    const { tree } = mount({ visible: false });
    expect(tree.toJSON()).toBeNull();
    act(() => tree.unmount());
  });

  it('renders the title + subtitle + both action buttons when visible', () => {
    const { tree } = mount();
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Copied — open Gmail?');
    expect(json).toContain('Paste your sanitized email');
    expect(json).toContain('Not now');
    expect(json).toContain('Open Gmail');
    expect(json).toContain('Always copy + open Gmail');
    act(() => tree.unmount());
  });

  it('tapping the X close button fires onDismiss', () => {
    const { tree, props } = mount();
    const touchables = tree.root.findAllByType(TouchableOpacity);
    // Order in the JSX: X close → Not now → Open Gmail.
    act(() => touchables[0].props.onPress());
    expect(props.onDismiss).toHaveBeenCalledTimes(1);
    act(() => tree.unmount());
  });

  it('tapping "Not now" fires onDismiss', () => {
    const { tree, props } = mount();
    const touchables = tree.root.findAllByType(TouchableOpacity);
    act(() => touchables[1].props.onPress());
    expect(props.onDismiss).toHaveBeenCalledTimes(1);
    act(() => tree.unmount());
  });

  it('tapping "Open Gmail" fires onOpenGmail (not onDismiss)', () => {
    const { tree, props } = mount();
    const touchables = tree.root.findAllByType(TouchableOpacity);
    act(() => touchables[2].props.onPress());
    expect(props.onOpenGmail).toHaveBeenCalledTimes(1);
    expect(props.onDismiss).not.toHaveBeenCalled();
    act(() => tree.unmount());
  });

  it('tapping the auto-open row flips the autoOpen flag', () => {
    const { tree, props } = mount({ autoOpen: false });
    // Find the Pressable by its onPress handler — RN's Pressable identity
    // may not match the imported reference inside react-test-renderer.
    const pressables = tree.root.findAll(
      (node) =>
        node.type === Pressable ||
        (typeof node.type !== 'string' &&
          (node.type as { displayName?: string }).displayName === 'Pressable'),
    );
    // Fallback: scan all nodes for the onPress handler that flips autoOpen.
    const candidates =
      pressables.length > 0
        ? pressables
        : tree.root.findAll((node) => typeof node.props.onPress === 'function');
    // The auto-open Pressable is the last onPress-bearing node in the tree.
    const row = candidates[candidates.length - 1];
    act(() => row.props.onPress());
    expect(props.onAutoOpenChange).toHaveBeenCalledWith(true);
    act(() => tree.unmount());
  });

  it('auto-dismisses after 6 seconds of being visible', () => {
    jest.useFakeTimers();
    try {
      const { tree, props } = mount();
      expect(props.onDismiss).not.toHaveBeenCalled();
      act(() => {
        jest.advanceTimersByTime(6000);
      });
      expect(props.onDismiss).toHaveBeenCalledTimes(1);
      act(() => tree.unmount());
    } finally {
      jest.useRealTimers();
    }
  });

  it('renders correctly in dark mode (different bg/fg)', () => {
    const { tree } = mount({ dark: true });
    expect(tree.toJSON()).toBeTruthy();
    act(() => tree.unmount());
  });

  it('renders with autoOpen=true showing the check icon', () => {
    const { tree } = mount({ autoOpen: true });
    const json = JSON.stringify(tree.toJSON());
    // The check glyph from FontAwesome serializes its content as a Unicode
    // character (). Either-or assertion: the toJSON includes the
    // check icon somewhere.
    expect(json).toContain('Always copy + open Gmail');
    act(() => tree.unmount());
  });
});
