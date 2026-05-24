/**
 * /how-it-works route — verifies the route renders HowItWorksContent.
 * Dismissal is owned by UIKit's UISheetPresentationController (no JS
 * close handler) — so there's nothing to test at the JS layer beyond
 * "the route mounts the right component."
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn(), dismiss: jest.fn() }),
}));

import HowItWorksScreen from '@/app/how-it-works';

describe('HowItWorksScreen (route)', () => {
  it('renders the content', () => {
    let tree;
    act(() => {
      tree = renderer.create(<HowItWorksScreen />);
    });
    const root = tree.root.findByProps({ testID: 'how-it-works-screen' });
    expect(root).toBeTruthy();
    act(() => tree.unmount());
  });
});
