import React from 'react';
import renderer from 'react-test-renderer';
import FixedScreen from '../screens/FixedScreen';

describe('FixedScreen', () => {
  it('matches snapshot', () => {
    const tree = renderer.create(<FixedScreen />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
