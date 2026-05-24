import { useEffect, useRef } from 'react';

export type LinkPatchSelection = { from: number; to: number };

// Minimum shape of the editor bridge that this hook depends on. Kept narrow so
// tests can hand in a hand-rolled object without pulling TenTap.
export interface LinkPatchEditor {
  setLink: (link: string | null) => void;
  setSelection: (from: number, to: number) => void;
  getEditorState: () =>
    | { selection?: LinkPatchSelection | null }
    | null
    | undefined;
  _subscribeToEditorStateUpdate?: (
    cb: (state: { selection?: LinkPatchSelection | null }) => void,
  ) => () => void;
}

export interface LinkPatchOptions {
  // Milliseconds to wait between setLink and the cursor/stored-marks cleanup.
  // The WebView's setLink chain runs asynchronously; this gives it time to
  // commit so our follow-up setSelection lands on the post-link document.
  applyDelayMs?: number;
}

/**
 * Wraps editor.setLink so that after inserting a link the cursor lands at the
 * END of the linked text and ProseMirror's stored-marks state for `link` is
 * cleared. Without this:
 *
 *   1. TenTap's bridge handler runs `setTextSelection(selection.from)` —
 *      cursor lands at the START of the link.
 *   2. ProseMirror keeps `link` in stored marks at the cursor, so subsequent
 *      typing inherits the link even when the user manually moves the cursor.
 *
 * The hook subscribes to editor state updates to remember the most recent
 * non-empty selection. When setLink is called, it prefers the fresh editor
 * state but falls back to that remembered range — the editor blurs while the
 * URL input is focused on some platforms, which can collapse the state's
 * selection back to an empty cursor.
 *
 * After the delay it calls setSelection(to, to) to move the cursor past the
 * link, then re-invokes setLink('') — the empty-payload path in the link
 * bridge runs unsetLink() at the (now empty) selection, which clears the
 * stored `link` mark. The next character typed produces plain text.
 */
// Toggle via env or hard-set during debugging. Logs are prefixed so they're
// trivially greppable in Metro: `link-patch`.
const LOG_ENABLED = true;
const log = (...args: unknown[]) => {
  /* istanbul ignore else — LOG_ENABLED is a debug toggle; the else
     branch is only reachable if a developer flips the const to false. */
  if (LOG_ENABLED) {
    // eslint-disable-next-line no-console
    console.log('[link-patch]', ...args);
  }
};

export function useEditorLinkPatch(
  editor: LinkPatchEditor | null | undefined,
  { applyDelayMs = 100 }: LinkPatchOptions = {},
): void {
  const lastRangeRef = useRef<LinkPatchSelection | null>(null);

  useEffect(() => {
    if (!editor?._subscribeToEditorStateUpdate) {
      log('skip subscribe — editor missing _subscribeToEditorStateUpdate');
      return;
    }
    log('subscribed to editor state updates');
    return editor._subscribeToEditorStateUpdate((state) => {
      const sel = state?.selection;
      if (sel && sel.from !== sel.to) {
        lastRangeRef.current = { from: sel.from, to: sel.to };
        log('observed non-empty selection', sel.from, '..', sel.to);
      }
    });
  }, [editor]);

  useEffect(() => {
    if (!editor) {
      log('skip wrap — editor is null');
      return;
    }
    log('wrapping editor.setLink (apply delay =', applyDelayMs, 'ms)');
    const original = editor.setLink.bind(editor);
    editor.setLink = (link) => {
      log('setLink called with', JSON.stringify(link));
      if (!link) {
        log('  → pass-through (empty payload)');
        original(link);
        return;
      }
      const fresh = editor.getEditorState()?.selection;
      log('  fresh selection:', fresh);
      log('  last remembered range:', lastRangeRef.current);
      const range =
        fresh && fresh.from !== fresh.to
          ? { from: fresh.from, to: fresh.to }
          : lastRangeRef.current;
      log('  using range:', range);
      original(link);
      if (!range) {
        log('  → no range available, skipping cursor/stored-mark cleanup');
        return;
      }
      setTimeout(() => {
        log('  cleanup firing: setSelection(', range.to, ',', range.to, ')');
        editor.setSelection(range.to, range.to);
        // NOTE: we used to also call original("") here to clear stored marks
        // via TenTap's unsetLink path. That call relies on inclusive:false
        // making position `range.to` NOT part of the link mark — otherwise
        // extendMarkRange('link') inside the unset-link bridge handler
        // expands the selection back over the entire link and unsetLink
        // strips it. On-device logs proved that's exactly what was happening:
        // the link got inserted, then immediately removed.
        // Moving the cursor past the link, on its own, is enough — ProseMirror
        // resets stored marks based on the new cursor position. If subsequent
        // typing still inherits the link, the real problem is that
        // inclusive:false isn't being applied to the mark, and we need a
        // different strategy than poking the link bridge.
        log('  cleanup done');
      }, applyDelayMs);
    };
  }, [editor, applyDelayMs]);
}
