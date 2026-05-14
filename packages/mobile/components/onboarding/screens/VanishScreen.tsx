import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated, Easing } from 'react-native';
import { useTokens } from '../tokens';

// Two Gmail states crossfading — compose (dark mode) <-> sent (light mode).
// Same body text on both sides. Compose shows perfectly; sent loses every
// white-on-white character. Stage label flips with the card.

function VanishBody({
  headerColor,
  bodyColor,
  mutedColor,
}: {
  headerColor: string;
  bodyColor: string;
  mutedColor: string;
}) {
  return (
    <View style={bodyStyles.container}>
      <Text style={[bodyStyles.line, { color: bodyColor }]}>Hi Sam,</Text>
      <Text style={[bodyStyles.line, { color: bodyColor }]}>
        Quick recap from this morning's sync —
      </Text>
      <Text style={[bodyStyles.line, { color: bodyColor, marginTop: 3 }]}>
        • <Text style={{ fontWeight: '700', color: headerColor }}>Beta signups:</Text>{' '}
        <Text style={{ color: '#34C759', fontWeight: '600' }}>247</Text>
      </Text>
      <Text style={[bodyStyles.line, { color: bodyColor }]}>
        • <Text style={{ fontWeight: '700', color: headerColor }}>Blocker:</Text>{' '}
        <Text style={{ color: '#FF9F0A', fontWeight: '600' }}>auth on Android</Text>
      </Text>
      <Text style={[bodyStyles.line, { color: bodyColor }]}>
        • <Text style={{ fontWeight: '700', color: headerColor }}>Ship date:</Text>{' '}
        <Text style={{ color: '#34C759', fontWeight: '700' }}>May 28</Text>
      </Text>
    </View>
  );
}

const bodyStyles = StyleSheet.create({
  container: {
    gap: 4,
  },
  line: {
    fontSize: 12,
    lineHeight: 18,
  },
  footer: {
    fontSize: 11,
    marginTop: 4,
  },
});

