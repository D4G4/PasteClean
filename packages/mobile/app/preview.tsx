import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  Alert,
  ScrollView,
  Animated,
  Dimensions,
  Linking,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useColorScheme } from '@/components/useColorScheme';
import { getColors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { GmailHandoffToast } from '@/components/GmailHandoffToast';
import { sanitizeForGmailWithReport } from '@pasteclean/gmail-sanitizer';
import type { SanitizeReportItem } from '@pasteclean/gmail-sanitizer';

// ────────────────────────────────────────
// Constants
// ────────────────────────────────────────

const SCREEN_HEIGHT = Dimensions.get('window').height;
const STORAGE_KEY_AUTO_OPEN = '@pasteclean/auto_open_gmail';

const CATEGORY_ICONS: Record<
  SanitizeReportItem['category'],
  { icon: React.ComponentProps<typeof FontAwesome>['name']; color: string }
> = {
  'dark-mode': { icon: 'sun-o', color: '#F59E0B' },
  'unsafe-element': { icon: 'shield', color: '#EF4444' },
  'unsafe-css': { icon: 'code', color: '#8B5CF6' },
  'unsafe-attribute': { icon: 'tag', color: '#EC4899' },
  'heading-convert': { icon: 'header', color: '#3B82F6' },
  'color-added': { icon: 'paint-brush', color: '#10B981' },
  'background-stripped': { icon: 'eraser', color: '#F97316' },
};

// ────────────────────────────────────────
// Preview Screen
// ────────────────────────────────────────

export default function PreviewScreen() {
  const { html } = useLocalSearchParams<{ html: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const dark = colorScheme === 'dark';
  const c = getColors(dark);
  const { accent } = useTheme();

  const [showOriginal, setShowOriginal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [autoOpenGmail, setAutoOpenGmail] = useState(false);

  // Sheet slide-up animation
  const sheetAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    Animated.spring(sheetAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  }, [sheetAnim]);

  // Load auto-open preference
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY_AUTO_OPEN).then((val) => {
      if (val === 'true') setAutoOpenGmail(true);
    });
  }, []);

  const handleAutoOpenChange = useCallback((value: boolean) => {
    setAutoOpenGmail(value);
    AsyncStorage.setItem(STORAGE_KEY_AUTO_OPEN, value ? 'true' : 'false');
  }, []);

  // Sanitization
  const { sanitized, report, sizeWarning } = useMemo(() => {
    if (!html)
      return {
        sanitized: '',
        report: { totalFixes: 0, items: [], status: 'clean' as const },
        sizeWarning: {
          sizeBytes: 0,
          sizeKB: 0,
          willBeClipped: false,
          warning: null,
        },
      };
    const result = sanitizeForGmailWithReport(html);
    return {
      sanitized: result.html,
      report: result.report,
      sizeWarning: result.sizeWarning,
    };
  }, [html]);

  const displayHtml = showOriginal ? html || '' : sanitized;

  // Build the cleanup note that appears inside the WebView when fixes were applied
  const cleanupNote =
    !showOriginal && report.totalFixes > 0
      ? `<div style="font-family:Arial,sans-serif;font-size:12px;color:#6e6e73;padding:8px 0 4px;border-top:1px solid rgba(60,60,67,0.12);margin-top:12px;">
           Cleanup: ${report.totalFixes} fix${report.totalFixes !== 1 ? 'es' : ''} applied by PasteClean
         </div>`
      : '';

  const wrappedHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { box-sizing: border-box; }
        body {
          font-family: Arial, Helvetica, sans-serif;
          font-size: 14px;
          line-height: 1.5;
          color: #202124;
          background-color: #ffffff;
          margin: 0;
          padding: 0;
        }
        img { max-width: 100%; height: auto; }
      </style>
    </head>
    <body>
      <!-- Faux Gmail address strip -->
      <div style="padding:12px 16px 8px;font-family:Arial,sans-serif;font-size:12px;color:#5f6368;border-bottom:1px solid rgba(60,60,67,0.12);">
        <div style="margin-bottom:3px;"><span style="font-weight:600;">Subject:</span> Your email preview</div>
        <div><span style="font-weight:600;">To:</span> recipient@gmail.com</div>
      </div>
      <!-- Body -->
      <div style="padding:14px 16px;">
        ${displayHtml}
        ${cleanupNote}
      </div>
    </body>
    </html>
  `;

  const sheetBg = dark ? '#1c1c1e' : '#f2f2f7';
  const grabberColor = dark ? '#48484a' : '#d1d1d6';
  const toggleContainerBg = dark ? '#2c2c2e' : '#e5e5ea';

  // ── Handlers ──

  const handleClose = useCallback(() => {
    Animated.timing(sheetAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      router.back();
    });
  }, [sheetAnim, router]);

  const openGmail = useCallback(() => {
    setToastVisible(false);
    Linking.openURL('googlegmail://').catch(() => {
      // Gmail not installed, try web
      Linking.openURL('https://mail.google.com/mail/u/0/#drafts');
    });
  }, []);

  const handleCopy = useCallback(async () => {
    try {
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
    } catch {
      Alert.alert('Copy failed', 'Something went wrong.');
    }
  }, [sanitized, autoOpenGmail, openGmail]);

  const dismissToast = useCallback(() => {
    setToastVisible(false);
  }, []);

  // ── Render ──

  return (
    <View style={styles.overlay}>
      {/* Backdrop — tap to dismiss */}
      <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          { backgroundColor: sheetBg, transform: [{ translateY: sheetAnim }] },
        ]}
      >
        {/* Grabber + close button */}
        <View style={styles.grabberRow}>
          <View style={styles.grabberSpacer} />
          <View style={[styles.grabber, { backgroundColor: grabberColor }]} />
          <View style={styles.grabberRight}>
            <TouchableOpacity
              onPress={handleClose}
              style={[
                styles.closeButton,
                { backgroundColor: dark ? '#3a3a3c' : '#e5e5ea' },
              ]}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <FontAwesome
                name="times"
                size={14}
                color={dark ? '#ebebf5' : '#3c3c43'}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: c.fg }]}>Preview</Text>

        {/* Mode toggle */}
        <View
          style={[
            styles.toggleContainer,
            { backgroundColor: toggleContainerBg },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.toggleButton,
              !showOriginal && { backgroundColor: accent },
            ]}
            onPress={() => setShowOriginal(false)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.toggleText,
                { color: !showOriginal ? '#FFFFFF' : c.fgMuted },
              ]}
            >
              Gmail Safe
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              showOriginal && { backgroundColor: '#FFCC00' },
            ]}
            onPress={() => setShowOriginal(true)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.toggleText,
                { color: showOriginal ? '#1c1c1e' : c.fgMuted },
              ]}
            >
              Original
            </Text>
          </TouchableOpacity>
        </View>

        {/* Status badge */}
        {!showOriginal ? (
          <View style={[styles.statusBadge, { backgroundColor: c.successBg }]}>
            <View style={styles.statusCircleGreen}>
              <FontAwesome name="check" size={10} color="#FFFFFF" />
            </View>
            <Text style={[styles.statusText, { color: c.successText }]}>
              Sanitized — safe for Gmail
            </Text>
          </View>
        ) : (
          <View style={[styles.statusBadge, { backgroundColor: c.warningBg }]}>
            <View style={styles.statusCircleYellow}>
              <Text style={styles.statusCircleYellowText}>!</Text>
            </View>
            <Text style={[styles.statusText, { color: c.warningText }]}>
              Original — may have dark mode issues
            </Text>
          </View>
        )}

        {/* WebView preview (Gmail-style) */}
        <View style={styles.webViewOuter}>
          <WebView
            source={{ html: wrappedHtml }}
            style={styles.webView}
            scrollEnabled={true}
            originWhitelist={['*']}
          />
        </View>

        {/* Cleanup report chips */}
        {report.totalFixes > 0 && !showOriginal && (
          <View style={styles.reportSection}>
            <View style={styles.reportHeader}>
              <FontAwesome name="wrench" size={13} color={c.fgMuted} />
              <Text style={[styles.reportLabel, { color: c.fg }]}>
                {report.totalFixes} fix{report.totalFixes !== 1 ? 'es' : ''}{' '}
                applied
              </Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.reportChips}
            >
              {report.items.map((item, i) => {
                const meta = CATEGORY_ICONS[item.category];
                return (
                  <View
                    key={i}
                    style={[
                      styles.chip,
                      { backgroundColor: dark ? '#2c2c2e' : '#e5e5ea' },
                    ]}
                  >
                    <FontAwesome name={meta.icon} size={11} color={meta.color} />
                    <Text
                      style={[styles.chipText, { color: c.fg }]}
                      numberOfLines={1}
                    >
                      {item.description}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Size warning */}
        {sizeWarning.warning && !showOriginal && (
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: sizeWarning.willBeClipped
                  ? 'rgba(255,59,48,0.12)'
                  : c.warningBg,
                marginTop: 6,
              },
            ]}
          >
            <FontAwesome
              name={
                sizeWarning.willBeClipped ? 'exclamation-circle' : 'warning'
              }
              size={14}
              color={sizeWarning.willBeClipped ? c.danger : c.warningText}
            />
            <Text
              style={[
                styles.statusText,
                {
                  color: sizeWarning.willBeClipped ? c.danger : c.warningText,
                },
              ]}
            >
              {sizeWarning.warning}
            </Text>
          </View>
        )}

        {/* Copy for Gmail button */}
        <View style={styles.copyArea}>
          <TouchableOpacity
            style={[
              styles.copyButton,
              { backgroundColor: copied ? '#34c759' : accent },
            ]}
            onPress={handleCopy}
            activeOpacity={0.8}
          >
            <FontAwesome
              name={copied ? 'check' : 'clipboard'}
              size={18}
              color="#FFFFFF"
            />
            <Text style={styles.copyButtonText}>
              {copied ? 'Copied!' : 'Copy for Gmail'}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Gmail Handoff Toast */}
      <GmailHandoffToast
        visible={toastVisible}
        dark={dark}
        accent={accent}
        onDismiss={dismissToast}
        onOpenGmail={openGmail}
        autoOpen={autoOpenGmail}
        onAutoOpenChange={handleAutoOpenChange}
      />
    </View>
  );
}

// ────────────────────────────────────────
// Styles
// ────────────────────────────────────────

const styles = StyleSheet.create({
  // Overlay
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },

  // Sheet
  sheet: {
    flex: 1,
    marginTop: 64,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    overflow: 'hidden',
  },

  // Grabber row
  grabberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    paddingHorizontal: 12,
  },
  grabberSpacer: {
    width: 28,
  },
  grabber: {
    flex: 1,
    alignSelf: 'center',
    width: 36,
    maxWidth: 36,
    height: 5,
    borderRadius: 2.5,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  grabberRight: {
    width: 28,
    alignItems: 'flex-end',
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Title
  title: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.4,
    paddingTop: 4,
    paddingHorizontal: 20,
    paddingBottom: 14,
  },

  // Mode toggle
  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    borderRadius: 9,
    padding: 3,
  },
  toggleButton: {
    flex: 1,
    height: 34,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Status badge
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  statusCircleGreen: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#34c759',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusCircleYellow: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFCC00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusCircleYellowText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1c1c1e',
    marginTop: -1,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: -0.1,
  },

  // WebView
  webViewOuter: {
    flex: 1,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    borderWidth: 0.5,
    borderColor: 'rgba(60,60,67,0.15)',
  },
  webView: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  // Report chips
  reportSection: {
    paddingTop: 10,
    paddingBottom: 2,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  reportLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  reportChips: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  chipText: {
    fontSize: 12,
    maxWidth: 250,
  },

  // Copy button
  copyArea: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 28,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: 14,
  },
  copyButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },

});
