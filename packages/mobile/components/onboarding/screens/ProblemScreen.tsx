import React from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { useTokens } from '../tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Side-by-side Gmail mockups: dark mode (readable) vs light mode (invisible text)
// Matches the design handoff ProblemArt component.

function EmailBody({
  headerColor,
  bodyColor,
  mutedColor,
  accentGreen,
  accentOrange,
}: {
  headerColor: string;
  bodyColor: string;
  mutedColor: string;
  accentGreen: string;
  accentOrange: string;
}) {
  return (
    <View style={bodyStyles.container}>
      <Text style={[bodyStyles.text, { color: bodyColor }]}>Hey team,</Text>
      <Text style={[bodyStyles.text, { color: bodyColor }]}>
        Quick notes from this morning's sync —
      </Text>
      <Text style={[bodyStyles.text, { color: bodyColor }]}>
        •{' '}
        <Text style={{ fontWeight: '700', color: headerColor }}>
          Beta signups:
        </Text>{' '}
        <Text style={{ color: accentGreen }}>247</Text>{' '}
        <Text style={{ color: mutedColor }}>(+38)</Text>
      </Text>
      <Text style={[bodyStyles.text, { color: bodyColor }]}>
        •{' '}
        <Text style={{ fontWeight: '700', color: headerColor }}>Blocker:</Text>{' '}
        <Text style={{ color: accentOrange }}>auth on Android</Text>
      </Text>
      <Text style={[bodyStyles.text, { color: bodyColor }]}>
        •{' '}
        <Text style={{ fontWeight: '700', color: headerColor }}>
          Ship date:
        </Text>{' '}
        <Text style={{ color: accentGreen, fontWeight: '700' }}>May 28</Text>
      </Text>
    </View>
  );
}

const bodyStyles = StyleSheet.create({
  container: {
    gap: 4,
  },
  text: {
    fontSize: 9.5,
    lineHeight: 14,
  },
  footer: {
    fontSize: 9,
    marginTop: 3,
  },
});

function GmailCard({ variant }: { variant: 'dark' | 'light' }) {
  const isDark = variant === 'dark';
  const subjectColor = isDark ? '#e8eaed' : '#202124';
  const chevronColor = isDark ? '#9aa0a6' : '#5f6368';
  const chipBorderColor = isDark ? '#5f6368' : '#dadce0';
  const chipTextColor = isDark ? '#9aa0a6' : '#5f6368';
  const avatarBg = isDark ? '#8ab4f8' : '#1a73e8';
  const avatarTextColor = isDark ? '#202124' : '#fff';
  const senderColor = isDark ? '#e8eaed' : '#202124';
  const metaColor = isDark ? '#9aa0a6' : '#5f6368';
  const replyBorderColor = isDark ? '#5f6368' : '#dadce0';
  const replyTextColor = isDark ? '#9aa0a6' : '#5f6368';
  const cardBg = isDark ? '#202124' : '#fff';

  // Both cards use white text for the email body — visible on dark, invisible on white
  // On the dark card the green/orange accents show through; on light they're also white
  const emailHeaderColor = '#fff';
  const emailBodyColor = 'rgba(255,255,255,0.92)';
  const emailMutedColor = 'rgba(255,255,255,0.5)';
  // Accent colors show through on BOTH cards — green/orange values are visible
  // even on the white card, demonstrating the "partial breakage" problem
  const emailGreen = '#34C759';
  const emailOrange = '#FF9F0A';

  return (
    <View style={[cardStyles.cardOuter]}>
      <View
        style={[
          cardStyles.card,
          {
            backgroundColor: cardBg,
            borderWidth: isDark ? 0 : 0.5,
            borderColor: isDark ? 'transparent' : 'rgba(60,60,67,0.18)',
          },
        ]}>
        {/* Subject row */}
        <View style={cardStyles.subjectRow}>
          <Text
            style={[cardStyles.subjectText, { color: subjectColor }]}
            numberOfLines={1}>
            Q2 launch recap
          </Text>
          <View style={[cardStyles.chevronCircle, { borderColor: chevronColor }]}>
            <Text style={{ color: chevronColor, fontSize: 7 }}>›</Text>
          </View>
        </View>

        {/* Inbox chip */}
        <View style={cardStyles.chipRow}>
          <View style={[cardStyles.inboxChip, { borderColor: chipBorderColor }]}>
            <Text style={[cardStyles.chipText, { color: chipTextColor }]}>
              Inbox
            </Text>
          </View>
        </View>

        {/* Sender row */}
        <View style={cardStyles.senderRow}>
          <View style={[cardStyles.avatar, { backgroundColor: avatarBg }]}>
            <Text style={[cardStyles.avatarText, { color: avatarTextColor }]}>
              M
            </Text>
          </View>
          <View style={cardStyles.senderInfo}>
            <View style={cardStyles.senderNameRow}>
              <Text style={[cardStyles.senderName, { color: senderColor }]}>
                me
              </Text>
              <Text style={[cardStyles.senderTime, { color: metaColor }]}>
                9:47 AM
              </Text>
            </View>
            <Text style={[cardStyles.senderTo, { color: metaColor }]}>
              to Sam ▾
            </Text>
          </View>
          <Text style={{ color: isDark ? '#9aa0a6' : '#5f6368', fontSize: 10 }}>←</Text>
        </View>

        {/* Body */}
        <View style={cardStyles.bodyArea}>
          <EmailBody
            headerColor={emailHeaderColor}
            bodyColor={emailBodyColor}
            mutedColor={emailMutedColor}
            accentGreen={emailGreen}
            accentOrange={emailOrange}
          />
        </View>

        {/* Reply / Forward */}
        <View style={cardStyles.replyRow}>
          <View style={[cardStyles.replyChip, { borderColor: replyBorderColor }]}>
            <Text style={[cardStyles.replyText, { color: replyTextColor }]}>
              ↶ Reply
            </Text>
          </View>
          <View style={[cardStyles.replyChip, { borderColor: replyBorderColor }]}>
            <Text style={[cardStyles.replyText, { color: replyTextColor }]}>
              ↷ Forward
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  // Outer wrapper for shadow (iOS needs overflow:visible for shadows but
  // the card itself needs overflow:hidden for borderRadius clipping)
  cardOuter: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 13,
    elevation: 10,
  },
  card: {
    width: '100%',
    height: 220,
    borderRadius: 14,
    overflow: 'hidden',
  },
  subjectRow: {
    paddingTop: 8,
    paddingHorizontal: 10,
    paddingBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  subjectText: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: -0.1,
    flex: 1,
  },
  chevronCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipRow: {
    paddingHorizontal: 10,
    paddingBottom: 6,
  },
  inboxChip: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  chipText: {
    fontSize: 7,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  senderRow: {
    paddingHorizontal: 10,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  avatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 10,
    fontWeight: '700',
  },
  senderInfo: {
    flex: 1,
  },
  senderNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  senderName: {
    fontSize: 9.5,
    fontWeight: '600',
  },
  senderTime: {
    fontSize: 8,
    fontWeight: '400',
  },
  senderTo: {
    fontSize: 8,
  },
  bodyArea: {
    paddingHorizontal: 10,
    flex: 1,
  },
  replyRow: {
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 10,
    paddingBottom: 6,
  },
  replyChip: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  replyText: {
    fontSize: 8.5,
    fontWeight: '500',
  },
});

