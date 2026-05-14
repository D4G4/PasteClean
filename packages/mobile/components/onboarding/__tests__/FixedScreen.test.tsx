import React from 'react';
import FixedScreen from '../screens/FixedScreen';
import { snapshotOf } from '../test-utils';

describe('FixedScreen', () => {
  it('matches snapshot', () => {
    expect(snapshotOf(<FixedScreen />)).toMatchSnapshot();
  });
});
