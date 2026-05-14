import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface FlowScreenProps {
  accent: string;
  onPeek?: () => void;
}

const STEPS = [
  { icon: 'pencil' as const, badge: '1', label: 'Write & style' },
  { icon: 'clipboard' as const, badge: '2', label: 'Tap Copy' },
  { icon: 'paper-plane' as const, badge: '3', label: 'Paste & send' },
];

// Three equal vertical thirds: Text, Art, "How do I work?". Each section
// uses flex: 1 so the screen is divided evenly regardless of device height.
export default function FlowScreen({ accent, onPeek }: FlowScreenProps) {
  return (
    <View style={styles.page}>
      {/* Text — top third */}
      <View style={styles.textArea}>
        <Text style={styles.title}>Write. Copy. Paste.</Text>
        <Text style={styles.subtitle}>
          Three taps from idea to inbox. PasteClean handles the messy part so
          you can focus on the words.
        </Text>
      </View>

      {/* Art — middle third */}
      <View style={styles.artArea}>
        <View style={styles.stepsRow}>
          {STEPS.map((step, index) => (
            <React.Fragment key={step.badge}>
              <View style={styles.stepItem}>
                <View style={styles.iconContainer}>
                  <View
                    style={[
                      styles.iconRect,
                      { backgroundColor: accent + '14' },
                    ]}>
                    <FontAwesome
                      name={step.icon}
                      size={28}
                      color={accent}
                    />
                  </View>
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: accent, shadowColor: accent },
                    ]}>
                    <Text style={styles.badgeText}>{step.badge}</Text>
                  </View>
                </View>
                <Text style={styles.stepLabel}>{step.label}</Text>
              </View>

              {index < STEPS.length - 1 && (
                <View style={styles.arrowContainer}>
                  <FontAwesome
                    name="long-arrow-right"
                    size={18}
                    color={accent}
                  />
                </View>
              )}
            </React.Fragment>
          ))}
        </View>
      </View>

      {/* "How do I work?" trigger — bottom third */}
      <View style={styles.howArea}>
        {onPeek && (
          <TouchableOpacity
            style={styles.howTrigger}
            activeOpacity={0.7}
            onPress={onPeek}
            testID="onboarding-flow-how-trigger">
            <View style={styles.howTriggerLeft}>
              <View
                style={[styles.howTriggerIcon, { backgroundColor: accent }]}>
                <Text style={styles.howTriggerIconText}>?</Text>
              </View>
              <View>
                <Text style={styles.howTriggerTitle}>How do I work?</Text>
                <Text style={styles.howTriggerSub}>
                  Peek under the hood — 8 steps
                </Text>
              </View>
            </View>
            <FontAwesome
              name="chevron-right"
              size={12}
              color="rgba(60,60,67,0.4)"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#fff',
    // space-between with 3 content-sized children pins text to the top,
    // how-trigger to the bottom, and centers the icon row halfway between.
    justifyContent: 'space-between',
  },

  // Symmetric top/bottom breathing room: same on the text block (above the
  // page) and on the how-trigger block (below the page).
  textArea: {
    paddingHorizontal: 28,
    paddingVertical: 50,
  },
  artArea: {
    alignItems: 'center',
  },
  howArea: {
    paddingHorizontal: 24,
    paddingVertical: 50,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.6,
    color: '#1c1c1e',
    lineHeight: 32,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(60,60,67,0.72)',
    lineHeight: 21,
    letterSpacing: -0.2,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 18,
  },
  stepItem: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  iconContainer: {
    position: 'relative',
  },
  iconRect: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.32,
    shadowRadius: 10,
    elevation: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1c1c1e',
    textAlign: 'center',
    letterSpacing: -0.1,
    maxWidth: 96,
    lineHeight: 16,
  },
  arrowContainer: {
    paddingTop: 24,
    paddingHorizontal: 2,
  },

  howTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(60,60,67,0.06)',
    borderRadius: 12,
  },
  howTriggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  howTriggerIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  howTriggerIconText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  howTriggerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1c1c1e',
    letterSpacing: -0.2,
  },
  howTriggerSub: {
    fontSize: 11.5,
    color: 'rgba(60,60,67,0.6)',
  },
});
