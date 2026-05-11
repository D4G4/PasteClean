import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { WebView } from 'react-native-webview';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { sanitizeForGmailWithReport } from '@pasteclean/gmail-sanitizer';
import type { SanitizeReportItem } from '@pasteclean/gmail-sanitizer';

const CATEGORY_ICONS: Record<SanitizeReportItem['category'], { icon: React.ComponentProps<typeof FontAwesome>['name']; color: string }> = {
  'dark-mode': { icon: 'sun-o', color: '#F59E0B' },
  'unsafe-element': { icon: 'shield', color: '#EF4444' },
  'unsafe-css': { icon: 'code', color: '#8B5CF6' },
  'unsafe-attribute': { icon: 'tag', color: '#EC4899' },
  'heading-convert': { icon: 'header', color: '#3B82F6' },
  'color-added': { icon: 'paint-brush', color: '#10B981' },
  'background-stripped': { icon: 'eraser', color: '#F97316' },
};

export default function PreviewScreen() {
  const { html } = useLocalSearchParams<{ html: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [showOriginal, setShowOriginal] = useState(false);
  const [copied, setCopied] = useState(false);

  const { sanitized, report, sizeWarning } = useMemo(() => {
    if (!html) return {
      sanitized: '',
      report: { totalFixes: 0, items: [], status: 'clean' as const },
      sizeWarning: { sizeBytes: 0, sizeKB: 0, willBeClipped: false, warning: null },
    };
    const result = sanitizeForGmailWithReport(html);
    return { sanitized: result.html, report: result.report, sizeWarning: result.sizeWarning };
  }, [html]);

  const displayHtml = showOriginal ? (html || '') : sanitized;

  const wrappedHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: Arial, Helvetica, sans-serif;
          font-size: 14px;
          line-height: 1.6;
          color: #000000;
          background-color: #ffffff;
          padding: 16px;
          margin: 0;
        }
        img { max-width: 100%; height: auto; }
      </style>
    </head>
    <body>${displayHtml}</body>
    </html>
  `;

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(sanitized);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      Alert.alert('Copy failed', 'Something went wrong.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Toggle bar */}
      <View style={[styles.toggleBar, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            !showOriginal && { backgroundColor: colors.tint },
          ]}
          onPress={() => setShowOriginal(false)}>
          <Text
            style={[
              styles.toggleText,
              { color: !showOriginal ? '#fff' : colors.textSecondary },
            ]}>
            Gmail Safe
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            showOriginal && { backgroundColor: colors.warning },
          ]}
          onPress={() => setShowOriginal(true)}>
          <Text
            style={[
              styles.toggleText,
              { color: showOriginal ? '#fff' : colors.textSecondary },
            ]}>
            Original
          </Text>
        </TouchableOpacity>
      </View>

      {/* WebView preview */}
      <View style={styles.webViewContainer}>
        <WebView
          source={{ html: wrappedHtml }}
          style={styles.webView}
          scrollEnabled={true}
          originWhitelist={['*']}
        />
      </View>

      {/* Cleanup report */}
      {report.totalFixes > 0 && !showOriginal && (
        <View style={[styles.reportContainer, { borderTopColor: colors.border }]}>
          <View style={styles.reportHeader}>
            <FontAwesome name="wrench" size={14} color={colors.textSecondary} />
            <Text style={[styles.reportTitle, { color: colors.text }]}>
              {report.totalFixes} fix{report.totalFixes !== 1 ? 'es' : ''} applied
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.reportChips}>
            {report.items.map((item, i) => {
              const meta = CATEGORY_ICONS[item.category];
              return (
                <View key={i} style={[styles.chip, { backgroundColor: colors.surface }]}>
                  <FontAwesome name={meta.icon} size={11} color={meta.color} />
                  <Text style={[styles.chipText, { color: colors.text }]} numberOfLines={1}>
                    {item.description}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Clean badge when nothing needed fixing */}
      {report.totalFixes === 0 && !showOriginal && (
        <View style={[styles.cleanBadge, { backgroundColor: '#D1FAE5' }]}>
          <FontAwesome name="check-circle" size={14} color="#065F46" />
          <Text style={styles.cleanBadgeText}>Already Gmail-safe — no fixes needed</Text>
        </View>
      )}

      {/* Original mode warning */}
      {showOriginal && (
        <View style={[styles.cleanBadge, { backgroundColor: '#FEF3C7' }]}>
          <FontAwesome name="warning" size={14} color="#92400E" />
          <Text style={[styles.cleanBadgeText, { color: '#92400E' }]}>
            Original — may have dark mode issues
          </Text>
        </View>
      )}

      {/* Size warning */}
      {sizeWarning.warning && !showOriginal && (
        <View style={[styles.cleanBadge, { backgroundColor: sizeWarning.willBeClipped ? '#FEE2E2' : '#FEF3C7' }]}>
          <FontAwesome
            name={sizeWarning.willBeClipped ? 'exclamation-circle' : 'warning'}
            size={14}
            color={sizeWarning.willBeClipped ? '#991B1B' : '#92400E'}
          />
          <Text style={[styles.cleanBadgeText, { color: sizeWarning.willBeClipped ? '#991B1B' : '#92400E' }]}>
            {sizeWarning.warning}
          </Text>
        </View>
      )}

      {/* Copy button */}
      <View style={[styles.bottomBar, { borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.copyButton,
            { backgroundColor: copied ? colors.success : colors.tint },
          ]}
          onPress={handleCopy}
          activeOpacity={0.8}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toggleBar: {
    flexDirection: 'row',
    margin: 12,
    borderRadius: 10,
    padding: 4,
    gap: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  webViewContainer: {
    flex: 1,
    marginHorizontal: 12,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  webView: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  reportContainer: {
    paddingTop: 10,
    paddingBottom: 4,
    borderTopWidth: 1,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  reportTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  reportChips: {
    paddingHorizontal: 12,
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
  cleanBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 12,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cleanBadgeText: {
    color: '#065F46',
    fontSize: 13,
    fontWeight: '500',
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
  },
  copyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
