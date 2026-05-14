import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTokens } from '../tokens';

// Single big Gmail-message card showing the *fixed* email. No surrounding
// app chrome — just the email itself, so the visual contrast with the
// previous (broken) screen is the whole point.

export default function FixedScreen() {
  // Fixed-state colors: real Gmail tokens. Headers dark, body dark, muted gray.
  // The Gmail card itself stays light (it's a Gmail rendering). Only the
  // page chrome (page bg, title, subtitle) flips with the system theme.
  const headerColor = '#1c1c1e';
  const bodyColor = '#202124';
  const mutedColor = '#5f6368';
  const { t } = useTokens();

  return (
    <View style={[styles.page, { backgroundColor: t.pageBg }]}>
      {/* Art */}
      <View style={styles.artArea}>
        <View style={styles.card}>
          {/* Subject row + Inbox chip */}
          <View style={styles.subjectRow}>
            <Text style={styles.subjectText} numberOfLines={1}>
              Q2 launch recap
            </Text>
            <View style={styles.inboxChip}>
              <Text style={styles.inboxChipText}>Inbox</Text>
            </View>
          </View>

          {/* Sender row */}
          <View style={styles.senderRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>M</Text>
            </View>
            <View style={styles.senderInfo}>
              <View style={styles.senderNameRow}>
                <Text style={styles.senderName}>me</Text>
                <Text style={styles.senderTime}>9:47 AM</Text>
              </View>
              <Text style={styles.senderTo}>to Sam ▾</Text>
            </View>
            <Text style={styles.replyArrow}>←</Text>
          </View>

          <View style={styles.divider} />

          {/* Body */}
          <View style={styles.body}>
            <Text style={[styles.bodyText, { color: bodyColor }]}>Hi Sam,</Text>
            <Text style={[styles.bodyText, { color: bodyColor }]}>
              Quick recap from this morning's sync —
            </Text>
            <Text
              style={[styles.bodyText, { color: bodyColor, marginTop: 4 }]}>
              • <Text style={{ fontWeight: '700', color: headerColor }}>Beta signups:</Text>{' '}
              <Text style={{ color: '#34C759', fontWeight: '600' }}>247</Text>{' '}
              <Text style={{ color: mutedColor }}>(+38 wk)</Text>
            </Text>
            <Text style={[styles.bodyText, { color: bodyColor }]}>
              • <Text style={{ fontWeight: '700', color: headerColor }}>Blocker:</Text>{' '}
              <Text style={{ color: '#FF9F0A', fontWeight: '600' }}>auth on Android</Text>{' '}
              — <Text style={{ color: mutedColor }}>Maya on it</Text>
            </Text>
            <Text style={[styles.bodyText, { color: bodyColor }]}>
              • <Text style={{ fontWeight: '700', color: headerColor }}>Ship date:</Text>{' '}
              <Text style={{ color: '#34C759', fontWeight: '700' }}>May 28</Text>{' '}
              <Text style={{ color: mutedColor }}>✓</Text>
            </Text>

            {/* FIXED badge */}
            <View style={styles.fixedBadge}>
              <FontAwesome name="check" size={8} color="#fff" />
              <Text style={styles.fixedBadgeText}>FIXED</Text>
            </View>
          </View>

          {/* Reply / Forward chips */}
          <View style={styles.actionChips}>
            <View style={styles.actionChip}>
              <Text style={styles.actionChipText}>↶ Reply</Text>
            </View>
            <View style={styles.actionChip}>
              <Text style={styles.actionChipText}>↷ Forward</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Text */}
      <View style={styles.textArea}>
        <Text style={[styles.title, { color: t.ink }]}>PasteClean fixes it!</Text>
        <Text style={[styles.subtitle, { color: t.inkMuted }]}>
          Tap Copy and we rewrite the HTML so the same email shows up perfectly
          in Gmail.
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

  // Art zone — design uses top=0.62 (62% of screen). Card sizes naturally.
  artArea: {
    paddingHorizontal: 20,
    paddingTop: 56,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    borderRadius: 16,
    backgroundColor: '#fff',
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(60,60,67,0.18)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.1,
    shadowRadius: 36,
    elevation: 12,
  },

  subjectRow: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  subjectText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#202124',
    letterSpacing: -0.1,
    flex: 1,
  },
  inboxChip: {
    borderWidth: 1,
    borderColor: '#dadce0',
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  inboxChipText: {
    fontSize: 9,
    fontWeight: '500',
    color: '#5f6368',
    letterSpacing: 0.1,
  },

  senderRow: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#1a73e8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  senderInfo: {
    flex: 1,
  },
  senderNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  senderName: {
    fontSize: 13,
    color: '#202124',
    fontWeight: '600',
  },
  senderTime: {
    fontSize: 11,
    color: '#5f6368',
    fontWeight: '400',
  },
  senderTo: {
    fontSize: 11,
    color: '#5f6368',
  },
  replyArrow: {
    color: '#5f6368',
    fontSize: 14,
  },
  divider: {
    height: 0.5,
    backgroundColor: '#dadce0',
  },

  body: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    gap: 5,
    position: 'relative',
  },
  bodyText: {
    fontSize: 13,
    lineHeight: 20,
  },
  footerText: {
    fontSize: 12,
    marginTop: 6,
  },

  fixedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#34C759',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  fixedBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  actionChips: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    flexDirection: 'row',
    gap: 6,
  },
  actionChip: {
    borderWidth: 1,
    borderColor: '#dadce0',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  actionChipText: {
    fontSize: 11,
    color: '#5f6368',
    fontWeight: '500',
  },

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
