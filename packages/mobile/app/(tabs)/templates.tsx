import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

export default function TemplatesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.emptyState}>
        <FontAwesome name="bookmark-o" size={48} color={colors.tabIconDefault} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          No templates yet
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
          Save your frequently used email formats as templates for quick access.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
