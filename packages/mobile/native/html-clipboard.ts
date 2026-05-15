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
