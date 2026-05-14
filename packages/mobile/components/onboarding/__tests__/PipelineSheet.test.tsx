import React from 'react';
import renderer from 'react-test-renderer';
import PipelineSheet from '../PipelineSheet';

describe('PipelineSheet', () => {
  it('matches snapshot — open', () => {
    const tree = renderer
      .create(<PipelineSheet open onClose={() => {}} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot — closed', () => {
    const tree = renderer
      .create(<PipelineSheet open={false} onClose={() => {}} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
