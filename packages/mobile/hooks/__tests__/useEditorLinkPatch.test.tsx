/**
 * Behavioural tests for the link-insertion patch. We don't render a real
 * WebView — we mount a tiny harness component, point it at a fake editor
 * bridge whose surface matches what TenTap's useEditorBridge returns, then
 * verify the sequence of bridge calls our patch makes when the user inserts
 * or unsets a link.
 *
 * These cover the regressions that bit us repeatedly on-device:
 *   - cursor landing before the link instead of after
 *   - subsequent typing still inheriting the link mark
 *   - the patch reading a stale empty selection when the editor blurred
 *     while the URL input was focused
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import {
  useEditorLinkPatch,
  type LinkPatchEditor,
  type LinkPatchSelection,
} from '../useEditorLinkPatch';

type StateUpdate = { selection?: LinkPatchSelection | null };
type StateSubscriber = (state: StateUpdate) => void;

interface FakeEditorBridge extends LinkPatchEditor {
  setSelection: jest.Mock<void, [number, number]>;
  getEditorState: jest.Mock<{ selection: LinkPatchSelection } | null, []>;
  // Spies on what the hook forwards to the original (pre-wrap) setLink —
  // exposed because the hook replaces editor.setLink with a non-mock wrapper.
  originalSetLink: jest.Mock<void, [string | null]>;
  // Test-only: drive a state update through the same channel useEditorBridge
  // would push it from the WebView.
  __pushState: (state: StateUpdate) => void;
}

function makeFakeEditor(
  initial: LinkPatchSelection | null = { from: 0, to: 0 },
): FakeEditorBridge {
  let currentSelection: LinkPatchSelection | null = initial;
  const subs: StateSubscriber[] = [];
  const originalSetLink = jest.fn<void, [string | null]>();

  const editor: FakeEditorBridge = {
    setLink: originalSetLink,
    setSelection: jest.fn((from, to) => {
      currentSelection = { from, to };
    }),
    getEditorState: jest.fn(() =>
      currentSelection ? { selection: currentSelection } : null,
    ),
    _subscribeToEditorStateUpdate: (cb) => {
      subs.push(cb);
      return () => {
        const i = subs.indexOf(cb);
        if (i >= 0) subs.splice(i, 1);
      };
    },
    originalSetLink,
    __pushState: (state) => {
      if (state.selection) currentSelection = state.selection;
      subs.forEach((sub) => sub(state));
    },
  };

  return editor;
}

function Harness({ editor }: { editor: LinkPatchEditor | null }) {
  // Cast through unknown because the hook's prod type doesn't admit null,
  // but the hook's *implementation* has a null guard that we need to cover.
  useEditorLinkPatch(editor as unknown as LinkPatchEditor);
  return null;
}

function mount(editor: LinkPatchEditor) {
  let tree: renderer.ReactTestRenderer | undefined;
  act(() => {
    tree = renderer.create(<Harness editor={editor} />);
  });
  if (!tree) throw new Error('mount: renderer.create returned nothing');
  return tree;
}

describe('useEditorLinkPatch', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('after setLink(url) with a non-empty selection, moves the cursor to the end of the link', () => {
    const editor = makeFakeEditor({ from: 5, to: 10 });
    mount(editor);

    act(() => {
      editor.setLink('https://example.com');
    });

    // The wrapper forwards the original setLink call immediately.
    expect(editor.originalSetLink).toHaveBeenNthCalledWith(
      1,
      'https://example.com',
    );
    expect(editor.setSelection).not.toHaveBeenCalled();

    // Until the apply-delay elapses, no follow-up has fired yet.
    act(() => {
      jest.advanceTimersByTime(99);
    });
    expect(editor.setSelection).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1);
    });

    // After 100ms: cursor moves to the END of the link. We used to also fire
    // setLink('') here to clear stored marks via the unsetLink path, but that
    // destroyed the link we'd just inserted (TenTap's unsetLink handler runs
    // extendMarkRange first, which expanded the selection back over the link
    // when inclusive wasn't truly false at runtime). We rely on the inclusive
    // override + cursor reposition alone now.
    expect(editor.setSelection).toHaveBeenCalledWith(10, 10);
    expect(editor.originalSetLink).toHaveBeenCalledTimes(1);
  });

  it('setLink("") is a pass-through with no cleanup follow-up', () => {
    const editor = makeFakeEditor({ from: 5, to: 10 });
    mount(editor);

    act(() => {
      editor.setLink('');
    });
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(editor.originalSetLink).toHaveBeenCalledTimes(1);
    expect(editor.originalSetLink).toHaveBeenCalledWith('');
    expect(editor.setSelection).not.toHaveBeenCalled();
  });

  it('setLink(null) is a pass-through with no cleanup follow-up', () => {
    const editor = makeFakeEditor({ from: 5, to: 10 });
    mount(editor);

    act(() => {
      editor.setLink(null);
    });
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(editor.originalSetLink).toHaveBeenCalledTimes(1);
    expect(editor.originalSetLink).toHaveBeenCalledWith(null);
    expect(editor.setSelection).not.toHaveBeenCalled();
  });

  it('falls back to the last observed non-empty selection when the editor reports an empty selection at setLink time', () => {
    // Simulates: user selects "link" (3..7), opens the URL input, the editor
    // blurs which pushes a state update with the selection collapsed to
    // (7, 7), then the user hits Done. We want the cursor to still land at
    // position 7 (end of the original range), not at the post-blur empty
    // selection.
    const editor = makeFakeEditor({ from: 3, to: 7 });
    mount(editor);

    act(() => {
      editor.__pushState({ selection: { from: 3, to: 7 } });
    });
    act(() => {
      editor.__pushState({ selection: { from: 7, to: 7 } });
    });

    act(() => {
      editor.setLink('https://example.com');
    });
    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(editor.setSelection).toHaveBeenCalledWith(7, 7);
    expect(editor.originalSetLink).toHaveBeenCalledTimes(1);
  });

  it('no follow-up if there has never been a non-empty selection (defensive guard)', () => {
    const editor = makeFakeEditor({ from: 0, to: 0 });
    mount(editor);

    act(() => {
      editor.setLink('https://example.com');
    });
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(editor.originalSetLink).toHaveBeenCalledTimes(1);
    expect(editor.setSelection).not.toHaveBeenCalled();
  });

  it('apply-delay is configurable', () => {
    const editor = makeFakeEditor({ from: 5, to: 10 });
    function H() {
      useEditorLinkPatch(editor, { applyDelayMs: 250 });
      return null;
    }
    act(() => {
      renderer.create(<H />);
    });

    act(() => {
      editor.setLink('https://example.com');
    });
    act(() => {
      jest.advanceTimersByTime(249);
    });
    expect(editor.setSelection).not.toHaveBeenCalled();
    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(editor.setSelection).toHaveBeenCalledWith(10, 10);
  });

  it('null editor → skips wrap entirely (defensive guard for early mount)', () => {
    // The hook can be called before useEditorBridge has returned a non-null
    // editor on first render. The guard exits cleanly; nothing crashes.
    let tree: renderer.ReactTestRenderer | undefined;
    act(() => {
      tree = renderer.create(<Harness editor={null} />);
    });
    expect(tree).toBeDefined();
    // No spies were attached because nothing was wrapped — the test passes
    // by virtue of not throwing.
    act(() => {
      tree!.unmount();
    });
  });

  it('does not re-invoke setLink during the cleanup (regression: setLink("") was unsetting the link)', () => {
    const editor = makeFakeEditor({ from: 2, to: 6 });
    mount(editor);

    act(() => {
      editor.setLink('https://x.test');
    });
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Only the user's original setLink('https://x.test') should reach the
    // underlying bridge. The cleanup must not call setLink('') — TenTap's
    // unsetLink path destroys the link we just inserted (extendMarkRange
    // expands the selection back over it when inclusive isn't truly false).
    expect(editor.originalSetLink.mock.calls).toEqual([['https://x.test']]);
    expect(editor.setSelection).toHaveBeenCalledTimes(1);
    expect(editor.setSelection).toHaveBeenCalledWith(6, 6);
  });
});
