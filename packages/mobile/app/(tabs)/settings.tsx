import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useColorScheme } from '@/components/useColorScheme';
import { getColors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import AccentPicker from '@/components/AccentPicker';

// ---------------------------------------------------------------------------
// Settings row
// ---------------------------------------------------------------------------
function SettingsRow({
  title,
  detail,
  showChevron = false,
  isLast = false,
  colorCircle,
  onPress,
  fg,
  fgMuted,
  fgFaint,
  sep,
}: {
  title: string;
  detail?: string;
  showChevron?: boolean;
  isLast?: boolean;
  colorCircle?: string;
  onPress?: () => void;
  fg: string;
  fgMuted: string;
  fgFaint: string;
  sep: string;
}) {
  return (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={onPress ? 0.5 : 1}
      onPress={onPress}
      disabled={!onPress}>
      <Text style={[styles.rowTitle, { color: fg }]}>{title}</Text>
      <View style={styles.rowRight}>
        {detail != null && (
          <Text style={[styles.rowDetail, { color: fgMuted }]}>{detail}</Text>
        )}
        {colorCircle != null && (
          <View
            style={[
              styles.colorCircle,
              { backgroundColor: colorCircle },
            ]}
          />
        )}
        {showChevron && (
          <FontAwesome name="chevron-right" size={13} color={fgFaint} />
        )}
      </View>
      {/* Bottom border (left-aligned at 16px, not full width) */}
      {!isLast && (
        <View style={[styles.rowBorder, { backgroundColor: sep }]} />
      )}
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// Settings screen
// ---------------------------------------------------------------------------
export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const dark = colorScheme === 'dark';
  const colors = getColors(dark);
  const { accent, setAccent } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: dark ? '#000' : '#f2f2f7' }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: dark
              ? 'rgba(0,0,0,0.85)'
              : 'rgba(242,242,247,0.85)',
          },
        ]}>
        <Text style={[styles.headerTitle, { color: colors.fg }]}>
          Settings
        </Text>
      </View>

      {/* Body */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* ---- Appearance ---- */}
        <Text style={[styles.sectionHeader, { color: colors.fgMuted }]}>
          APPEARANCE
        </Text>
        <AccentPicker selected={accent} onPick={setAccent} />

        {/* ---- Defaults ---- */}
        <Text style={[styles.sectionHeader, { color: colors.fgMuted }]}>
          DEFAULTS
        </Text>
        <View style={[styles.section, { backgroundColor: colors.cardBg }]}>
          <SettingsRow
            title="Default Font Size"
            detail="15px"
            showChevron
            fg={colors.fg}
            fgMuted={colors.fgMuted}
            fgFaint={colors.fgFaint}
            sep={colors.sep}
          />
          <SettingsRow
            title="Default Text Color"
            colorCircle={colors.fg}
            showChevron
            isLast
            fg={colors.fg}
            fgMuted={colors.fgMuted}
            fgFaint={colors.fgFaint}
            sep={colors.sep}
          />
        </View>

        {/* ---- About ---- */}
        <Text style={[styles.sectionHeader, { color: colors.fgMuted }]}>
          ABOUT
        </Text>
        <View style={[styles.section, { backgroundColor: colors.cardBg }]}>
          <SettingsRow
            title="Version"
            detail="1.0.0"
            fg={colors.fg}
            fgMuted={colors.fgMuted}
            fgFaint={colors.fgFaint}
            sep={colors.sep}
          />
          <SettingsRow
            title="How It Works"
            showChevron
            isLast
            onPress={() => {}}
            fg={colors.fg}
            fgMuted={colors.fgMuted}
            fgFaint={colors.fgFaint}
            sep={colors.sep}
          />
        </View>

        {/* ---- Support ---- */}
        <Text style={[styles.sectionHeader, { color: colors.fgMuted }]}>
          SUPPORT
        </Text>
        <View style={[styles.section, { backgroundColor: colors.cardBg }]}>
          <SettingsRow
            title="Send Feedback"
            showChevron
            onPress={() => {}}
            fg={colors.fg}
            fgMuted={colors.fgMuted}
            fgFaint={colors.fgFaint}
            sep={colors.sep}
          />
          <SettingsRow
            title="Rate PasteClean"
            showChevron
            onPress={() => {}}
            fg={colors.fg}
            fgMuted={colors.fgMuted}
            fgFaint={colors.fgFaint}
            sep={colors.sep}
          />
          <SettingsRow
            title="Privacy Policy"
            showChevron
            isLast
            onPress={() => {}}
            fg={colors.fg}
            fgMuted={colors.fgMuted}
            fgFaint={colors.fgFaint}
            sep={colors.sep}
          />
        </View>

        {/* Footer */}
        <Text style={[styles.footer, { color: colors.fgMuted }]}>
          PasteClean keeps your formatting intact when pasting into Gmail. We
          strip dark-mode and inline styles that Gmail would render as invisible
          white-on-white.
        </Text>
      </ScrollView>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingBottom: 6,
    paddingLeft: 20,
    paddingRight: 12,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: 0.36,
  },

  // Scroll body
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 12,
    paddingBottom: 100,
  },

  // Section
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    paddingHorizontal: 32,
    paddingBottom: 6,
    paddingTop: 20,
  },
  section: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },

  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
    paddingHorizontal: 16,
  },
  rowTitle: {
    fontSize: 17,
    letterSpacing: -0.4,
    flex: 1,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowDetail: {
    fontSize: 17,
    marginRight: 6,
  },
  colorCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    marginRight: 6,
  },
  rowBorder: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 0,
    height: 0.5,
  },

  // Footer
  footer: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 32,
    paddingTop: 8,
    paddingBottom: 24,
  },
});
