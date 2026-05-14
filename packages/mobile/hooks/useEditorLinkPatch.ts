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
export function useEditorLinkPatch(
  editor: LinkPatchEditor | null | undefined,
  { applyDelayMs = 100 }: LinkPatchOptions = {},
): void {
  const lastRangeRef = useRef<LinkPatchSelection | null>(null);

  useEffect(() => {
    if (!editor?._subscribeToEditorStateUpdate) return;
    return editor._subscribeToEditorStateUpdate((state) => {
      const sel = state?.selection;
      if (sel && sel.from !== sel.to) {
        lastRangeRef.current = { from: sel.from, to: sel.to };
      }
    });
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    const original = editor.setLink.bind(editor);
    editor.setLink = (link) => {
      if (!link) {
        original(link);
        return;
      }
      const fresh = editor.getEditorState()?.selection;
      const range =
        fresh && fresh.from !== fresh.to
          ? { from: fresh.from, to: fresh.to }
          : lastRangeRef.current;
      original(link);
      if (!range) return;
      setTimeout(() => {
        editor.setSelection(range.to, range.to);
        original('');
      }, applyDelayMs);
    };
  }, [editor, applyDelayMs]);
}
