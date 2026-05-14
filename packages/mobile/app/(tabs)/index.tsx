import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  StatusBar,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useColorScheme } from '@/components/useColorScheme';
import { getColors, resolveAccent } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { GmailHandoffToast } from '@/components/GmailHandoffToast';
import { sanitizeForGmail } from '@pasteclean/gmail-sanitizer';
import {
  RichText,
  Toolbar,
  useEditorBridge,
  DEFAULT_TOOLBAR_ITEMS,
  darkEditorTheme,
  darkEditorCss,
  defaultEditorTheme,
} from '@10play/tentap-editor';

const STORAGE_KEY_AUTO_OPEN = '@pasteclean/auto_open_gmail';

// ---------------------------------------------------------------------------
// BrandMark: 32x32 rounded-rect icon (clipboard + check, approximated with
// FontAwesome icons on a translucent white background)
// ---------------------------------------------------------------------------
function BrandMark() {
  return (
    <View style={brandStyles.container}>
      <FontAwesome name="clipboard" size={16} color="#fff" />
    </View>
  );
}

const brandStyles = StyleSheet.create({
  container: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// ---------------------------------------------------------------------------
// Editor screen
// ---------------------------------------------------------------------------
export default function EditorScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = getColors(isDark);
  const insets = useSafeAreaInsets();
  const { accent } = useTheme();
  const a = resolveAccent(accent, isDark);
  const router = useRouter();

  const [copied, setCopied] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [autoOpenGmail, setAutoOpenGmail] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Keyboard listener — drives toolbar visibility. When the keyboard is up
  // we show the formatting toolbar above it (TenTap's auto-hide via
  // isFocused doesn't fire reliably for our WebView). When it's down the
  // floating nav owns the bottom of the screen.
  React.useEffect(() => {
    const showEvt =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvt, () =>
      setKeyboardVisible(true),
    );
    const hideSub = Keyboard.addListener(hideEvt, () =>
      setKeyboardVisible(false),
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Load auto-open preference
  React.useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY_AUTO_OPEN).then((val) => {
      if (val === 'true') setAutoOpenGmail(true);
    });
  }, []);

  const handleAutoOpenChange = useCallback((value: boolean) => {
    setAutoOpenGmail(value);
    AsyncStorage.setItem(STORAGE_KEY_AUTO_OPEN, value ? 'true' : 'false');
  }, []);

  const openGmail = useCallback(() => {
    setToastVisible(false);
    Linking.openURL('googlegmail://co').catch(() => {
      Linking.openURL('https://mail.google.com/mail/u/0/#drafts');
    });
  }, []);

  const dismissToast = useCallback(() => {
    setToastVisible(false);
  }, []);

  // Pick TenTap's prebuilt dark/light theme — this drives the WebView
  // container + toolbar surface colors. The HTML body inside the WebView is
  // recolored separately via editor.injectCSS() below.
  const editor = useEditorBridge({
    autofocus: false,
    avoidIosKeyboard: true,
    initialContent: '',
    theme: isDark ? darkEditorTheme : defaultEditorTheme,
  });

  // Push the theme CSS into the WebView. TenTap's `editorState.isReady`
  // doesn't flip reliably for us (a known race in useBridgeState), so
  // instead of gating on it we just retry the injection on a schedule.
  // Whichever attempt lands after the WebView has booted wins; later
  // attempts are idempotent thanks to the 'pc-theme' tag replacing itself.
  React.useEffect(() => {
    const bg = isDark ? '#1C1C1E' : '#FFFFFF';
    const fg = isDark ? '#FFFFFF' : '#1C1C1E';
    // System font, body padding aligned to the chrome (18px), and zeroed
    // ProseMirror margins so the placeholder/caret start at the same
    // horizontal position as the "To" / "Subject" labels above instead of
    // indented by the default <p>/.ProseMirror padding.
    const fontStack =
      '-apple-system, "SF Pro Text", BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif';
    // Horizontal padding is provided by the RN wrapper now (paddingHorizontal:
    // 18 on editorWrap). CSS keeps margins/padding to 0 so the editor sits
    // flush inside the wrapper without compounding offsets.
    const baseCss = `
      html, body {
        margin: 0;
        padding: 12px 0 0;
        box-sizing: border-box;
        font-family: ${fontStack};
        font-size: 16px;
        line-height: 1.5;
        -webkit-font-smoothing: antialiased;
      }
      .ProseMirror {
        padding: 0;
        margin: 0;
        outline: none;
      }
      .ProseMirror p {
        margin: 0 0 0.5em;
      }
      .ProseMirror p.is-editor-empty:first-child::before {
        font-family: ${fontStack};
        margin: 0;
        padding: 0;
        left: 0;
      }
    `;
    const css = isDark ? `${darkEditorCss}\n${baseCss}` : baseCss;
    const apply = () => {
      editor.injectCSS(css, 'pc-theme');
      editor.injectJS(
        `document.documentElement.style.backgroundColor='${bg}';` +
          `document.body.style.backgroundColor='${bg}';` +
          `document.body.style.color='${fg}';`,
      );
    };
    apply();
    const timers = [100, 400, 900, 1800, 3500].map((ms) =>
      setTimeout(apply, ms),
    );
    return () => timers.forEach(clearTimeout);
  }, [editor, isDark]);

  React.useEffect(() => {
    editor.setPlaceholder('Start writing your email here...');
  }, [editor]);

  // --- Copy sanitized HTML to clipboard -----------------------------------
  const handleCopyForGmail = useCallback(async () => {
    try {
      const html = await editor.getHTML();

      if (!html || html === '<p></p>' || html === '<p><br></p>') {
        Alert.alert('Nothing to copy', 'Write something first!');
        return;
      }

      const sanitized = sanitizeForGmail(html);
      await Clipboard.setStringAsync(sanitized);

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      // Auto-open Gmail if preference is set; otherwise show toast
      if (autoOpenGmail) {
        openGmail();
      } else {
        setToastVisible(true);
      }
    } catch (error) {
      Alert.alert('Copy failed', 'Something went wrong. Please try again.');
      console.error('Copy error:', error);
    }
  }, [editor, autoOpenGmail, openGmail]);

  // --- Navigate to preview ------------------------------------------------
  const handlePreview = useCallback(async () => {
    const html = await editor.getHTML();
    router.push({
      pathname: '/preview',
      params: { html },
    });
  }, [editor, router]);

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}>
      <StatusBar barStyle="light-content" />

      {/* ================================================================ */}
      {/* 1. Branded header                                                */}
      {/* ================================================================ */}
      <View style={[styles.header, { backgroundColor: a, paddingTop: insets.top + 12 }]}>
        {/* Left: brand mark + title */}
        <View style={styles.headerLeft}>
          <BrandMark />
          <View style={styles.headerTitleGroup}>
            <Text style={styles.headerTitle}>PasteClean</Text>
            <Text style={styles.headerSubtitle}>New draft</Text>
          </View>
        </View>

        {/* Right: preview + copy */}
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={handlePreview}
            style={styles.previewBtn}
            hitSlop={8}
            activeOpacity={0.7}>
            <FontAwesome name="eye" size={18} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleCopyForGmail}
            style={[
              styles.copyPill,
              {
                backgroundColor: copied ? '#34C759' : '#fff',
              },
            ]}
            activeOpacity={0.7}
            hitSlop={4}>
            {copied && (
              <FontAwesome name="check" size={14} color="#fff" />
            )}
            <Text
              style={[
                styles.copyPillText,
                { color: copied ? '#fff' : a },
              ]}>
              {copied ? 'Copied!' : 'Copy'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ================================================================ */}
      {/* 2. Compose fields (To / Subject) — static placeholders, not       */}
      {/*    tappable. The editor body is the only typing surface.          */}
      {/* ================================================================ */}
      <View style={[styles.composeFields, { backgroundColor: colors.bg }]}>
        <View
          style={[
            styles.composeRow,
            { borderBottomColor: colors.sep, borderBottomWidth: 0.5 },
          ]}>
          <Text style={[styles.fieldLabel, { color: colors.fieldLabel }]}>
            To
          </Text>
          <Text style={[styles.fieldPlaceholder, { color: colors.fgFaint }]}>
            placeholder
          </Text>
        </View>

        <View
          style={[
            styles.composeRow,
            { borderBottomColor: colors.sep, borderBottomWidth: 0.5 },
          ]}>
          <Text style={[styles.fieldLabel, { color: colors.fieldLabel }]}>
            Subject
          </Text>
          <Text style={[styles.fieldPlaceholder, { color: colors.fgFaint }]}>
            placeholder
          </Text>
        </View>
      </View>

      {/* ================================================================ */}
      {/* 3. Rich text editor body                                         */}
      {/*    Outer wrapper matches the WebView background AND owns the     */}
      {/*    horizontal indent. Using wrapper padding (not WebView CSS)    */}
      {/*    means the editor stays correctly inset even before our        */}
      {/*    injectCSS lands — no cold-start flash from 0 padding to       */}
      {/*    18 padding. The `key` forces a remount when the system theme  */}
      {/*    flips — TenTap's WebView reads webview.backgroundColor only   */}
      {/*    at mount time.                                                */}
      {/* ================================================================ */}
      <View
        key={isDark ? 'dark' : 'light'}
        style={[
          styles.editorWrap,
          { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' },
        ]}>
        <RichText editor={editor} style={styles.richText} />
      </View>

      {/* ================================================================ */}
      {/* 4. Formatting toolbar                                            */}
      {/* ================================================================ */}
      {/* Toolbar wrap renders only when the keyboard is up. This way the
          floating nav owns the bottom while at rest, and the toolbar takes
          its place above the keyboard during composition. */}
      {keyboardVisible && (
        <View
          style={[
            styles.toolbarWrap,
            {
              backgroundColor: colors.toolBg,
              borderTopColor: colors.sep,
            },
          ]}>
          <Toolbar
            editor={editor}
            items={DEFAULT_TOOLBAR_ITEMS}
            hidden={false}
          />
        </View>
      )}

      {/* ================================================================ */}
      {/* 5. Gmail handoff toast                                           */}
      {/*    (Floating nav is rendered at the tabs layout level.)          */}
      {/* ================================================================ */}
      <GmailHandoffToast
        visible={toastVisible}
        dark={isDark}
        accent={accent}
        onDismiss={dismissToast}
        onOpenGmail={openGmail}
        autoOpen={autoOpenGmail}
        onAutoOpenChange={handleAutoOpenChange}
      />
    </KeyboardAvoidingView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  // --- Header --- (paddingTop is set inline from safe-area insets)
  header: {
    paddingBottom: 14,
    paddingLeft: 18,
    paddingRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitleGroup: {
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.78)',
    textTransform: 'uppercase',
    letterSpacing: 0.2,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  previewBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyPill: {
    height: 36,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  copyPillText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.1,
  },

  // --- Compose fields ---
  composeFields: {},
  composeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 42,
    paddingHorizontal: 18,
  },
  fieldLabel: {
    width: 56,
    fontSize: 13,
    fontWeight: '500',
  },
  fieldPlaceholder: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 10,
  },

  // --- Editor body ---
  // Horizontal padding aligns the text with the chrome ("To" / "Subject"
  // labels at 18pt). Lives on the wrapper, not in the WebView CSS, so the
  // editor is correctly inset before our CSS injection lands.
  editorWrap: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  // No paddingHorizontal here: the RichText component paints its own
  // (default-white) frame onto whatever `style` we pass, so any padding
  // turns into white strips on the sides in dark mode. Body padding lives
  // in the WebView's HTML/CSS instead.
  richText: {
    flex: 1,
  },

  // --- Toolbar wrapper ---
  // Explicit height so TenTap's FlatList (flex: 1 + height: 44) has a
  // defined parent to render into — without it the FlatList collapses to
  // zero height and the toolbar is invisible.
  toolbarWrap: {
    height: 44,
    borderTopWidth: 0.5,
  },

});
