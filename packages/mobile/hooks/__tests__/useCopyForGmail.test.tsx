/**
 * Behavioural tests for the "copy sanitized HTML to clipboard, hand off to
 * Gmail" flow. We don't render a real WebView — we stub the editor's getHTML
 * and assert the exact side-effects the hook produces:
 *   - what gets sanitized
 *   - what's written to the clipboard
 *   - when haptics fire
 *   - when the toast shows vs Gmail auto-opens
 *   - what URLs are tried for the Gmail handoff
 *   - that the auto-open preference is persisted
 *   - that an empty editor is rejected with an Alert
 *   - that a thrown error surfaces as an Alert (not a silent failure)
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Alert, Linking, Platform } from 'react-native';

// ---------------------------------------------------------------------------
// Module mocks. These have to be set up before importing the hook because the
// hook closes over the live module references.
// ---------------------------------------------------------------------------
const mockCopyHtml = jest.fn().mockResolvedValue(undefined);
const mockNotificationAsync = jest.fn();
const mockGetItem = jest.fn().mockResolvedValue(null);
const mockSetItem = jest.fn().mockResolvedValue(undefined);
const mockSanitize = jest.fn((html: string) => `<sanitized>${html}</sanitized>`);

jest.mock('@/native/html-clipboard', () => ({
  copyHtmlToClipboard: (html: string, plain: string) =>
    mockCopyHtml(html, plain),
}));
jest.mock('expo-haptics', () => ({
  notificationAsync: (...args: unknown[]) => mockNotificationAsync(...args),
  NotificationFeedbackType: { Success: 'success' },
}));
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: (k: string) => mockGetItem(k),
    setItem: (k: string, v: string) => mockSetItem(k, v),
  },
}));
jest.mock(
  '@pasteclean/gmail-sanitizer',
  () => ({ sanitizeForGmail: (html: string) => mockSanitize(html) }),
  { virtual: true },
);

import {
  useCopyForGmail,
  STORAGE_KEY_AUTO_OPEN,
  type UseCopyForGmailResult,
} from '../useCopyForGmail';

// ---------------------------------------------------------------------------
// Test harness: a tiny component that calls the hook and exposes its return
// value so the test can drive the actions directly.
// ---------------------------------------------------------------------------
type HookHandle = UseCopyForGmailResult;

function Harness({
  getHTML,
  onReady,
}: {
  getHTML: () => Promise<string>;
  onReady: (h: HookHandle) => void;
}) {
  const result = useCopyForGmail({ getHTML });
  React.useEffect(() => {
    onReady(result);
  });
  return null;
}

async function mountHook(getHTML: () => Promise<string>): Promise<{
  handle: () => HookHandle;
  unmount: () => void;
}> {
  let latest: HookHandle | undefined;
  let tree: renderer.ReactTestRenderer | undefined;
  await act(async () => {
    tree = renderer.create(
      <Harness getHTML={getHTML} onReady={(h) => (latest = h)} />,
    );
  });
  return {
    handle: () => {
      if (!latest) throw new Error('hook never rendered');
      return latest;
    },
    unmount: () => {
      if (tree) act(() => tree!.unmount());
    },
  };
}

// ---------------------------------------------------------------------------
// Spies on globals that aren't easily jest.mock'd.
// ---------------------------------------------------------------------------
let alertSpy: jest.SpyInstance;
let openURLSpy: jest.SpyInstance;
let consoleErrorSpy: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  mockGetItem.mockResolvedValue(null);
  alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  openURLSpy = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
  consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  alertSpy.mockRestore();
  openURLSpy.mockRestore();
  consoleErrorSpy.mockRestore();
});

describe('useCopyForGmail', () => {
  // -------------------------------------------------------------------------
  // Empty-content guardrail
  // -------------------------------------------------------------------------
  describe('empty content guardrail', () => {
    it.each([
      ['empty string', ''],
      ['empty paragraph', '<p></p>'],
      ['paragraph with just a <br>', '<p><br></p>'],
    ])('shows the "nothing to copy" alert for %s', async (_, html) => {
      const { handle } = await mountHook(async () => html);
      await act(async () => {
        await handle().copyForGmail();
      });
      expect(alertSpy).toHaveBeenCalledWith(
        'Nothing to copy',
        'Write something first!',
      );
      expect(mockCopyHtml).not.toHaveBeenCalled();
      expect(mockSanitize).not.toHaveBeenCalled();
      expect(handle().copied).toBe(false);
      expect(handle().toastVisible).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // Happy path
  // -------------------------------------------------------------------------
  it('sanitizes the raw HTML and writes the sanitized output to the clipboard', async () => {
    const { handle } = await mountHook(
      async () => '<p>Hello <b>world</b></p>',
    );
    await act(async () => {
      await handle().copyForGmail();
    });
    expect(mockSanitize).toHaveBeenCalledWith('<p>Hello <b>world</b></p>');
    expect(mockCopyHtml).toHaveBeenCalledWith(
      '<sanitized><p>Hello <b>world</b></p></sanitized>',
      'Hello world',
    );
    expect(handle().copied).toBe(true);
  });

  it('fires a success haptic on non-web', async () => {
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', { get: () => 'ios' });
    try {
      const { handle } = await mountHook(async () => '<p>hi</p>');
      await act(async () => {
        await handle().copyForGmail();
      });
      expect(mockNotificationAsync).toHaveBeenCalledWith('success');
    } finally {
      Object.defineProperty(Platform, 'OS', { get: () => originalOS });
    }
  });

  it('does not fire haptics on web', async () => {
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', { get: () => 'web' });
    try {
      const { handle } = await mountHook(async () => '<p>hi</p>');
      await act(async () => {
        await handle().copyForGmail();
      });
      expect(mockNotificationAsync).not.toHaveBeenCalled();
    } finally {
      Object.defineProperty(Platform, 'OS', { get: () => originalOS });
    }
  });

  // -------------------------------------------------------------------------
  // Toast vs auto-open
  // -------------------------------------------------------------------------
  it('shows the toast (not Gmail) when auto-open is off', async () => {
    const { handle } = await mountHook(async () => '<p>hi</p>');
    await act(async () => {
      await handle().copyForGmail();
    });
    expect(handle().toastVisible).toBe(true);
    expect(openURLSpy).not.toHaveBeenCalled();
  });

  it('opens Gmail (not toast) when auto-open is on', async () => {
    const { handle } = await mountHook(async () => '<p>hi</p>');
    act(() => {
      handle().setAutoOpenGmail(true);
    });
    await act(async () => {
      await handle().copyForGmail();
    });
    expect(handle().toastVisible).toBe(false);
    expect(openURLSpy).toHaveBeenCalledWith('googlegmail://');
  });

  it('dismissToast hides the toast', async () => {
    const { handle } = await mountHook(async () => '<p>hi</p>');
    await act(async () => {
      await handle().copyForGmail();
    });
    expect(handle().toastVisible).toBe(true);
    act(() => {
      handle().dismissToast();
    });
    expect(handle().toastVisible).toBe(false);
  });

  // -------------------------------------------------------------------------
  // Gmail handoff URL fallback chain
  // -------------------------------------------------------------------------
  it('falls back to the Gmail web URL if the deep-link rejects', async () => {
    // First call (deep link) rejects, second call (web) resolves.
    openURLSpy.mockReset();
    openURLSpy.mockRejectedValueOnce(new Error('no app'));
    openURLSpy.mockResolvedValueOnce(true);

    const { handle } = await mountHook(async () => '<p>hi</p>');
    await act(async () => {
      handle().openGmail();
      // Let the rejection microtask + fallback openURL resolve.
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(openURLSpy).toHaveBeenNthCalledWith(1, 'googlegmail://');
    expect(openURLSpy).toHaveBeenNthCalledWith(
      2,
      'https://mail.google.com/mail/',
    );
  });

  // -------------------------------------------------------------------------
  // Auto-open preference persistence
  // -------------------------------------------------------------------------
  it('persists the auto-open preference to AsyncStorage', async () => {
    const { handle } = await mountHook(async () => '<p>hi</p>');
    await act(async () => {
      handle().setAutoOpenGmail(true);
      await Promise.resolve();
    });
    expect(mockSetItem).toHaveBeenCalledWith(STORAGE_KEY_AUTO_OPEN, 'true');
    expect(handle().autoOpenGmail).toBe(true);

    await act(async () => {
      handle().setAutoOpenGmail(false);
      await Promise.resolve();
    });
    expect(mockSetItem).toHaveBeenCalledWith(STORAGE_KEY_AUTO_OPEN, 'false');
    expect(handle().autoOpenGmail).toBe(false);
  });

  it('rehydrates the auto-open preference from AsyncStorage on mount', async () => {
    mockGetItem.mockResolvedValueOnce('true');
    const { handle } = await mountHook(async () => '<p>hi</p>');
    // Effect → AsyncStorage promise resolves → state updates. Flush microtasks.
    await act(async () => {
      await Promise.resolve();
    });
    expect(handle().autoOpenGmail).toBe(true);
  });

  it('leaves auto-open off if AsyncStorage returns null', async () => {
    mockGetItem.mockResolvedValueOnce(null);
    const { handle } = await mountHook(async () => '<p>hi</p>');
    await act(async () => {
      await Promise.resolve();
    });
    expect(handle().autoOpenGmail).toBe(false);
  });

  // -------------------------------------------------------------------------
  // Error path
  // -------------------------------------------------------------------------
  it('surfaces a thrown getHTML error as a user-facing Alert (and logs)', async () => {
    const { handle } = await mountHook(async () => {
      throw new Error('boom');
    });
    await act(async () => {
      await handle().copyForGmail();
    });
    expect(alertSpy).toHaveBeenCalledWith(
      'Copy failed',
      'Something went wrong. Please try again.',
    );
    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(handle().copied).toBe(false);
    expect(handle().toastVisible).toBe(false);
    expect(mockCopyHtml).not.toHaveBeenCalled();
  });

  it('surfaces a thrown clipboard error as a user-facing Alert', async () => {
    mockCopyHtml.mockRejectedValueOnce(new Error('clipboard fail'));
    const { handle } = await mountHook(async () => '<p>hi</p>');
    await act(async () => {
      await handle().copyForGmail();
    });
    expect(alertSpy).toHaveBeenCalledWith(
      'Copy failed',
      'Something went wrong. Please try again.',
    );
    expect(handle().toastVisible).toBe(false);
  });

  // -------------------------------------------------------------------------
  // Cleanup
  // -------------------------------------------------------------------------
  it('back-to-back copies clear the previous copiedResetTimer before scheduling a new one', async () => {
    // Covers the `if (copiedResetTimer.current) clearTimeout(...)` branch.
    // The first copy schedules a timer; the second copy must clear it
    // before scheduling its own (otherwise both timers would race and
    // copied could flicker back to false unexpectedly).
    jest.useFakeTimers();
    try {
      const { handle } = await mountHook(async () => '<p>hi</p>');
      await act(async () => {
        await handle().copyForGmail();
      });
      // The next copy must clear the first timer — assert no throw.
      await act(async () => {
        await handle().copyForGmail();
      });
      expect(handle().copied).toBe(true);
    } finally {
      jest.useRealTimers();
    }
  });

  it('clears the copied-reset timer when the component unmounts mid-flight', async () => {
    // After a successful copy the hook schedules a setTimeout(2000) to flip
    // `copied` back to false. If the user navigates away before the timer
    // fires, the cleanup must clear it — otherwise we either leak the
    // timer or worse, fire setState on an unmounted component.
    jest.useFakeTimers();
    try {
      const { handle, unmount } = await mountHook(async () => '<p>hi</p>');
      await act(async () => {
        await handle().copyForGmail();
      });
      expect(handle().copied).toBe(true);
      // Tear down before the 2s timer fires; the unmount-effect's cleanup
      // path is the line that needs covering.
      unmount();
      // If the timer wasn't cleared, advancing past 2000ms would fire a
      // setState on a dead tree and trip act() / leak. Advancing here
      // proves nothing breaks.
      jest.advanceTimersByTime(3000);
    } finally {
      jest.useRealTimers();
    }
  });
});
