import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { FullWindowOverlay } from 'react-native-screens';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTokens } from './tokens';

// react-native-screens renders each Stack.Screen as a native
// UIViewController. gorhom's BottomSheetModal portals to its provider —
// but on iOS, that portal target ends up BEHIND the screen's view
// controller, so the sheet appears not to open at all when invoked from
// a screen route (which is exactly what Settings → "How It Works" does).
//
// FullWindowOverlay wraps the sheet in an iOS UIWindow-level overlay that
// sits above the entire navigation stack — the documented workaround for
// gorhom issue #832, which the gorhom type defs themselves point at.
//
// Android doesn't have this layering bug; FullWindowOverlay is iOS-only,
// so the renderContainer function is a no-op there (returns the children
// directly, no wrapper).
const renderContainer =
  Platform.OS === 'ios'
    ? ({ children }: React.PropsWithChildren) => (
        <FullWindowOverlay>{children as React.ReactElement}</FullWindowOverlay>
      )
    : undefined;

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

// Single snap point at 88% — matches the previous Modal-based implementation
// so the visual footprint is unchanged. Computed once; `snapPoints` is an
// array because gorhom supports multi-stop sheets (e.g. ['25%', '88%']).
const SNAP_POINTS = ['88%'];

/**
 * Backdrop that fades in from 0 → 0.4 opacity as the sheet opens, fades
 * back out as it closes. Tap-to-dismiss is handled by gorhom via
 * pressBehavior="close".
 */
function renderBackdrop(props: BottomSheetBackdropProps) {
  return (
    <BottomSheetBackdrop
      {...props}
      opacity={0.4}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      pressBehavior="close"
    />
  );
}

// Bottom sheet implemented with @gorhom/bottom-sheet. Gestures run on the
// UI thread via react-native-gesture-handler + reanimated worklets, so the
// sheet tracks the finger 1:1 without the JS-bridge lag the previous
// PanResponder + Animated.setValue implementation had.
//
// Callers keep the same { open, onClose } interface; we translate the
// declarative `open` boolean into imperative present()/dismiss() calls on
// the modal ref.
export default function PipelineSheet({ open, onClose }: PipelineSheetProps) {
  const { dark, t } = useTokens();
  const sheetRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    if (open) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [open]);

  // gorhom fires onDismiss when the sheet has fully closed — whether the
  // user swiped, tapped the backdrop, or the parent set open=false. We
  // forward to the parent's onClose so its open state stays in sync.
  const handleDismiss = useCallback(() => {
    onClose();
  }, [onClose]);

  const backgroundStyle = useMemo(
    () => ({ backgroundColor: dark ? '#1c1c1e' : '#f2f2f7' }),
    [dark],
  );
  const handleStyle = useMemo(
    () => ({
      backgroundColor: dark
        ? 'rgba(235,235,245,0.25)'
        : 'rgba(60,60,67,0.25)',
    }),
    [dark],
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={SNAP_POINTS}
      enablePanDownToClose
      onDismiss={handleDismiss}
      backdropComponent={renderBackdrop}
      backgroundStyle={backgroundStyle}
      handleIndicatorStyle={handleStyle}
      containerComponent={renderContainer}>
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
          onPress={() => sheetRef.current?.dismiss()}
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
      <BottomSheetScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}>
        {/* Input/output code chips intentionally stay dark in both themes —
            they read as terminal/IDE blocks. */}
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
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 6,
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
