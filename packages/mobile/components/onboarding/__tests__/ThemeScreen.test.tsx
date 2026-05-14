import React from 'react';
import ThemeScreen from '../screens/ThemeScreen';
import { snapshotOf } from '../test-utils';

describe('ThemeScreen', () => {
  it('matches snapshot — Coral selected', () => {
    expect(
      snapshotOf(<ThemeScreen accent="#FF6B5C" setAccent={() => {}} />),
    ).toMatchSnapshot();
  });

  it('matches snapshot — Iris selected', () => {
    expect(
      snapshotOf(<ThemeScreen accent="#6E55FF" setAccent={() => {}} />),
    ).toMatchSnapshot();
  });
});
