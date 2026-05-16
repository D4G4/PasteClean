import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useColorScheme } from '@/components/useColorScheme';
import { getColors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import AccentPicker from '@/components/AccentPicker';
import PipelineSheet from '@/components/onboarding/PipelineSheet';

// ---------------------------------------------------------------------------
// Settings row
// ---------------------------------------------------------------------------
function SettingsRow({
  title,
  detail,
  showChevron = false,
  isLast = false,
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
        {showChevron && (
          <FontAwesome name="chevron-right" size={13} color={fgFaint} />
        )}
      </View>
      {!isLast && (
        <View style={[styles.rowBorder, { backgroundColor: sep }]} />
      )}
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// Settings screen — native header provided by the root Stack
// ---------------------------------------------------------------------------
export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const dark = colorScheme === 'dark';
  const colors = getColors(dark);
  const { accent, setAccent } = useTheme();
  const [pipelineOpen, setPipelineOpen] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: dark ? '#000' : '#f2f2f7' }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}>
        {/* ---- Appearance ---- */}
        <Text style={[styles.sectionHeader, { color: colors.fgMuted }]}>
          APPEARANCE
        </Text>
        <AccentPicker selected={accent} onPick={setAccent} />

        {/* ---- About ---- */}
        <Text style={[styles.sectionHeader, { color: colors.fgMuted }]}>
          ABOUT
        </Text>
        <View style={[styles.section, { backgroundColor: colors.cardBg }]}>
          <SettingsRow
            title="How It Works"
            showChevron
            onPress={() => setPipelineOpen(true)}
            fg={colors.fg}
            fgMuted={colors.fgMuted}
            fgFaint={colors.fgFaint}
            sep={colors.sep}
          />
          <SettingsRow
            title="Send Feedback"
            showChevron
            onPress={() => Linking.openURL('https://github.com/D4G4/PasteClean/issues/new?template=feedback.md&labels=feedback')}
            fg={colors.fg}
            fgMuted={colors.fgMuted}
            fgFaint={colors.fgFaint}
            sep={colors.sep}
          />
          <SettingsRow
            title="Version"
            detail="1.0.0"
            isLast
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

      <PipelineSheet open={pipelineOpen} onClose={() => setPipelineOpen(false)} />
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
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
  rowBorder: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 0,
    height: 0.5,
  },
  footer: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 32,
    paddingTop: 8,
    paddingBottom: 24,
  },
});
