import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Modal,
  ScrollView,
  Animated,
  Dimensions,
  Easing,
  PanResponder,
  Platform,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTokens } from './tokens';

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

interface PipelineSheetProps {
  open: boolean;
  onClose: () => void;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_HEIGHT = Math.round(SCREEN_HEIGHT * 0.88);

// Modal uses animationType="none" so we can drive the backdrop fade and the
// sheet slide independently: the dim tint fades in over the whole screen,
// while the sheet slides up from the bottom. With Modal's built-in "slide"
// the backdrop slides up with the sheet, which looks wrong (the tint only
// appears where the sheet has reached).
export default function PipelineSheet({ open, onClose }: PipelineSheetProps) {
  const { dark, t } = useTokens();
  const [mounted, setMounted] = useState(open);
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  useEffect(() => {
    if (open) {
      setMounted(true);
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 280,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 180,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: SHEET_HEIGHT,
          duration: 220,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
  }, [open, backdropAnim, slideAnim]);

  // Drag-to-dismiss on the grabber + header area. We only claim the gesture
  // on downward movement past a small slop so vertical scroll inside the
  // sheet body still works — the responder is only attached to the top
  // strip, but the slop guard is a defensive belt-and-braces.
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_e, g) => g.dy > 4 && g.dy > Math.abs(g.dx),
        onPanResponderMove: (_e, g) => {
          if (g.dy > 0) {
            slideAnim.setValue(g.dy);
            // Fade the backdrop proportionally so the dismiss feels
            // physical — release halfway and the backdrop is already
            // half-faded.
            backdropAnim.setValue(
              Math.max(0, 1 - g.dy / SHEET_HEIGHT),
            );
          }
        },
        onPanResponderRelease: (_e, g) => {
          const shouldDismiss = g.dy > SHEET_HEIGHT * 0.25 || g.vy > 0.6;
          if (shouldDismiss) {
            onClose();
          } else {
            // Snap back to fully open.
            Animated.parallel([
              Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 80,
                friction: 12,
              }),
              Animated.spring(backdropAnim, {
                toValue: 1,
                useNativeDriver: true,
                tension: 80,
                friction: 12,
              }),
            ]).start();
          }
        },
        onPanResponderTerminate: () => {
          // Another responder (e.g. ScrollView) won the gesture — snap back.
          Animated.parallel([
            Animated.spring(slideAnim, {
              toValue: 0,
              useNativeDriver: true,
            }),
            Animated.spring(backdropAnim, {
              toValue: 1,
              useNativeDriver: true,
            }),
          ]).start();
        },
      }),
    [slideAnim, backdropAnim, onClose],
  );

  return (
    <Modal
      visible={mounted}
      animationType="none"
      transparent
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View
          style={[styles.backdrop, { opacity: backdropAnim }]}
          pointerEvents={open ? 'auto' : 'none'}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            {
              transform: [{ translateY: slideAnim }],
              backgroundColor: dark ? '#1c1c1e' : '#f2f2f7',
            },
          ]}>
          {/* Drag-to-dismiss strip: grabber + header. The strip claims
              vertical pans, so a downward swipe anywhere on this top
              area closes the sheet. The ScrollView below keeps its own
              scroll gesture independent. */}
          <View {...panResponder.panHandlers}>
            <View style={styles.grabberRow}>
              <View
                style={[
                  styles.grabber,
                  {
                    backgroundColor: dark
                      ? 'rgba(235,235,245,0.25)'
                      : 'rgba(60,60,67,0.25)',
                  },
                ]}
              />
            </View>
            <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: t.ink }]}>
                How PasteClean works
              </Text>
              <Text style={[styles.subtitle, { color: t.inkMuted }]}>
                An 8-step pipeline runs on every copy
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.closeBtn,
                {
                  backgroundColor: dark
                    ? 'rgba(255,255,255,0.12)'
                    : 'rgba(60,60,67,0.12)',
                },
              ]}
              testID="pipeline-sheet-close">
              <FontAwesome name="times" size={14} color={t.ink} />
            </TouchableOpacity>
            </View>
          </View>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator>
            {/* Input/output code chips intentionally stay dark in both
                themes — they read as terminal/IDE blocks. */}
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
                    {
                      backgroundColor: t.surface,
                      borderColor: t.borderFaint,
                    },
                  ]}>
                  <View
                    style={[
                      styles.numBadge,
                      {
                        backgroundColor:
                          ONB_ACCENT + (dark ? '28' : '14'),
                      },
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
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  // Dim layer — covers the whole screen and fades independently of the sheet.
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    height: '88%',
    overflow: 'hidden',
  },
  grabberRow: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
  },
  grabber: {
    width: 36,
    height: 5,
    borderRadius: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 12,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 4,
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
  inputCode: {
    color: '#ff8a80',
    fontSize: 12,
    fontFamily: mono,
    flex: 1,
  },
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
  stepDesc: {
    fontSize: 14,
    lineHeight: 19,
  },
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
  outputCode: {
    color: '#86efac',
    fontSize: 12,
    fontFamily: mono,
    flex: 1,
  },
});
