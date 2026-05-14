/**
 * Dark-mode snapshots. We mock the tokens module so every consumer reads
 * `dark: true` regardless of the actual system color scheme.
 *
 * The Gmail message mocks (Problem cards, Vanish cards, Fixed card) stay
 * fixed because they don't read from the tokens — they're real Gmail
 * renderings, not app chrome.
 */
import React from 'react';

jest.mock('../tokens', () => {
  const actual = jest.requireActual('../tokens');
  return {
    ...actual,
    useTokens: () => ({ dark: true, t: actual.tokens(true) }),
  };
});

import ProblemScreen from '../screens/ProblemScreen';
import VanishScreen from '../screens/VanishScreen';
import FixedScreen from '../screens/FixedScreen';
import FlowScreen from '../screens/FlowScreen';
import ThemeScreen from '../screens/ThemeScreen';
import PipelineSheet from '../PipelineSheet';
import OnboardingFlow from '../OnboardingFlow';
import { snapshotOf } from '../test-utils';

describe('Onboarding — dark mode', () => {
  it('ProblemScreen', () => {
    expect(snapshotOf(<ProblemScreen />)).toMatchSnapshot();
  });

  it('VanishScreen', () => {
    expect(snapshotOf(<VanishScreen />)).toMatchSnapshot();
  });

  it('FixedScreen', () => {
    expect(snapshotOf(<FixedScreen />)).toMatchSnapshot();
  });

  it('FlowScreen — Coral, with peek', () => {
    expect(
      snapshotOf(<FlowScreen accent="#FF6B5C" onPeek={() => {}} />),
    ).toMatchSnapshot();
  });

  it('ThemeScreen — Coral selected', () => {
    expect(
      snapshotOf(<ThemeScreen accent="#FF6B5C" setAccent={() => {}} />),
    ).toMatchSnapshot();
  });

  it('PipelineSheet — open', () => {
    expect(
      snapshotOf(<PipelineSheet open onClose={() => {}} />),
    ).toMatchSnapshot();
  });

  it('OnboardingFlow — Coral accent', () => {
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
});
