import React from 'react';
import renderer from 'react-test-renderer';
import VanishScreen from '../screens/VanishScreen';

describe('VanishScreen', () => {
  it('matches snapshot at initial state (compose visible, sent hidden)', () => {
    // Initial Animated.Values: compose=1, sent=0. Loop hasn't progressed yet at render.
    const tree = renderer.create(<VanishScreen />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
