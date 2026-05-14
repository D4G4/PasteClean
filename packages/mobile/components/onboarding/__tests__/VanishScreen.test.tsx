import React from 'react';
import VanishScreen from '../screens/VanishScreen';
import { snapshotOf } from '../test-utils';

describe('VanishScreen', () => {
  it('matches snapshot at initial state (compose visible, sent hidden)', () => {
    expect(snapshotOf(<VanishScreen />)).toMatchSnapshot();
  });
});
