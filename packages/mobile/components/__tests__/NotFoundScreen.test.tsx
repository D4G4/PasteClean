/**
 * Snapshot for the 404 screen — small but easy to break (route helpers,
 * RN component imports).
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';

jest.mock('expo-router', () => {
  const React = require('react');
  const { View } = require('react-native');
  const Stack = ({ children }) => React.createElement(View, null, children);
  Stack.Screen = () => null;
  return {
    Stack,
    Link: ({ children }) =>
      React.createElement(View, { testID: 'mock-link' }, children),
  };
});

import NotFoundScreen from '@/app/+not-found';

describe('NotFoundScreen', () => {
  it('renders the 404 fallback', () => {
    let tree;
    act(() => {
      tree = renderer.create(<NotFoundScreen />);
    });
    expect(tree.toJSON()).toMatchSnapshot();
    act(() => {
      tree.unmount();
    });
  });
});
