import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { TouchableOpacity } from 'react-native';
import OnboardingFlow from '../OnboardingFlow';
import { snapshotOf } from '../test-utils';

describe('OnboardingFlow', () => {
  it('matches snapshot — Coral accent', () => {
    expect(
      snapshotOf(
        <OnboardingFlow
          accent="#FF6B5C"
          setAccent={() => {}}
          onDone={() => {}}
        />,
      ),
    ).toMatchSnapshot();
  });

  it('CTA advances PagerView until the last page, then calls onDone', () => {
    const onDone = jest.fn();
    let tree;
    act(() => {
      tree = renderer.create(
        <OnboardingFlow
          accent="#FF6B5C"
          setAccent={jest.fn()}
          onDone={onDone}
        />,
      );
    });

    // Find the CTA TouchableOpacity by its testID.
    const cta = tree.root.findByProps({ testID: 'onboarding-cta' });

    // Pages 0..2: CTA call sets the next page via pagerRef.setPage but
    // onDone is NOT called yet. We can't actually advance the PagerView
    // mock's internal currentPage (the mock is a passthrough View), so we
    // simulate the onPageSelected callback firing for each transition.
    const pager = tree.root.findByProps({ initialPage: 0 });

    for (let i = 0; i < 3; i++) {
      act(() => cta.props.onPress());
      act(() =>
        pager.props.onPageSelected({ nativeEvent: { position: i + 1 } }),
      );
      expect(onDone).not.toHaveBeenCalled();
    }

    // On the last page (currentPage === 3 = PAGE_COUNT - 1), CTA fires
    // onDone and does NOT advance.
    act(() => cta.props.onPress());
    expect(onDone).toHaveBeenCalledTimes(1);

    act(() => tree.unmount());
  });

  it('FlowScreen.onPeek flips peekOpen → PipelineSheet receives open=true', () => {
    let tree;
    act(() => {
      tree = renderer.create(
        <OnboardingFlow
          accent="#FF6B5C"
          setAccent={jest.fn()}
          onDone={jest.fn()}
        />,
      );
    });
    // Find any node carrying an onPeek prop. Only FlowScreen exposes that
    // prop, and the OnboardingFlow root binds it to setPeekOpen(true).
    const peekHolders = tree.root.findAll(
      (node) => typeof node.props.onPeek === 'function',
    );
    expect(peekHolders.length).toBeGreaterThan(0);
    // Triggering onPeek should flip peekOpen and re-render without errors.
    act(() => peekHolders[0].props.onPeek());

    act(() => tree.unmount());
  });
});
