import React from 'react';
import renderer from 'react-test-renderer';
import OnboardingFlow from '../OnboardingFlow';

describe('OnboardingFlow', () => {
  it('matches snapshot — Coral accent', () => {
    const tree = renderer
      .create(
        <OnboardingFlow
          accent="#FF6B5C"
          setAccent={() => {}}
          onDone={() => {}}
        />,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