export default function ProblemScreen() {
  // Page chrome flips with the system theme. The Gmail card mocks stay
  // fixed — they represent real Gmail rendering, not app chrome.
  const { dark, t } = useTokens();
  const labelMuted = dark
    ? 'rgba(235,235,245,0.55)'
    : 'rgba(60,60,67,0.55)';
  return (
    <View style={[styles.page, { backgroundColor: t.pageBg }]}>
      {/* Art */}
      <View style={styles.artArea}>
        <View style={styles.cardsRow}>
          {/* Dark-mode card — readable */}
          <View style={styles.cardWrapper}>
            <Text style={[styles.cardLabel, { color: labelMuted }]}>
              You wrote (dark mode)
            </Text>
            <GmailCard variant="dark" />
          </View>

          {/* Gmail light card — text invisible */}
          <View style={styles.cardWrapper}>
            <Text style={[styles.cardLabel, styles.gmailLabel]}>
              In Gmail (light)
            </Text>
            <GmailCard variant="light" />
          </View>
        </View>
      </View>

      {/* Text */}
      <View style={styles.textArea}>
        <Text style={[styles.title, { color: t.ink }]}>
          It's 2026. Why does this still suck?
        </Text>
        <Text style={[styles.subtitle, { color: t.inkMuted }]}>
          You're on your phone. Writing to a{' '}
          <Text style={[styles.bold, { color: t.ink }]}>recruiter</Text>, an{' '}
          <Text style={[styles.bold, { color: t.ink }]}>investor</Text>, your{' '}
          <Text style={[styles.bold, { color: t.ink }]}>VP</Text>. No laptop. No
          time to redo it. And Gmail mangles every dark-mode paste — white text
          on white background, colors trashed. Not a great look when stakes are
          high.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#fff',
  },
  artArea: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingBottom: 8,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cardWrapper: {
    flex: 1,
    gap: 6,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: 'rgba(60,60,67,0.55)',
    paddingLeft: 4,
  },
  gmailLabel: {
    color: '#FF3B30',
  },
  textArea: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 24,
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
  bold: {
    fontWeight: '700',
    color: '#1c1c1e',
  },
});
