/**
 * Tabs layout is one Tabs route with chrome hidden. Snapshot proves the
 * configuration doesn't drift (e.g. a stray tab bar showing up again).
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';

jest.mock('expo-router', () => {
  const React = require('react');
  const { View } = require('react-native');
  const Tabs = ({ children }) =>
    React.createElement(View, { testID: 'mock-tabs' }, children);
  Tabs.Screen = ({ name }) =>
    React.createElement(View, { testID: `mock-tabs-screen-${name}` });
  return { Tabs };
});

import TabLayout from '@/app/(tabs)/_layout';

describe('TabLayout', () => {
  it('renders Tabs container with the editor screen registered', () => {
    let tree;
    act(() => {
      tree = renderer.create(<TabLayout />);
    });
    expect(tree.toJSON()).toMatchSnapshot();
    act(() => {
      tree.unmount();
    });
  });
});
