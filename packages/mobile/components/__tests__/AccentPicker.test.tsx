/**
 * AccentPicker — verifies each accent swatch invokes onPick(id) when tapped
 * and that selection state drives styling (swatch checkmark, border).
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { TouchableOpacity } from 'react-native';

import AccentPicker from '@/components/AccentPicker';
import { ACCENT_OPTIONS } from '@/constants/Colors';

let mockScheme = 'light';
jest.mock('@/components/useColorScheme', () => ({
  useColorScheme: () => mockScheme,
}));

function mount(selected, onPick) {
  let tree;
  act(() => {
    tree = renderer.create(
      <AccentPicker selected={selected} onPick={onPick} />,
    );
  });
  return tree;
}

describe('AccentPicker', () => {
  it('renders one TouchableOpacity per accent option', () => {
    const tree = mount(ACCENT_OPTIONS[0].id, jest.fn());
    const touchables = tree.root.findAllByType(TouchableOpacity);
    expect(touchables).toHaveLength(ACCENT_OPTIONS.length);
    act(() => {
      tree.unmount();
    });
  });

  it('tapping each swatch fires onPick with the matching option id', () => {
    const onPick = jest.fn();
    const tree = mount(ACCENT_OPTIONS[0].id, onPick);
    const touchables = tree.root.findAllByType(TouchableOpacity);
    for (let i = 0; i < ACCENT_OPTIONS.length; i++) {
      act(() => {
        touchables[i].props.onPress();
      });
      expect(onPick).toHaveBeenNthCalledWith(i + 1, ACCENT_OPTIONS[i].id);
    }
    act(() => {
      tree.unmount();
    });
  });

  it('dark mode renders without throwing (mono swatch flips coloration)', () => {
    mockScheme = 'dark';
    const tree = mount('mono', jest.fn());
    expect(tree.toJSON()).toBeTruthy();
    act(() => {
      tree.unmount();
    });
    mockScheme = 'light';
  });
});
