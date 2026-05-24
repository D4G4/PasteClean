import { NativeModules, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';

const { HtmlClipboard } = NativeModules;

/**
 * Copy sanitized HTML to the system clipboard.
 *
 * On iOS, writes raw HTML data (`public.html`) + plain-text fallback directly
 * to UIPasteboard via a native module. This preserves inline styles that
 * Gmail's WKWebView compose reads on paste — unlike expo-clipboard's HTML mode
 * which round-trips through NSAttributedString and loses formatting.
 *
 * Falls back to expo-clipboard on platforms where the native module isn't
 * available (web, Android).
 */
export async function copyHtmlToClipboard(
  html: string,
  plainText: string,
): Promise<void> {
  if (Platform.OS === 'ios' && HtmlClipboard?.setHtml) {
    // eslint-disable-next-line no-console
    console.log('[html-clipboard] using native module');
    return HtmlClipboard.setHtml(html, plainText);
  }
  // eslint-disable-next-line no-console
  console.log('[html-clipboard] falling back to expo-clipboard');
  await Clipboard.setStringAsync(html, {
    inputFormat: Clipboard.StringFormat.HTML,
  });
}

/**
 * Returns the type identifiers currently on UIPasteboard (iOS only). Used
 * by the Maestro clipboard-format flow to verify that
 * `com.apple.webarchive` lands on the pasteboard after a Copy — the
 * marker that proves the native module survived prebuild AND that
 * Gmail's WKWebView will preserve formatting on paste.
 *
 * Returns null on platforms / builds where the native module isn't wired
 * (Android, web, or the broken v1.1.0-class state). Callers that need
 * to assert the type list should treat null as "we have nothing to
 * inspect" — that itself is the regression signal.
 */
export async function getAvailableClipboardTypes(): Promise<string[] | null> {
  if (Platform.OS !== 'ios' || !HtmlClipboard?.getAvailableTypes) {
    return null;
  }
  const json: string = await HtmlClipboard.getAvailableTypes();
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
