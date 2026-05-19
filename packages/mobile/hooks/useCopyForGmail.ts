import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sanitizeForGmail } from '@pasteclean/gmail-sanitizer';
import { copyHtmlToClipboard } from '@/native/html-clipboard';

export const STORAGE_KEY_AUTO_OPEN = '@pasteclean/auto_open_gmail';

// TenTap's editor bridge surface that we depend on. Narrow on purpose so tests
// can hand in a hand-rolled stub.
export interface CopyForGmailEditor {
  getHTML: () => Promise<string>;
}

export interface UseCopyForGmailResult {
  copied: boolean;
  toastVisible: boolean;
  autoOpenGmail: boolean;
  setAutoOpenGmail: (value: boolean) => void;
  copyForGmail: () => Promise<void>;
  openGmail: () => void;
  dismissToast: () => void;
}

// Strings TipTap/TenTap produce when the editor is effectively empty.
const EMPTY_HTML_FORMS = new Set(['', '<p></p>', '<p><br></p>']);

/**
 * Encapsulates the "copy sanitized HTML to clipboard, then offer to hand off
 * to Gmail" flow that sits behind the editor's Copy button. Owns:
 *   - the auto-open-Gmail preference (persisted in AsyncStorage)
 *   - the transient `copied` chip state (auto-clears after 2s)
 *   - the post-copy toast visibility (suppressed when auto-open is on)
 *
 * The flow:
 *   1. Pull HTML from the editor.
 *   2. If empty, raise an Alert and stop.
 *   3. Run the gmail-sanitizer over it and set the clipboard.
 *   4. Fire a success haptic (non-web only).
 *   5. Either open Gmail directly (if auto-open is on) or show the toast.
 *
 * Errors anywhere in the chain surface as a single user-facing Alert and a
 * console.error so they're visible in dev logs.
 */
export function useCopyForGmail(
  editor: CopyForGmailEditor,
): UseCopyForGmailResult {
  const [copied, setCopied] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [autoOpenGmail, setAutoOpenGmailState] = useState(false);
  // Track the "clear copied chip" timer so unmount doesn't fire setState on a
  // dead component during tests with fake timers.
  const copiedResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY_AUTO_OPEN).then((val) => {
      if (val === 'true') setAutoOpenGmailState(true);
    });
  }, []);

  useEffect(() => {
    return () => {
      if (copiedResetTimer.current) clearTimeout(copiedResetTimer.current);
    };
  }, []);

  const setAutoOpenGmail = useCallback((value: boolean) => {
    setAutoOpenGmailState(value);
    AsyncStorage.setItem(STORAGE_KEY_AUTO_OPEN, value ? 'true' : 'false');
  }, []);

  const openGmail = useCallback(() => {
    setToastVisible(false);
    // Just bring Gmail to the foreground — no specific path so the user
    // lands wherever they left off (e.g. mid-compose). Falls back to Gmail
    // web if the app isn't installed.
    Linking.openURL('googlegmail://').catch(() => {
      Linking.openURL('https://mail.google.com/mail/');
    });
  }, []);

  const dismissToast = useCallback(() => {
    setToastVisible(false);
  }, []);

  const copyForGmail = useCallback(async () => {
    try {
      const html = await editor.getHTML();
      if (EMPTY_HTML_FORMS.has(html)) {
        Alert.alert('Nothing to copy', 'Write something first!');
        return;
      }
      const sanitized = sanitizeForGmail(html);
      const plainText = sanitized.replace(/<[^>]*>/g, '').trim();
      await copyHtmlToClipboard(sanitized, plainText);

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      setCopied(true);
      if (copiedResetTimer.current) clearTimeout(copiedResetTimer.current);
      copiedResetTimer.current = setTimeout(() => setCopied(false), 2000);

      if (autoOpenGmail) {
        openGmail();
      } else {
        setToastVisible(true);
      }
    } catch (error) {
      Alert.alert('Copy failed', 'Something went wrong. Please try again.');
      // eslint-disable-next-line no-console
      console.error('Copy error:', error);
    }
  }, [editor, autoOpenGmail, openGmail]);

  return {
    copied,
    toastVisible,
    autoOpenGmail,
    setAutoOpenGmail,
    copyForGmail,
    openGmail,
    dismissToast,
  };
}