export default function VanishScreen() {
  // Crossfade: cardOpacity drives the compose card (1 -> 0 -> 1).
  // labelOpacity inverts on the sent label (composing fades out, sent fades in).
  // Chrome (page bg, title, subtitle) follows the system theme. The Gmail
  // compose + sent cards stay fixed — they represent real Gmail rendering.
  const { t } = useTokens();
  const compose = useRef(new Animated.Value(1)).current;
  const sent = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 6.0s total loop: hold 2.4s, fade 0.6s, hold 2.4s, fade 0.6s.
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(2400),
        Animated.parallel([
          Animated.timing(compose, {
            toValue: 0,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(sent, {
            toValue: 1,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(2400),
        Animated.parallel([
          Animated.timing(compose, {
            toValue: 1,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(sent, {
            toValue: 0,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [compose, sent]);

  return (
    <View style={[styles.page, { backgroundColor: t.pageBg }]}>
      {/* Art */}
      <View style={styles.artArea}>
        <View style={styles.cardStack}>
          {/* DARK COMPOSE state */}
          <Animated.View
            style={[styles.cardLayer, styles.composeCard, { opacity: compose }]}
            testID="onboarding-vanish-compose">
            {/* Compose header */}
            <View style={styles.composeHeader}>
              <Text style={styles.composeTitle}>New message</Text>
            </View>
            {/* To */}
            <View style={styles.composeRowSep}>
              <Text style={styles.composeFieldLabel}>
                To <Text style={styles.composeFieldValue}>sam@company.com</Text>
              </Text>
            </View>
            {/* Subject */}
            <View style={styles.composeRowSep}>
              <Text style={styles.composeSubject}>Q2 launch recap</Text>
            </View>
            {/* Body */}
            <View style={styles.composeBody}>
              <VanishBody
                headerColor="#fff"
                bodyColor="rgba(255,255,255,0.92)"
                mutedColor="rgba(255,255,255,0.5)"
              />
            </View>
            {/* Send bar */}
            <View style={styles.composeSendBar}>
              <View style={styles.sendBtn}>
                <Text style={styles.sendBtnText}>Send</Text>
              </View>
            </View>
          </Animated.View>

          {/* LIGHT SENT state */}
          <Animated.View
            style={[styles.cardLayer, styles.sentCard, { opacity: sent }]}
            testID="onboarding-vanish-sent">
            {/* Subject row + Inbox chip */}
            <View style={styles.sentSubjectRow}>
              <Text style={styles.sentSubject}>Q2 launch recap</Text>
              <View style={styles.inboxChip}>
                <Text style={styles.inboxChipText}>Inbox</Text>
              </View>
            </View>
            {/* Sender row */}
            <View style={styles.sentSenderRow}>
              <View style={styles.sentAvatar}>
                <Text style={styles.sentAvatarText}>M</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sentName}>
                  me <Text style={styles.sentMeta}>9:47 AM</Text>
                </Text>
                <Text style={styles.sentMeta}>to Sam ▾</Text>
              </View>
            </View>
            <View style={styles.sentDivider} />
            {/* Body — same white tokens, now on white */}
            <View style={styles.sentBody}>
              <VanishBody
                headerColor="#fff"
                bodyColor="rgba(255,255,255,0.92)"
                mutedColor="rgba(255,255,255,0.5)"
              />
              {/* Red pill overlay */}
              <View style={styles.redPillWrap} pointerEvents="none">
                <View style={styles.redPill}>
                  <Text style={styles.redPillText}>
                    where did everything go?
                  </Text>
                </View>
              </View>
            </View>
            {/* Reply chips */}
            <View style={styles.replyChipsRow}>
              <View style={styles.replyChip}>
                <Text style={styles.replyChipText}>↶ Reply</Text>
              </View>
              <View style={styles.replyChip}>
                <Text style={styles.replyChipText}>↷ Forward</Text>
              </View>
            </View>
          </Animated.View>
        </View>

        {/* Stage label — crossfades with the cards */}
        <View style={styles.stageLabelRow}>
          <Animated.View
            style={[styles.stageLabel, { opacity: compose }]}
            pointerEvents="none">
            <View style={styles.stageLabelDot} />
            <Text style={styles.stageLabelTextCompose}>COMPOSING</Text>
          </Animated.View>
          <Animated.View
            style={[styles.stageLabel, { opacity: sent }]}
            pointerEvents="none">
            <View style={[styles.stageLabelDot, styles.stageLabelDotSent]} />
            <Text style={styles.stageLabelTextSent}>SENT · IN GMAIL</Text>
          </Animated.View>
        </View>
      </View>

      {/* Text */}
      <View style={styles.textArea}>
        <Text style={[styles.title, { color: t.ink }]}>Watch it vanish.</Text>
        <Text style={[styles.subtitle, { color: t.inkMuted }]}>
          Your email looks perfect while you write. The moment Gmail repaints it
          on a white background, the text you can't see is the text your
          recipient won't read.
        </Text>
      </View>
    </View>
  );
}

const CARD_HEIGHT = 250;

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#fff',
  },

  // Art zone — the design uses flex: 0.58 (top fraction of screen).
  // Here we let the cards size themselves and let the text fill the rest.
  artArea: {
    paddingHorizontal: 36,
    paddingTop: 56,
    paddingBottom: 0,
    alignItems: 'center',
  },
  cardStack: {
    width: '100%',
    height: CARD_HEIGHT,
    position: 'relative',
  },
  cardLayer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 14,
    overflow: 'hidden',
  },
  composeCard: {
    backgroundColor: '#202124',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.28,
    shadowRadius: 40,
    elevation: 16,
  },
  sentCard: {
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: 'rgba(60,60,67,0.18)',
    // Heavy, dark shadow so the white card lifts off the white page bg.
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.38,
    shadowRadius: 32,
    elevation: 24,
  },

  // Compose internals
  composeHeader: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#3c4043',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  composeTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#e8eaed',
    letterSpacing: -0.1,
  },
  composeRowSep: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#3c4043',
  },
  composeFieldLabel: {
    fontSize: 10,
    color: '#9aa0a6',
  },
  composeFieldValue: {
    color: '#e8eaed',
  },
  composeSubject: {
    fontSize: 11,
    color: '#e8eaed',
    fontWeight: '500',
  },
  composeBody: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
    overflow: 'hidden',
  },
  composeSendBar: {
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 8,
    borderTopWidth: 0.5,
    borderTopColor: '#3c4043',
    flexDirection: 'row',
    alignItems: 'center',
  },
  sendBtn: {
    backgroundColor: '#8ab4f8',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 99,
  },
  sendBtnText: {
    color: '#202124',
    fontSize: 10,
    fontWeight: '700',
  },

  // Sent internals
  sentSubjectRow: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sentSubject: {
    fontSize: 12,
    fontWeight: '500',
    color: '#202124',
  },
  inboxChip: {
    borderWidth: 1,
    borderColor: '#dadce0',
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  inboxChipText: {
    fontSize: 8,
    fontWeight: '500',
    color: '#5f6368',
  },
  sentSenderRow: {
    paddingHorizontal: 12,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sentAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#1a73e8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sentAvatarText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  sentName: {
    fontSize: 10,
    color: '#202124',
    fontWeight: '600',
  },
  sentMeta: {
    fontSize: 9,
    color: '#5f6368',
    fontWeight: '400',
  },
  sentDivider: {
    height: 0.5,
    backgroundColor: '#dadce0',
  },
  sentBody: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  redPillWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  redPill: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#FF3B30',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 8,
  },
  redPillText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  replyChipsRow: {
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 10,
    flexDirection: 'row',
    gap: 5,
  },
  replyChip: {
    borderWidth: 1,
    borderColor: '#dadce0',
    borderRadius: 14,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  replyChipText: {
    fontSize: 9.5,
    color: '#5f6368',
    fontWeight: '500',
  },

  // Stage label
  stageLabelRow: {
    height: 20,
    alignSelf: 'stretch',
    marginTop: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageLabel: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stageLabelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8ab4f8',
    shadowColor: '#8ab4f8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 0,
  },
  stageLabelDotSent: {
    backgroundColor: '#FF3B30',
    shadowOpacity: 0,
  },
  stageLabelTextCompose: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: '#8ab4f8',
  },
  stageLabelTextSent: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: '#FF3B30',
  },

  // Text zone
  textArea: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 4,
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
});
