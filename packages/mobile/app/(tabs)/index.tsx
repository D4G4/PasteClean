import React, { useCallback, useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useColorScheme } from '@/components/useColorScheme';
import { getColors, resolveAccent } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { GmailHandoffToast } from '@/components/GmailHandoffToast';
import { useEditorLinkPatch } from '@/hooks/useEditorLinkPatch';
import { useCopyForGmail } from '@/hooks/useCopyForGmail';
import {
  RichText,
  Toolbar,
  useEditorBridge,
  DEFAULT_TOOLBAR_ITEMS,
  darkEditorTheme,
  defaultEditorTheme,
  LinkBridge,
  PlaceholderBridge,
  TenTapStartKit,
} from '@10play/tentap-editor';

const STORAGE_KEY_AUTO_OPEN = '@pasteclean/auto_open_gmail';

// Two extension customisations baked in at construction time:
//   1. Link mark: default is `inclusive: true`, which traps the cursor inside
//      the link after Insert so subsequent typing inherits the underline.
//      We flip to `inclusive: false` so the link ends at the inserted text.
//   2. Placeholder: default is "Write something …". Configuring it here
//      (rather than via editor.setPlaceholder() after mount) ensures the
//      string is set before the WebView's first paint, instead of relying
//      on an async bridge message that races the WebView's JS bootstrap.
const bridgeExtensions = TenTapStartKit.map((ext) => {
  if (ext.name === 'link') {
    return LinkBridge.extendExtension({ inclusive: false });
  }
  if (ext.name === 'placeholder') {
    // configureExtension → TipTap's .configure(); extendExtension →
    // TipTap's .extend(). For setting options like the placeholder
    // string, configure is the right method.
    return PlaceholderBridge.configureExtension({
      placeholder: 'Start writing your email here...',
    });
  }
  return ext;
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

  const [keyboardVisible, setKeyboardVisible] = useState(false);
  // editorReady gates the RichText opacity. We flip it true only after the
  // WebView's document has loaded AND we've had a chance to inject our CSS.
  // Until then the WebView is invisible — the user never sees the brief
  // window where the placeholder is rendered in TenTap's default font and
  // then reflows into our system font.
  const [editorReady, setEditorReady] = useState(false);

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

  // Pick TenTap's prebuilt dark/light theme — this drives the WebView
  // container + toolbar surface colors. The HTML body inside the WebView is
  // recolored separately via editor.injectCSS() below.
  const editor = useEditorBridge({
    // autofocus:true makes TenTap focus the editor when the WebView's JS
    // signals EditorReady (the bridge handles this internally via the
    // CoreEditorActionType.EditorReady message handler). This is the
    // right hook for "open keyboard on cold launch" — manual editor.focus()
    // calls from onLoad fire too early; the bridge isn't ready yet and
    // the focus command is silently dropped.
    autofocus: true,
    // MUST stay true. This is TenTap's internal handling of the WebView's
    // viewport/caret when the iOS keyboard appears. The layout below keeps
    // RichText in normal flow (NOT inside a KeyboardAvoidingView) — only
    // the Toolbar is wrapped in KAV and absolutely positioned. With that
    // layout, this internal handling is the right way to keep the cursor
    // in view without "double-compensation scroll on Enter" (the bug where
    // pressing Return scrolls earlier content off screen).
    avoidIosKeyboard: true,
    initialContent: '',
    bridgeExtensions,
    theme: isDark
      ? {
          ...darkEditorTheme,
          webview: { backgroundColor: '#000000' },
        }
      : defaultEditorTheme,
  });

  useEditorLinkPatch(editor);

  const {
    copied,
    toastVisible,
    autoOpenGmail,
    setAutoOpenGmail,
    copyForGmail,
    openGmail,
    dismissToast,
  } = useCopyForGmail(editor);

  // CSS the WebView gets — recomputed when the theme flips so a runtime
  // dark/light switch can re-inject without rebuilding the editor.
  const themeCss = useMemo(() => {
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
        /* Bottom padding gives the document scroll room past the cursor.
           When the user types the last line of a long email with the
           keyboard up, this lets them scroll the cursor up to a comfortable
           mid-screen position instead of being pinned to the bottom edge.
           50vh = half the viewport, matching Bear / Notion / Apple Mail. */
        padding: 12px 0 50vh;
        box-sizing: border-box;
        font-family: ${fontStack};
        font-size: 16px;
        font-weight: 500;
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
    // Custom dark CSS instead of TenTap's darkEditorCss (which hardcodes
    // #1C1C1E). We use true black (#000000) to match the page background.
    //
    // Body owns the background; child elements inherit transparent so
    // WebKit's selection highlight has somewhere to render. A blanket
    // `* { background: #000 }` (the previous rule) forced every span/p
    // to paint its own black layer ON TOP of the selection highlight,
    // making double-tap-to-select look broken (selection happened but
    // wasn't visible).
    const darkCss = `
      html, body {
        background-color: #000000;
        color: white;
      }
      ::selection {
        background-color: rgba(0, 122, 255, 0.45);
        color: white;
      }
      blockquote {
        border-left: 3px solid #babaca;
        padding-left: 1rem;
      }
      .highlight-background {
        background-color: #474749;
      }
    `;
    return isDark ? `${darkCss}\n${baseCss}` : baseCss;
  }, [isDark]);

  const applyTheme = useCallback(() => {
    const bg = isDark ? '#000000' : '#FFFFFF';
    const fg = isDark ? '#FFFFFF' : '#1C1C1E';
    editor.injectCSS(themeCss, 'pc-theme');
    editor.injectJS(
      `document.documentElement.style.backgroundColor='${bg}';` +
        `document.body.style.backgroundColor='${bg}';` +
        `document.body.style.color='${fg}';`,
    );
  }, [editor, themeCss, isDark]);

  // Theme flip after the editor is already up: re-inject so the live
  // WebView reflects the new colors. Cold-start injection lives in
  // handleWebViewLoad — we only re-run here when the WebView is already
  // loaded, which is what editorReady gates on.
  React.useEffect(() => {
    if (editorReady) {
      applyTheme();
    }
  }, [editorReady, applyTheme]);

  // Fires once the WebView's document has finished loading. This is the
  // earliest reliable moment to inject CSS — the previous approach (timer
  // schedule at 100/400/900/1800/3500ms) caused a visible "default font →
  // system font" reflow of the placeholder on cold start because the first
  // few timers fired before the WebView was ready.
  const handleWebViewLoad = useCallback(() => {
    applyTheme();
    // Placeholder is configured at bridge construction time (see
    // bridgeExtensions above) so it's in the WebView's first paint —
    // no async setPlaceholder() call needed here. Focus is driven by
    // TenTap's autofocus flag, which listens for EditorReady from the
    // WebView side.
    //
    // 120ms paint-settle window: long enough for the injectCSS round-trip
    // to land and the browser to lay out, short enough to feel instant.
    // RichText stays at opacity:0 until this fires.
    setTimeout(() => setEditorReady(true), 120);
  }, [applyTheme]);

  // Safety net: if onLoad never fires for some reason (it should, every
  // time), reveal the editor anyway after 2s so it's never stuck invisible.
  React.useEffect(() => {
    const t = setTimeout(() => setEditorReady(true), 2000);
    return () => clearTimeout(t);
  }, []);

  // --- Navigate to preview ------------------------------------------------
  const handlePreview = useCallback(async () => {
    const html = await editor.getHTML();
    router.push({
      pathname: '/preview',
      params: { html },
    });
  }, [editor, router]);

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle="light-content" />

      {/* ================================================================ */}
      {/* 1. Branded header                                                */}
      {/* ================================================================ */}
      <View style={[styles.header, { backgroundColor: a, paddingTop: insets.top + 12 }]}>
        {/* Left: settings + brand mark + title */}
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => router.navigate('/settings' as never)}
            style={styles.settingsBtn}
            hitSlop={8}
            activeOpacity={0.7}
            testID="settings-button"
            accessibilityLabel="Settings">
            <FontAwesome name="cog" size={18} color="#fff" />
          </TouchableOpacity>
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
            activeOpacity={0.7}
            testID="preview-button"
            accessibilityLabel="Preview">
            <FontAwesome name="eye" size={18} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              editor.blur();
              copyForGmail();
            }}
            style={[
              styles.copyPill,
              {
                backgroundColor: copied ? '#34C759' : '#fff',
              },
            ]}
            activeOpacity={0.7}
            hitSlop={4}
            testID="copy-button"
            accessibilityLabel={copied ? 'Copied' : 'Copy to Gmail'}>
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
        testID="editor-body"
        style={[
          styles.editorWrap,
          {
            backgroundColor: isDark ? '#000000' : '#FFFFFF',
            // Reserve room at the bottom for the floating toolbar so the
            // editor's last lines aren't covered when the keyboard is up.
            paddingBottom: keyboardVisible ? TOOLBAR_HEIGHT : 0,
          },
        ]}>
        <RichText
          editor={editor}
          onLoad={handleWebViewLoad}
          style={[
            styles.richText,
            {
              backgroundColor: isDark ? '#000000' : '#FFFFFF',
              opacity: editorReady ? 1 : 0,
            },
          ]}
        />
      </View>

      {/* ================================================================ */}
      {/* 4. Formatting toolbar                                            */}
      {/* ================================================================ */}
      {/* The KeyboardAvoidingView is ALWAYS mounted, even when the keyboard
          is down. Reason: KAV's UIKeyboardWillShow listener attaches at
          mount. If we mount KAV conditionally on keyboardVisible, KAV
          mounts AFTER the keyboard's show event has fired — its listener
          never sees it — and KAV sits at bottom:0 with no inset, hiding
          the toolbar behind the keyboard (the exact regression we kept
          hitting). Always-mounted KAV → listener always live → correct
          inset every time.

          The toolbar's *contents* still render conditionally so the
          floating nav owns the bottom when the keyboard's down. */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.toolbarKav}
        pointerEvents="box-none">
        {keyboardVisible && (
          <View
            style={[
              styles.toolbarWrap,
              {
                backgroundColor: colors.toolBg,
                borderTopColor: colors.sep,
              },
            ]}>
            <View style={styles.toolbarScrollable}>
              <Toolbar
                editor={editor}
                items={DEFAULT_TOOLBAR_ITEMS}
                hidden={false}
              />
            </View>
            <TouchableOpacity
              onPress={() => {
                // Keyboard.dismiss() doesn't work here because the keyboard
                // is owned by TenTap's WebView, not a native TextInput.
                // editor.blur() sends a blur command to TipTap inside the
                // WebView, which releases focus and dismisses the keyboard.
                editor.blur();
              }}
              style={[
                styles.toolbarDismiss,
                { borderLeftColor: colors.sep },
              ]}
              testID="toolbar-dismiss-keyboard"
              accessibilityLabel="Hide keyboard"
              activeOpacity={0.6}>
              <FontAwesome
                name="chevron-down"
                size={14}
                color={colors.fgMuted}
              />
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>

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
        onAutoOpenChange={setAutoOpenGmail}
      />
    </View>
  );
}

const TOOLBAR_HEIGHT = 44;

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
  settingsBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
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
  // KAV positioned absolutely at the bottom — this is what lifts the bar
  // above the keyboard. pointerEvents="box-none" on the KAV lets taps
  // outside the toolbar fall through to whatever's underneath.
  toolbarKav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  // Horizontal row: [scrollable formatting buttons] [fixed dismiss button].
  // Explicit height so TenTap's FlatList (flex: 1 + height: 44) has a
  // defined parent — without it the FlatList collapses to zero height.
  toolbarWrap: {
    height: TOOLBAR_HEIGHT,
    borderTopWidth: 0.5,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  toolbarScrollable: {
    flex: 1,
    minWidth: 0,
  },
  toolbarDismiss: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 0.5,
  },

});
