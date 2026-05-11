import type { CheerioAPI, Cheerio } from 'cheerio';
import Color from 'color';

type ColorInstance = ReturnType<typeof Color>;

const WHITE = Color('#ffffff');
const BLACK = Color('#000000');
const DEFAULT_TEXT_COLOR = '#000000';
const DEFAULT_BG_COLOR = '#ffffff';

// WCAG minimum contrast ratio for normal text readability
const MIN_CONTRAST_RATIO = 3.0;

// Luminance thresholds for detecting dark-mode artifacts
const DARK_BG_LUMINANCE_THRESHOLD = 0.3;

// Container elements that should get explicit backgrounds to anchor rendering
const CONTAINER_ELEMENTS = new Set([
  'div',
  'td',
  'th',
  'table',
  'blockquote',
  'pre',
]);

/**
 * Fix dark-mode color issues so HTML renders correctly on Gmail's white background.
 *
 * Strategy:
 * 1. Walk every element with an explicit color or background-color
 * 2. Compute WCAG contrast ratio of text color against white (#ffffff)
 * 3. If contrast < 3:1, the text would be nearly invisible — darken it
 * 4. Strip dark backgrounds (they become invisible padding on white)
 * 5. Add explicit colors to elements with no color set (prevents Gmail
 *    dark mode from inverting them unpredictably)
 */
export function fixDarkModeColors($: CheerioAPI): void {
  // Pass 1: Fix elements with explicit colors
  $('[style]').each(function () {
    const el = $(this);
    const style = el.attr('style') || '';
    const parsed = parseInlineStyle(style);

    let modified = false;

    // Handle background-color
    const bgColor = parsed.get('background-color') || parsed.get('background');
    if (bgColor) {
      const bg = safeParseColor(extractColorFromBackground(bgColor));
      if (bg) {
        const bgLuminance = bg.luminosity();
        if (bgLuminance < DARK_BG_LUMINANCE_THRESHOLD) {
          // Dark background — strip it. Gmail renders on white, so a dark
          // container just becomes an invisible box.
          parsed.delete('background-color');
          parsed.delete('background');
          modified = true;
        }
      }
    }

    // Handle text color
    const textColor = parsed.get('color');
    if (textColor) {
      const fg = safeParseColor(textColor);
      if (fg) {
        const contrastAgainstWhite = WHITE.contrast(fg);
        if (contrastAgainstWhite < MIN_CONTRAST_RATIO) {
          // Text is too light for a white background — darken it
          const darkened = darkenPreservingHue(fg);
          parsed.set('color', darkened);
          modified = true;
        }
      }
    }

    if (modified) {
      el.attr('style', serializeStyle(parsed));
    }
  });

  // Pass 2: Add explicit color to text elements that have no color set.
  // This prevents Gmail dark mode from applying its own color inversion.
  $('p, span, div, li, td, th, h1, h2, h3, h4, h5, h6, a, b, strong, em, i, u, blockquote, pre, code').each(
    function () {
      const el = $(this);
      const style = el.attr('style') || '';
      const parsed = parseInlineStyle(style);

      if (!parsed.has('color')) {
        // Check if any ancestor already sets color (walk up the tree)
        if (!ancestorHasColor($, el)) {
          parsed.set('color', DEFAULT_TEXT_COLOR);
          el.attr('style', serializeStyle(parsed));
        }
      }
    },
  );

  // Pass 3: Add explicit background-color on container elements
  // to anchor Gmail's rendering
  $(Array.from(CONTAINER_ELEMENTS).join(', ')).each(function () {
    const el = $(this);
    const style = el.attr('style') || '';
    const parsed = parseInlineStyle(style);

    // Only add bg to top-level containers (direct children of body or elements
    // that don't have a parent with an explicit background)
    if (
      !parsed.has('background-color') &&
      !parsed.has('background') &&
      !ancestorHasBackground($, el)
    ) {
      parsed.set('background-color', DEFAULT_BG_COLOR);
      el.attr('style', serializeStyle(parsed));
    }
  });
}

