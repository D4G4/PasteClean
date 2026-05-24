import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { TouchableOpacity } from 'react-native';

// Capture the gorhom BottomSheet props in a mutable record so tests can
// invoke onChange / backdropComponent / call .close() on the ref.
const mockCapturedProps = { current: null };
const mockClose = jest.fn();
const mockSnapToIndex = jest.fn();

jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: React.forwardRef((props, ref) => {
      mockCapturedProps.current = props;
      React.useImperativeHandle(ref, () => ({
        close: mockClose,
        snapToIndex: mockSnapToIndex,
      }));
      return React.createElement(
        View,
        {
          testID: 'mock-bottom-sheet',
          'data-snap-points': JSON.stringify(props.snapPoints),
          'data-index': props.index,
        },
        props.children,
      );
    }),
    BottomSheetBackdrop: (props) =>
      React.createElement(View, {
        testID: 'mock-backdrop',
        'data-opacity': props.opacity,
        'data-press': props.pressBehavior,
      }),
    BottomSheetScrollView: ({ children }) =>
      React.createElement(View, { testID: 'mock-scroll' }, children),
  };
});

import PipelineSheet from '../PipelineSheet';
import { snapshotOf } from '../test-utils';

beforeEach(() => {
  mockCapturedProps.current = null;
  mockClose.mockClear();
  mockSnapToIndex.mockClear();
});

describe('PipelineSheet — snapshots', () => {
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

describe('PipelineSheet — behavior', () => {
  function mount(open) {
    const onClose = jest.fn();
    let tree;
    act(() => {
      tree = renderer.create(
        <PipelineSheet open={open} onClose={onClose} />,
      );
    });
    return { tree, onClose };
  }

  it('open prop transitions trigger snapToIndex(0) and close()', () => {
    const { tree } = mount(false);
    expect(mockSnapToIndex).not.toHaveBeenCalled();
    expect(mockClose).toHaveBeenCalledTimes(1); // close on initial open=false

    act(() => {
      tree.update(<PipelineSheet open onClose={() => {}} />);
    });
    expect(mockSnapToIndex).toHaveBeenCalledWith(0);

    act(() => {
      tree.update(<PipelineSheet open={false} onClose={() => {}} />);
    });
    expect(mockClose.mock.calls.length).toBeGreaterThanOrEqual(2);

    act(() => tree.unmount());
  });

  it('onChange gate: -1 on initial mount does NOT fire onClose (no real open seen yet)', () => {
    const { onClose, tree } = mount(false);
    // Simulate gorhom firing onChange(-1) at mount.
    act(() => mockCapturedProps.current.onChange(-1));
    expect(onClose).not.toHaveBeenCalled();
    act(() => tree.unmount());
  });

  it('onChange gate: index>=0 then -1 fires onClose exactly once', () => {
    const { onClose, tree } = mount(true);
    // Open transition: gorhom emits onChange(0).
    act(() => mockCapturedProps.current.onChange(0));
    // User dismisses: gorhom emits onChange(-1).
    act(() => mockCapturedProps.current.onChange(-1));
    expect(onClose).toHaveBeenCalledTimes(1);
    // A subsequent stray -1 (the ref is reset to false) does NOT re-fire.
    act(() => mockCapturedProps.current.onChange(-1));
    expect(onClose).toHaveBeenCalledTimes(1);
    act(() => tree.unmount());
  });

  it('tapping the X close button calls sheet.close()', () => {
    const { tree } = mount(true);
    // The header has a TouchableOpacity with testID="pipeline-sheet-close".
    const closeBtn = tree.root.findByProps({
      testID: 'pipeline-sheet-close',
    });
    mockClose.mockClear();
    act(() => closeBtn.props.onPress());
    expect(mockClose).toHaveBeenCalledTimes(1);
    act(() => tree.unmount());
  });

  it('renderBackdrop forwards props to BottomSheetBackdrop', () => {
    mount(true);
    // The backdropComponent prop is a function — call it directly so
    // the JSX it returns gets evaluated (covers line 34).
    const Backdrop = mockCapturedProps.current.backdropComponent;
    let backdropTree;
    act(() => {
      backdropTree = renderer.create(
        React.createElement(Backdrop, {
          animatedIndex: { value: 0 },
          animatedPosition: { value: 0 },
        }),
      );
    });
    const json = backdropTree.toJSON();
    expect(JSON.stringify(json)).toContain('mock-backdrop');
    act(() => backdropTree.unmount());
  });
});
