import React from 'react';
import FlowScreen from '../screens/FlowScreen';
import { snapshotOf } from '../test-utils';

// Coral is the default brand color; the design also ships Iris / Classic /
// Mint / Mono. Snapshot the default + one off-spec accent to lock in that
// accent propagation reaches every icon, badge, and trigger.
describe('FlowScreen', () => {
  it('matches snapshot — Coral accent (default), with peek trigger', () => {
    expect(
      snapshotOf(<FlowScreen accent="#FF6B5C" onPeek={() => {}} />),
    ).toMatchSnapshot();
  });

  it('matches snapshot — Iris accent, with peek trigger', () => {
    expect(
      snapshotOf(<FlowScreen accent="#6E55FF" onPeek={() => {}} />),
    ).toMatchSnapshot();
  });

  it('matches snapshot — Coral accent, no peek trigger', () => {
    expect(snapshotOf(<FlowScreen accent="#FF6B5C" />)).toMatchSnapshot();
  });
});
