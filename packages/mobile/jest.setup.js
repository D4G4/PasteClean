/* eslint-disable */
// Jest setup for React Native snapshot tests.
// Keeps Animated.loop deterministic and stubs native modules that don't run in JSDOM.

// react-native-pager-view is a native module — mock it as a passthrough View.
jest.mock('react-native-pager-view', () => {
  const React = require('react');
  const { View } = require('react-native');
  const PagerView = React.forwardRef(({ children, ...props }, ref) => {
    React.useImperativeHandle(ref, () => ({ setPage: () => {} }));
    return React.createElement(View, { ...props, ref: undefined }, children);
  });
  PagerView.displayName = 'PagerView';
  return { __esModule: true, default: PagerView };
});

// Safe-area context: return deterministic insets so the snapshot is stable.
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    SafeAreaProvider: ({ children }) => children,
    SafeAreaView: View,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

// Async storage — used by ThemeContext; not relevant to onboarding snapshots.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
