import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTokens } from './tokens';

const ONB_ACCENT = '#007AFF';
const mono = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

const PIPELINE_STEPS = [
  { num: '01', label: 'Inlines all CSS', desc: 'Gmail ignores <style> blocks. We convert classes to inline style="".' },
  { num: '02', label: 'Strips dangerous tags', desc: '<script> <iframe> <form> — gone. Only safe HTML survives.' },
  { num: '03', label: 'Removes unsupported CSS', desc: 'position, transform, box-shadow, animation — stripped.' },
  { num: '04', label: 'Converts headings', desc: '<h1> → <p style="font-size:22px;font-weight:bold">.' },
  { num: '05', label: 'Fixes invisible text', desc: 'Light text on white? We darken it until WCAG contrast ≥ 3:1 — hue preserved.' },
  { num: '06', label: 'Strips dark backgrounds', desc: 'background:#1a1a1a removed; text re-tinted to read on white.' },
  { num: '07', label: 'Forces explicit colors', desc: "Adds color:#000 and background:#fff so Gmail's dark mode can't invert anything." },
  { num: '08', label: 'Cleans up', desc: 'Empty spans, redundant wrappers, orphan attributes — stripped.' },
];

interface PipelineSheetProps {
  open: boolean;
  onClose: () => void;
}

const SNAP_POINTS = ['88%'];

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

// Non-modal BottomSheet: rendered inline at the bottom of SettingsScreen,
// controlled via the `index` prop. We tried BottomSheetModal first (in
// v1.1.3/v1.1.4) but the portal interaction with expo-router's Stack
// screens was broken — present() fired, no visible output. The non-modal
// flavor is simpler: no provider needed, no portal, sheet renders inline
// at index -1 (closed) until we set index to 0 (the only snap point).
//
// Layout: parent must give us absolute positioning over the screen — done
// via the StyleSheet.absoluteFill wrapper.
export default function PipelineSheet({ open, onClose }: PipelineSheetProps) {
  const { dark, t } = useTokens();
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheet>(null);

  // Drive open/close via the bottom-sheet's imperative API. snapToIndex(0)
  // opens to our single snap point; close() animates back to -1.
  useEffect(() => {
    if (open) {
      sheetRef.current?.snapToIndex(0);
    } else {
      sheetRef.current?.close();
    }
  }, [open]);

  // gorhom fires onChange(-1) on initial mount (before the sheet has ever
  // been opened) AND on real user dismisses (swipe down / backdrop tap).
  // If we forward both to the parent's onClose, the initial -1 fires
  // onClose while the parent is in the middle of setting open=true → the
  // sheet ping-pongs and never settles.
  //
  // Gate: only fire onClose if we've previously seen a non-negative index
  // (i.e. the sheet was actually open before this -1). The ref also gets
  // reset so the next open cycle works.
  const hasBeenOpenedRef = useRef(false);
  const handleChange = useCallback(
    (index: number) => {
      if (index >= 0) {
        hasBeenOpenedRef.current = true;
      } else if (index === -1 && hasBeenOpenedRef.current) {
        hasBeenOpenedRef.current = false;
        onClose();
      }
    },
    [onClose],
  );

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
    <View style={StyleSheet.absoluteFill} pointerEvents={open ? 'auto' : 'box-none'}>
      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={SNAP_POINTS}
        topInset={insets.top}
        enablePanDownToClose
        // Cap upward drag at the 88% snap point. Without this, gorhom's
        // default enableOverDrag lets the user pull the sheet ABOVE the
        // snap (with resistance) up to the topInset — but the visual
        // result on iOS is the sheet content overlapping the Settings
        // navigation header ("How PasteClean works" colliding with
        // "Settings" large title). Disabling overdrag locks the upper
        // edge to the snap point; downward pan-to-close is unaffected.
        enableOverDrag={false}
        onChange={handleChange}
        backdropComponent={renderBackdrop}
        backgroundStyle={backgroundStyle}
        handleIndicatorStyle={handleStyle}>
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
            onPress={() => sheetRef.current?.close()}
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
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
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
  title: { fontSize: 20, fontWeight: '700', letterSpacing: -0.4 },
  subtitle: { fontSize: 14, marginTop: 2 },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 22, paddingTop: 4, paddingBottom: 40 },
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
