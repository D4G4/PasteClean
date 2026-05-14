import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useColorScheme } from '@/components/useColorScheme';
import { getColors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';

// ---------------------------------------------------------------------------
// Sample templates (populated state)
// ---------------------------------------------------------------------------
const SAMPLE_TEMPLATES = [
  {
    id: '1',
    title: 'Cold outreach',
    snippet: 'Hi {{name}}, I came across your work on\u2026',
    accent: '#FFE5D9',
  },
  {
    id: '2',
    title: 'Meeting follow-up',
    snippet:
      'Great chatting earlier. As discussed, here are the next steps\u2026',
    accent: '#E1F0FF',
  },
  {
    id: '3',
    title: 'Weekly update',
    snippet:
      "Quick summary of this week \u2014 wins, blockers, and what's next.",
    accent: '#E8F8E9',
  },
  {
    id: '4',
    title: 'Polite decline',
    snippet:
      "Thanks so much for the offer \u2014 unfortunately I won't be able to\u2026",
    accent: '#FFF4D6',
  },
  {
    id: '5',
    title: 'Bug report',
    snippet: 'Repro steps, expected vs actual, environment details.',
    accent: '#F0E5FF',
  },
  {
    id: '6',
    title: 'Intro email',
    snippet:
      'Hey {{a}}, meet {{b}} \u2014 I think you two should know each other.',
    accent: '#FFE2EF',
  },
];

// ---------------------------------------------------------------------------
// Decorative faux-text lines rendered inside the colour swatch
// ---------------------------------------------------------------------------
function FauxTextLines({ color }: { color: string }) {
  const baseColor = color + '40'; // 25% opacity via hex alpha
  return (
    <View style={{ gap: 5 }}>
      <View style={{ width: 42, height: 4, borderRadius: 2, backgroundColor: baseColor }} />
      <View style={{ width: 52, height: 4, borderRadius: 2, backgroundColor: baseColor, opacity: 0.8 }} />
      <View style={{ width: 30, height: 4, borderRadius: 2, backgroundColor: baseColor, opacity: 0.6 }} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Bookmark icon for the empty state (88x88 rounded rect)
// ---------------------------------------------------------------------------
function BookmarkIcon({ accent }: { accent: string }) {
  return (
    <View
      style={{
        width: 88,
        height: 88,
        borderRadius: 24,
        backgroundColor: accent + '18',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <FontAwesome name="bookmark-o" size={36} color={accent} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Template card
// ---------------------------------------------------------------------------
function TemplateCard({
  item,
  cardWidth,
  cardBg,
  fg,
  fgMuted,
}: {
  item: (typeof SAMPLE_TEMPLATES)[number];
  cardWidth: number;
  cardBg: string;
  fg: string;
  fgMuted: string;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[
        styles.card,
        {
          width: cardWidth,
          backgroundColor: cardBg,
        },
      ]}>
      {/* Colour swatch top section */}
      <View style={[styles.cardSwatch, { backgroundColor: item.accent }]}>
        <FauxTextLines color={fg} />
      </View>
      {/* Text bottom section */}
      <View style={styles.cardBody}>
        <Text style={[styles.cardTitle, { color: fg }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.cardSnippet, { color: fgMuted }]} numberOfLines={3}>
          {item.snippet}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// Templates Screen
// ---------------------------------------------------------------------------
export default function TemplatesScreen() {
  const colorScheme = useColorScheme();
  const dark = colorScheme === 'dark';
  const colors = getColors(dark);
  const { accent } = useTheme();
  const { width: windowWidth } = useWindowDimensions();

  const templates = SAMPLE_TEMPLATES; // swap to [] to see empty state

  // Card sizing for 2-column grid: 16px outer padding each side, 12px gap
  const cardWidth = (windowWidth - 16 * 2 - 12) / 2;

  return (
    <View style={[styles.container, { backgroundColor: dark ? '#000' : '#f2f2f7' }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: dark
              ? 'rgba(0,0,0,0.85)'
              : 'rgba(242,242,247,0.85)',
          },
        ]}>
        <Text style={[styles.headerTitle, { color: colors.fg }]}>
          Templates
        </Text>
        <TouchableOpacity style={styles.headerButton} activeOpacity={0.6}>
          <FontAwesome name="plus" size={20} color={accent} />
        </TouchableOpacity>
      </View>

      {/* Body */}
      {templates.length === 0 ? (
        /* Empty state */
        <View style={styles.emptyState}>
          <BookmarkIcon accent={accent} />
          <Text style={[styles.emptyTitle, { color: colors.fg }]}>
            No templates yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.fgMuted }]}>
            Save your frequently used email formats as templates for quick
            access.
          </Text>
          <TouchableOpacity
            style={[styles.emptyButton, { backgroundColor: accent }]}
            activeOpacity={0.7}>
            <FontAwesome name="plus" size={14} color="#fff" />
            <Text style={styles.emptyButtonText}>New template</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* Populated state — 2-column grid */
        <FlatList
          data={templates}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={styles.gridRow}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TemplateCard
              item={item}
              cardWidth={cardWidth}
              cardBg={colors.cardBg}
              fg={colors.fg}
              fgMuted={colors.fgMuted}
            />
          )}
        />
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingBottom: 6,
    paddingLeft: 20,
    paddingRight: 12,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: 0.36,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Grid
  gridContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 100,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  // Card
  card: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  cardSwatch: {
    height: 76,
    justifyContent: 'center',
    paddingLeft: 14,
  },
  cardBody: {
    padding: 12,
    paddingTop: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardSnippet: {
    fontSize: 12,
    lineHeight: 16,
  },

  // Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 96,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 8,
    maxWidth: 260,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    paddingHorizontal: 22,
    borderRadius: 22,
    marginTop: 28,
    gap: 6,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
