import React, { useRef, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PagerView from 'react-native-pager-view';

import ProblemScreen from './screens/ProblemScreen';
import FixedScreen from './screens/FixedScreen';
import FlowScreen from './screens/FlowScreen';
import ThemeScreen from './screens/ThemeScreen';
import HowItWorksContent from '@/components/HowItWorksContent';
import { useTokens } from './tokens';
import { resolveAccent } from '@/constants/Colors';

const PAGE_COUNT = 4;

interface OnboardingFlowProps {
  accent: string;
  setAccent: (color: string) => void;
  onDone: () => void;
}

export default function OnboardingFlow({
  accent,
  setAccent,
  onDone,
}: OnboardingFlowProps) {
  const insets = useSafeAreaInsets();
  const { dark, t } = useTokens();
  // Resolved accent flips Mono to white in dark mode (etc.) so visuals
  // stay visible. The picker still receives the raw `accent` ID for
  // selection matching.
  const a = resolveAccent(accent, dark);
  const pagerRef = useRef<PagerView>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [peekOpen, setPeekOpen] = useState(false);

  const goToNext = useCallback(() => {
    if (currentPage >= PAGE_COUNT - 1) {
      onDone();
      return;
    }
    pagerRef.current?.setPage(currentPage + 1);
  }, [currentPage, onDone]);

  const isLast = currentPage === PAGE_COUNT - 1;
  const ctaLabel = isLast ? 'Get Started' : 'Continue';

  // Keep the title close to the status bar: just safe-area + a small breath.
  // Each screen owns its internal top padding from there.
  const topPad = Math.max(20, insets.top + 12);
  const bottomPad = Math.max(44, insets.bottom + 24);

  return (
    <View
      style={[
        styles.container,
        { paddingTop: topPad, backgroundColor: t.pageBg },
      ]}>
      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={0}
        onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}>
        <View key="0" style={styles.page} testID="onboarding-page-0">
          <ProblemScreen active={currentPage === 0} />
        </View>
        <View key="1" style={styles.page} testID="onboarding-page-1">
          <FixedScreen />
        </View>
        <View key="2" style={styles.page} testID="onboarding-page-2">
          <FlowScreen accent={a} onPeek={() => setPeekOpen(true)} />
        </View>
        <View key="3" style={styles.page} testID="onboarding-page-3">
          {/* Picker compares against the raw stored id, so pass `accent`,
              not the resolved value. */}
          <ThemeScreen accent={accent} setAccent={setAccent} />
        </View>
      </PagerView>

      {/* Bottom controls */}
      <View style={[styles.bottomArea, { paddingBottom: bottomPad }]}>
        <View style={styles.dotsRow}>
          {Array.from({ length: PAGE_COUNT }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === currentPage
                  ? { width: 18, backgroundColor: a }
                  : {
                      width: 6,
                      backgroundColor: dark
                        ? 'rgba(235,235,245,0.22)'
                        : 'rgba(60,60,67,0.22)',
                    },
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.ctaButton,
            { backgroundColor: a, shadowColor: a },
          ]}
          activeOpacity={0.85}
          onPress={goToNext}
          testID="onboarding-cta">
          <Text style={styles.ctaText}>{ctaLabel}</Text>
        </TouchableOpacity>
      </View>

      {/* "How PasteClean works" peek — RN Modal here (not the Stack's
          formSheet) because onboarding renders BEFORE the Stack mounts,
          so router.push isn't an option during onboarding. The
          formSheet variant is used from Settings post-onboarding;
          both contexts share the same content component.
          Dismissal: iOS pageSheet supports swipe-down natively;
          onRequestClose fires when the user does that, so peekOpen
          flips back to false. No in-content X button (see
          HowItWorksContent's comment for why). */}
      <Modal
        visible={peekOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setPeekOpen(false)}
        onDismiss={() => setPeekOpen(false)}>
        <HowItWorksContent />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
  bottomArea: {
    paddingHorizontal: 24,
    paddingTop: 8,
    gap: 16,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  ctaButton: {
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.33,
    shadowRadius: 20,
    elevation: 8,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: -0.2,
  },
});
