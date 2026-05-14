import React from 'react';
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
});
