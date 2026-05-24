// React 19 requires the initial render to be committed inside act() before
// react-test-renderer's `toJSON()` returns anything non-null. This helper
// renders a component, wraps the create() in act(), and returns the JSON tree.
import renderer, { act, ReactTestRenderer } from 'react-test-renderer';
import { ReactElement } from 'react';

export function snapshotOf(element: ReactElement): unknown {
  let r: ReactTestRenderer | undefined;
  act(() => {
    r = renderer.create(element);
  });
  /* istanbul ignore next — defensive guard, react-test-renderer always
     returns a non-null instance when create() doesn't throw. */
  if (!r) throw new Error('snapshotOf: renderer.create returned nothing');
  return r.toJSON();
}