/**
 * Check if any ancestor element has an explicit color set.
 */
function ancestorHasColor($: CheerioAPI, el: Cheerio<any>): boolean {
  let parent = el.parent();
  while (parent.length > 0) {
    const tagName = (parent[0] as any)?.tagName?.toLowerCase();
    if (!tagName || tagName === 'html' || tagName === 'body') break;
    const style = parent.attr('style') || '';
    if (style.includes('color:') || style.includes('color :')) {
      // Make sure it's the color property, not background-color
      const parsed = parseInlineStyle(style);
      if (parsed.has('color')) return true;
    }
    parent = parent.parent();
  }
  return false;
}

/**
 * Check if any ancestor element has an explicit background set.
 */
function ancestorHasBackground(
  $: CheerioAPI,
  el: Cheerio<any>,
): boolean {
  let parent = el.parent();
  while (parent.length > 0) {
    const tagName = (parent[0] as any)?.tagName?.toLowerCase();
    if (!tagName || tagName === 'html' || tagName === 'body') break;
    const style = parent.attr('style') || '';
    const parsed = parseInlineStyle(style);
    if (parsed.has('background-color') || parsed.has('background'))
      return true;
    parent = parent.parent();
  }
  return false;
}

/**
 * Darken a color while preserving its hue.
 * If the color is very light (close to white), return black.
 * Otherwise, darken it until contrast against white >= MIN_CONTRAST_RATIO.
 */
function darkenPreservingHue(color: ColorInstance): string {
  const hsl = color.hsl();
  const saturation = hsl.saturationl();

  // If the color is essentially gray/white (very low saturation), just use black
  if (saturation < 5) {
    return DEFAULT_TEXT_COLOR;
  }

  // Progressively darken by reducing lightness until contrast is sufficient
  let lightness = hsl.lightness();
  let attempt = color;

  for (let i = 0; i < 50; i++) {
    lightness -= 5;
    if (lightness < 10) {
      return attempt.hex().toLowerCase();
    }
    attempt = Color.hsl(hsl.hue(), saturation, lightness);
    if (WHITE.contrast(attempt) >= MIN_CONTRAST_RATIO) {
      return attempt.hex().toLowerCase();
    }
  }

  return DEFAULT_TEXT_COLOR;
}

/**
 * Extract a color value from a background shorthand.
 * e.g. "rgb(30, 30, 30) none" → "rgb(30, 30, 30)"
 */
function extractColorFromBackground(value: string): string {
  // Try to find a color-like value in the background shorthand
  const rgbMatch = value.match(/rgba?\([^)]+\)/);
  if (rgbMatch) return rgbMatch[0];

  const hexMatch = value.match(/#[0-9a-fA-F]{3,8}\b/);
  if (hexMatch) return hexMatch[0];

  // Named colors — just try the first token
  const firstToken = value.split(/\s+/)[0];
  return firstToken;
}

/**
 * Safely parse a CSS color value. Returns null if unparseable.
 */
function safeParseColor(value: string): ColorInstance | null {
  try {
    // Strip !important
    const cleaned = value.replace(/!important/gi, '').trim();
    if (!cleaned || cleaned === 'inherit' || cleaned === 'initial' || cleaned === 'unset' || cleaned === 'currentColor') {
      return null;
    }
    return Color(cleaned);
  } catch {
    return null;
  }
}

/**
 * Parse an inline style string into a Map of property → value.
 */
function parseInlineStyle(style: string): Map<string, string> {
  const map = new Map<string, string>();
  const parts = style.split(';');
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) continue;
    const property = trimmed.substring(0, colonIndex).trim().toLowerCase();
    const value = trimmed.substring(colonIndex + 1).trim();
    map.set(property, value);
  }
  return map;
}

/**
 * Serialize a Map of CSS properties back to an inline style string.
 */
function serializeStyle(map: Map<string, string>): string {
  const parts: string[] = [];
  for (const [prop, val] of map) {
    parts.push(`${prop}: ${val}`);
  }
  return parts.join('; ');
}
