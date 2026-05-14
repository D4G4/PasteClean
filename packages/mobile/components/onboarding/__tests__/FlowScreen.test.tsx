import React from 'react';
import renderer from 'react-test-renderer';
import FlowScreen from '../screens/FlowScreen';

// Coral is the default brand color; the design also ships Iris / Classic /
// Mint / Mono. Snapshot the default + one off-spec accent to lock in that
// accent propagation reaches every icon, badge, and trigger.
describe('FlowScreen', () => {
  it('matches snapshot — Coral accent (default), with peek trigger', () => {
    const tree = renderer
      .create(<FlowScreen accent="#FF6B5C" onPeek={() => {}} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot — Iris accent, with peek trigger', () => {
    const tree = renderer
      .create(<FlowScreen accent="#6E55FF" onPeek={() => {}} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot — Coral accent, no peek trigger', () => {
    const tree = renderer.create(<FlowScreen accent="#FF6B5C" />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
