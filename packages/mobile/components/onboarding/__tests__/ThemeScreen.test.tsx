import React from 'react';
import renderer from 'react-test-renderer';
import ThemeScreen from '../screens/ThemeScreen';

describe('ThemeScreen', () => {
  it('matches snapshot — Coral selected', () => {
    const tree = renderer
      .create(<ThemeScreen accent="#FF6B5C" setAccent={() => {}} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot — Iris selected', () => {
    const tree = renderer
      .create(<ThemeScreen accent="#6E55FF" setAccent={() => {}} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
