import React from 'react';

// gorhom's BottomSheet runs reanimated worklets at construction time. Jest's
// test renderer can't compile worklets — Reanimated throws "Passed a function
// that is not a worklet" before the snapshot ever serializes. Mock the
// surface to a plain View tree that mirrors the public API so the snapshot
// still captures: chosen background/handle colors, snap-point shape, the
// callbacks wired up, and the children we pass in.
jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: React.forwardRef(
      (
        {
          children,
          snapPoints,
          index,
          backgroundStyle,
          handleIndicatorStyle,
        }: {
          children?: React.ReactNode;
          snapPoints?: unknown;
          index?: number;
          backgroundStyle?: unknown;
          handleIndicatorStyle?: unknown;
        },
        _ref: React.Ref<unknown>,
      ) =>
        React.createElement(
          View,
          {
            testID: 'mock-bottom-sheet',
            'data-snap-points': JSON.stringify(snapPoints),
            'data-index': index,
            'data-background': JSON.stringify(backgroundStyle),
            'data-handle': JSON.stringify(handleIndicatorStyle),
          },
          children,
        ),
    ),
    BottomSheetBackdrop: () =>
      React.createElement(View, { testID: 'mock-backdrop' }),
    BottomSheetScrollView: ({
      children,
    }: {
      children?: React.ReactNode;
    }) =>
      React.createElement(View, { testID: 'mock-scroll' }, children),
  };
});

import PipelineSheet from '../PipelineSheet';
import { snapshotOf } from '../test-utils';

describe('PipelineSheet', () => {
  it('matches snapshot — open', () => {
    expect(
      snapshotOf(<PipelineSheet open onClose={() => {}} />),
    ).toMatchSnapshot();
  });

  it('matches snapshot — closed', () => {
    expect(
      snapshotOf(<PipelineSheet open={false} onClose={() => {}} />),
    ).toMatchSnapshot();
  });
});
