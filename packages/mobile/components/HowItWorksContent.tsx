/**
 * The "How PasteClean works" content body — 8 steps + INPUT/OUTPUT chips.
 *
 * Rendered in two contexts:
 *   1. `app/how-it-works.tsx` — the Stack screen with
 *      presentation: 'formSheet'. Reached from Settings via
 *      router.push('/how-it-works').
 *   2. OnboardingFlow's "peek" — wrapped in an RN <Modal> because
 *      onboarding renders BEFORE the Stack is mounted (see
 *      app/_layout.tsx#RootContent), so router.push isn't an option
 *      during onboarding.
 *
 * Keeping the markup in one place ensures the two contexts can't drift.
 */
import React from 'react';
import { StyleSheet, Text, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTokens } from '@/components/onboarding/tokens';

const ONB_ACCENT = '#007AFF';
const mono = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

const PIPELINE_STEPS = [
  {
    num: '01',
    label: 'Inlines all CSS',
    desc: 'Gmail ignores <style> blocks. We convert classes to inline style="".',
  },
  {
    num: '02',
    label: 'Strips dangerous tags',
    desc: '<script> <iframe> <form> — gone. Only safe HTML survives.',
  },
  {
    num: '03',
    label: 'Removes unsupported CSS',
    desc: 'position, transform, box-shadow, animation — stripped.',
  },
  {
    num: '04',
    label: 'Converts headings',
    desc: '<h1> → <p style="font-size:22px;font-weight:bold">.',
  },
  {
    num: '05',
    label: 'Fixes invisible text',
    desc: 'Light text on white? We darken it until WCAG contrast ≥ 3:1 — hue preserved.',
  },
  {
    num: '06',
    label: 'Strips dark backgrounds',
    desc: 'background:#1a1a1a removed; text re-tinted to read on white.',
  },
  {
    num: '07',
    label: 'Forces explicit colors',
    desc: "Adds color:#000 and background:#fff so Gmail's dark mode can't invert anything.",
  },
  {
    num: '08',
    label: 'Cleans up',
    desc: 'Empty spans, redundant wrappers, orphan attributes — stripped.',
  },
];

// No onClose prop — dismissal is owned by the host (iOS sheet drag for
// the formSheet route, swipe-down for the onboarding RN Modal). Both
// are native gestures; the previous in-content X button caused
// router.dismiss() race conditions and visual bleed-through, with no
// upside (Apple Mail / Reminders / Notes sheets don't have X buttons
// either).
export default function HowItWorksContent() {
  const { dark, t } = useTokens();
  const containerBg = dark ? '#1c1c1e' : '#f2f2f7';

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.container, { backgroundColor: containerBg }]}
      testID="how-it-works-screen">
      {/* Header is the FIRST item INSIDE the ScrollView, not a sibling
          above it. Two reasons:
            1. iOS form sheets have dynamic sizing that broke the
               flex:1 chain when the header was a sibling — the
               ScrollView's contentInset extended into the header's
               visual region and the INPUT chip rendered over the
               title.
            2. The inline header scrolls away with the content, the
               way Apple Mail's compose sheet handles its "To" /
               "Subject" fields. Less chrome, more content. */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        testID="how-it-works-scroll">
        <View style={styles.header}>
          <Text style={[styles.title, { color: t.ink }]}>
            How PasteClean works
          </Text>
          <Text style={[styles.subtitle, { color: t.inkMuted }]}>
            An 8-step pipeline runs on every copy
          </Text>
        </View>
        <View style={styles.inputChip}>
          <Text style={styles.inputLabel}>INPUT</Text>
          <Text style={styles.inputCode} numberOfLines={1}>
            {'<style>.x{color:#fff}</style>…'}
          </Text>
        </View>
        <View style={{ gap: 10 }}>
          {PIPELINE_STEPS.map((s) => (
            <View
              key={s.num}
              style={[
                styles.step,
                { backgroundColor: t.surface, borderColor: t.borderFaint },
              ]}>
              <View
                style={[
                  styles.numBadge,
                  { backgroundColor: ONB_ACCENT + (dark ? '28' : '14') },
                ]}>
                <Text style={styles.numBadgeText}>{s.num}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.stepLabel, { color: t.ink }]}>
                  {s.label}
                </Text>
                <Text style={[styles.stepDesc, { color: t.inkMuted }]}>
                  {s.desc}
                </Text>
              </View>
            </View>
          ))}
        </View>
        <View style={styles.outputChip}>
          <Text style={styles.outputLabel}>OUTPUT</Text>
          <Text style={styles.outputCode} numberOfLines={1}>
            {'<p style="color:#000">…</p>'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  // Inline header — first item inside the ScrollView. No padding above
  // it because scrollContent.paddingTop already pushes everything
  // below the iOS grabber zone.
  header: { paddingBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', letterSpacing: -0.4 },
  subtitle: { fontSize: 14, marginTop: 4 },
  // paddingTop:16 clears the iOS grabber's reserved zone (~20pt) and
  // gives the title room to breathe. paddingHorizontal applies to the
  // header AND every step card (consistent gutter).
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 40,
  },
  inputChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1c1c1e',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  inputLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontFamily: mono,
    fontWeight: '600',
  },
  inputCode: { color: '#ff8a80', fontSize: 12, fontFamily: mono, flex: 1 },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: 14,
    padding: 14,
    borderWidth: 0.5,
  },
  numBadge: {
    width: 28,
    height: 28,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: ONB_ACCENT,
    fontFamily: mono,
  },
  stepLabel: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.1,
    marginBottom: 3,
  },
  stepDesc: { fontSize: 14, lineHeight: 19 },
  outputChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
  },
  outputLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontFamily: mono,
    fontWeight: '600',
  },
  outputCode: { color: '#86efac', fontSize: 12, fontFamily: mono, flex: 1 },
});
