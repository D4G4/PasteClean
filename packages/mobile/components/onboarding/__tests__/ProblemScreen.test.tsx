import React from 'react';
import renderer from 'react-test-renderer';
import ProblemScreen from '../screens/ProblemScreen';

describe('ProblemScreen', () => {
  it('matches snapshot', () => {
    const tree = renderer.create(<ProblemScreen />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
