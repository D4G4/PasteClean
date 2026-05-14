import React from 'react';
import PipelineSheet from '../PipelineSheet';
import { snapshotOf } from '../test-utils';

describe('PipelineSheet', () => {
  it('matches snapshot — open', () => {
    expect(
      snapshotOf(<PipelineSheet open onClose={() => {}} />),
    ).toMatchSnapshot();
  });

  it('matches snapshot — closed', () => {
    expect(
      snapshotOf(<PipelineSheet open={false} onClose={() => {}} />),
    ).toMatchSnapshot();
  });
});
