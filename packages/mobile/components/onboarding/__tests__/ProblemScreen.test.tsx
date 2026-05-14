import React from 'react';
import ProblemScreen from '../screens/ProblemScreen';
import { snapshotOf } from '../test-utils';

describe('ProblemScreen', () => {
  it('matches snapshot', () => {
    expect(snapshotOf(<ProblemScreen />)).toMatchSnapshot();
  });
});
