import type { CheerioAPI } from 'cheerio';
import {
  UNSAFE_ELEMENTS,
  ALLOWED_ELEMENTS,
  ALLOWED_ATTRIBUTES,
  ALLOWED_CSS_PROPERTIES,
} from './whitelist.js';

/**
 * Remove elements that Gmail strips entirely (script, style, iframe, etc.).
 * Their content is also removed — these are not unwrapped, they're deleted.
 */
export function stripUnsafeElements($: CheerioAPI): void {
  const selector = Array.from(UNSAFE_ELEMENTS).join(', ');
  $(selector).remove();
}

/**
 * For elements not in the Gmail whitelist but also not in the unsafe list
 * (e.g. <section>, <article>, <main>, <header>, <footer>, <nav>, <figure>),
 * unwrap them — keep their children, remove the tag itself.
 */
export function unwrapUnknownElements($: CheerioAPI): void {
  // Walk the tree bottom-up so nested unknowns unwrap correctly
  let found = true;
  while (found) {
    found = false;
    $('*').each(function () {
      const el = $(this);
      const tagName = (this as any).tagName?.toLowerCase();
      if (
        tagName &&
        !ALLOWED_ELEMENTS.has(tagName) &&
        !UNSAFE_ELEMENTS.has(tagName) &&
        tagName !== 'html' &&
        tagName !== 'head' &&
        tagName !== 'body'
      ) {
        el.replaceWith(el.contents());
        found = true;
        return false; // restart iteration after DOM mutation
      }
    });
  }
}

/**
 * Remove all attributes that Gmail strips, keeping only the whitelist.
 * Also removes event handler attributes (onclick, onload, etc.).
 */
export function stripUnsafeAttributes($: CheerioAPI): void {
  $('*').each(function () {
    const el = $(this);
    const attribs = (this as any).attribs;
    if (!attribs) return;

    for (const attr of Object.keys(attribs)) {
      const lowerAttr = attr.toLowerCase();
      if (!ALLOWED_ATTRIBUTES.has(lowerAttr)) {
        el.removeAttr(attr);
      }
      // Extra safety: strip any on* event handlers even if they somehow
      // got into an allowed attribute name
      if (lowerAttr.startsWith('on')) {
        el.removeAttr(attr);
      }
    }
  });
}

/**
 * Parse inline style strings and keep only Gmail-supported CSS properties.
 * Strips background-image, linear-gradient, CSS variables, etc.
 */
export function whitelistCssProperties($: CheerioAPI): void {
  $('[style]').each(function () {
    const el = $(this);
    const style = el.attr('style');
    if (!style) return;

    const cleaned = filterStyleString(style);
    if (cleaned) {
      el.attr('style', cleaned);
    } else {
      el.removeAttr('style');
    }
  });
}

/**
 * Parse a CSS style string and return only allowed properties.
 */
export function filterStyleString(style: string): string {
  const declarations: string[] = [];

  // Split on semicolons, handling edge cases with url() containing semicolons
  const parts = style.split(';');

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) continue;

    const property = trimmed.substring(0, colonIndex).trim().toLowerCase();
    let value = trimmed.substring(colonIndex + 1).trim();

    // Skip CSS variables
    if (property.startsWith('--')) continue;

    // Skip values that use CSS variables
    if (value.includes('var(')) continue;

    // Strip background-image and gradient values even if property is 'background'
    if (property === 'background' || property === 'background-image') {
      if (
        value.includes('url(') ||
        value.includes('gradient(') ||
        value.includes('image(')
      ) {
        continue;
      }
    }

    if (ALLOWED_CSS_PROPERTIES.has(property)) {
      declarations.push(`${property}: ${value}`);
    }
  }

  return declarations.join('; ');
}

/**
 * Convert heading tags (<h1>–<h6>) to <p> with explicit font-size and font-weight.
 * Gmail supports <h1>–<h6> but they produce browser-default sizing which doesn't
 * match what Gmail's own compose toolbar generates. Converting to <p> with inline
 * styles produces output consistent with Gmail's native font-size picker.
 */
const HEADING_SIZES: Record<string, string> = {
  h1: '22px',
  h2: '18px',
  h3: '16px',
  h4: '14px',
  h5: '13px',
  h6: '12px',
};

export function convertHeadingsToParagraphs($: CheerioAPI): void {
  // Keep heading tags (<h1>–<h6>) instead of converting to <p>. Gmail's
  // compose preserves native heading elements when pasted via public.html,
  // but strips inline font-size from <p> tags. We still add inline font-size
  // + font-weight as a fallback for email clients that reset heading styles.
  for (const [tag, size] of Object.entries(HEADING_SIZES)) {
    $(tag).each(function () {
      const el = $(this);
      const existingStyle = el.attr('style') || '';
      const newStyle = `font-size: ${size}; font-weight: bold${existingStyle ? '; ' + existingStyle : ''}`;
      el.attr('style', newStyle);
    });
  }
}

/**
 * Remove empty inline elements (empty spans, divs with no content).
 */
export function cleanupEmptyElements($: CheerioAPI): void {
  let found = true;
  while (found) {
    found = false;
    $('span, font').each(function () {
      const el = $(this);
      const contents = el.contents();
      if (contents.length === 0) {
        el.remove();
        found = true;
        return false;
      }
    });
  }
}
