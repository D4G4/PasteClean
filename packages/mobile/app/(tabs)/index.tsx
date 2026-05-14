import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
  StatusBar,
  Linking,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useColorScheme } from '@/components/useColorScheme';
import { getColors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { GmailHandoffToast } from '@/components/GmailHandoffToast';
import { sanitizeForGmail } from '@pasteclean/gmail-sanitizer';
import {
  RichText,
  Toolbar,
  useEditorBridge,
  DEFAULT_TOOLBAR_ITEMS,
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
  const { accent } = useTheme();
  const router = useRouter();

  const [copied, setCopied] = useState(false);
  const [toValue] = useState('');
  const [subjectValue, setSubjectValue] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [autoOpenGmail, setAutoOpenGmail] = useState(false);
  const pathname = usePathname();

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

  const editor = useEditorBridge({
    autofocus: false,
    avoidIosKeyboard: true,
    initialContent: '',
  });

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
      <View style={[styles.header, { backgroundColor: accent }]}>
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
                { color: copied ? '#fff' : accent },
              ]}>
              {copied ? 'Copied!' : 'Copy'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ================================================================ */}
      {/* 2. Compose fields (To / Subject)                                 */}
      {/* ================================================================ */}
      <View style={[styles.composeFields, { backgroundColor: colors.bg }]}>
        {/* To row */}
        <View
          style={[
            styles.composeRow,
            { borderBottomColor: colors.sep, borderBottomWidth: 0.5 },
          ]}>
          <Text style={[styles.fieldLabel, { color: colors.fieldLabel }]}>
            To
          </Text>
          <View style={styles.fieldContent}>
            {toValue ? (
              <View style={[styles.recipientPill, { backgroundColor: accent }]}>
                <View style={styles.recipientAvatar}>
                  <Text style={styles.recipientInitial}>
                    {toValue.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.recipientName}>{toValue}</Text>
              </View>
            ) : null}
            <TextInput
              style={[styles.fieldInput, { color: colors.fg }]}
              placeholder=""
              placeholderTextColor={colors.fgFaint}
            />
          </View>
        </View>

        {/* Subject row */}
        <View
          style={[
            styles.composeRow,
            { borderBottomColor: colors.sep, borderBottomWidth: 0.5 },
          ]}>
          <Text style={[styles.fieldLabel, { color: colors.fieldLabel }]}>
            Subject
          </Text>
          <TextInput
            style={[styles.subjectInput, { color: colors.fg }]}
            placeholder="Subject"
            placeholderTextColor={colors.fgFaint}
            value={subjectValue}
            onChangeText={setSubjectValue}
          />
        </View>
      </View>

      {/* ================================================================ */}
      {/* 3. Rich text editor body                                         */}
      {/* ================================================================ */}
      <RichText editor={editor} style={styles.richText} />

      {/* ================================================================ */}
      {/* 4. Formatting toolbar                                            */}
      {/* ================================================================ */}
      <View
        style={[
          styles.toolbarWrap,
          {
            backgroundColor: colors.toolBg,
            borderTopColor: colors.sep,
          },
        ]}>
        <Toolbar editor={editor} items={DEFAULT_TOOLBAR_ITEMS} />
      </View>

      {/* ================================================================ */}
      {/* 5. Floating mini nav (tab bar is hidden on this screen)          */}
      {/* ================================================================ */}
      <View
        style={[
          styles.floatingNav,
          {
            backgroundColor: isDark
              ? 'rgba(44,44,46,0.85)'
              : 'rgba(255,255,255,0.85)',
          },
        ]}>
        {([
          { icon: 'pencil' as const, route: '/' },
          { icon: 'bookmark' as const, route: '/templates' },
          { icon: 'cog' as const, route: '/settings' },
        ]).map(({ icon, route }) => {
          const isActive = pathname === route || (route === '/' && pathname === '/index');
          return (
            <TouchableOpacity
              key={icon}
              style={[
                styles.floatingNavBtn,
                isActive && {
                  backgroundColor: isDark
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(0,0,0,0.04)',
                },
              ]}
              onPress={() => {
                if (!isActive) router.navigate(route as any);
              }}
              activeOpacity={0.6}>
              <FontAwesome
                name={icon}
                size={16}
                color={
                  isActive
                    ? accent
                    : isDark
                      ? 'rgba(235,235,245,0.5)'
                      : 'rgba(60,60,67,0.55)'
                }
              />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ================================================================ */}
      {/* 6. Gmail handoff toast                                           */}
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
const HEADER_PADDING_TOP = 56; // status bar clearance

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  // --- Header ---
  header: {
    paddingTop: HEADER_PADDING_TOP,
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
  fieldContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fieldInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 10,
  },
  subjectInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 10,
  },

  // --- Recipient pill ---
  recipientPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingRight: 10,
    paddingLeft: 3,
    paddingVertical: 3,
    gap: 5,
  },
  recipientAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipientInitial: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  recipientName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#fff',
  },

  // --- Editor body ---
  richText: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // --- Toolbar wrapper ---
  toolbarWrap: {
    borderTopWidth: 0.5,
  },

  // --- Floating mini nav ---
  floatingNav: {
    position: 'absolute',
    left: 12,
    bottom: 6,
    flexDirection: 'row',
    gap: 4,
    padding: 4,
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 6,
  },
  floatingNavBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
