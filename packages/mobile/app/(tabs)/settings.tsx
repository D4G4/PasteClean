import React from 'react';
import { StyleSheet, View, Text, ScrollView, Linking, TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

function SettingsRow({
  icon,
  label,
  value,
  onPress,
  colors,
}: {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  label: string;
  value?: string;
  onPress?: () => void;
  colors: (typeof Colors)['light'];
}) {
  return (
    <TouchableOpacity
      style={[styles.row, { borderBottomColor: colors.border }]}
      onPress={onPress}
      disabled={!onPress}>
      <View style={styles.rowLeft}>
        <FontAwesome name={icon} size={18} color={colors.tint} style={styles.rowIcon} />
        <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
      </View>
      {value && (
        <Text style={[styles.rowValue, { color: colors.textSecondary }]}>{value}</Text>
      )}
      {onPress && (
        <FontAwesome name="chevron-right" size={14} color={colors.tabIconDefault} />
      )}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>GENERAL</Text>
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <SettingsRow icon="font" label="Default Font Size" value="14px" colors={colors} />
        <SettingsRow icon="paint-brush" label="Default Text Color" value="Black" colors={colors} />
      </View>

      <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>ABOUT</Text>
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <SettingsRow icon="info-circle" label="Version" value="0.1.0" colors={colors} />
        <SettingsRow
          icon="question-circle"
          label="How It Works"
          colors={colors}
          onPress={() => {}}
        />
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          PasteClean ensures your emails look exactly as intended in Gmail, regardless of dark mode.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
  section: {
    marginHorizontal: 12,
    borderRadius: 10,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rowIcon: {
    width: 28,
  },
  rowLabel: {
    fontSize: 16,
  },
  rowValue: {
    fontSize: 15,
    marginRight: 8,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
