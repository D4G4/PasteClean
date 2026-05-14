import React from 'react';
import { StyleSheet, View, Text, Dimensions, ScrollView } from 'react-native';
import AccentPicker from '@/components/AccentPicker';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ThemeScreenProps {
  accent: string;
  setAccent: (color: string) => void;
}

// Design handoff: Title 28px, subtitle 14px, padding 8px 28px.
// AccentPicker rows are in a scrollable area below.

export default function ThemeScreen({ accent, setAccent }: ThemeScreenProps) {
  return (
    <View style={styles.page}>
      {/* Text */}
      <View style={styles.textArea}>
        <Text style={styles.title}>Pick a vibe.</Text>
        <Text style={styles.subtitle}>
          Choose an accent for your header and buttons. You can change it
          anytime in Settings.
        </Text>
      </View>

      {/* Accent picker — scrollable */}
      <ScrollView
        style={styles.pickerScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.pickerContent}>
        <AccentPicker selected={accent} onPick={setAccent} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#fff',
  },
  textArea: {
    paddingHorizontal: 28,
    paddingTop: 8,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.6,
    color: '#1c1c1e',
    lineHeight: 32,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(60,60,67,0.72)',
    lineHeight: 20,
    letterSpacing: -0.15,
  },
  pickerScroll: {
    flex: 1,
  },
  pickerContent: {
    paddingTop: 14,
    paddingBottom: 6,
  },
});
