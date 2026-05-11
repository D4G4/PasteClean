import { load } from 'cheerio';
import { inlineCss } from './inline-styles.js';
import {
  stripUnsafeElements,
  unwrapUnknownElements,
  stripUnsafeAttributes,
  whitelistCssProperties,
  convertHeadingsToParagraphs,
  cleanupEmptyElements,
} from './strip-unsafe.js';
import { fixDarkModeColors } from './dark-mode-fix.js';
import { convertMarkdownToHtml } from './markdown.js';
import {
  normalizeFonts,
  fixImages,
  normalizeLists,
  normalizeBlockquotes,
  stripBrokenFlex,
  checkEmailSize,
} from './gmail-normalize.js';
import { generateReport } from './report.js';
import type { SanitizeReport } from './report.js';
import type { SizeWarning } from './gmail-normalize.js';

export interface SanitizeOptions {
  /** Force all text to this color when contrast fails. Default: '#000000' */
  forceTextColor?: string;
  /** Force container backgrounds to this color. Default: '#ffffff' */
  forceBackgroundColor?: string;
  /** Keep <img> elements. Default: true */
  preserveImages?: boolean;
  /** Remove elements that have no content. Default: true */
  stripEmptyElements?: boolean;
  /** Convert markdown syntax to HTML before sanitizing. Default: true */
  convertMarkdown?: boolean;
}

/**
 * Transform arbitrary HTML into Gmail-compatible inline-styled HTML.
 *
 * Pipeline:
 *  0. Convert markdown to HTML (if present)
 *  1. Inline CSS (juice) — convert <style> blocks + classes to inline styles
 *  2. Parse with cheerio
 *  3. Strip unsafe elements (script, style, iframe, etc.)
 *  4. Unwrap unknown elements (section, article, etc. → keep children)
 *  5. Convert headings to <p> with inline font-size
 *  6. Strip broken flex layouts (display:flex → display:block)
 *  7. Whitelist CSS properties (remove anything Gmail won't render)
 *  8. Strip unsafe attributes (class, id, data-*, event handlers)
 *  9. Normalize fonts to Gmail-safe stacks
 * 10. Fix dark mode colors (WCAG contrast-ratio-based)
 * 11. Fix images (display:block to remove descender gap)
 * 12. Normalize lists (consistent indentation)
 * 13. Normalize blockquotes (Gmail-native left border style)
 * 14. Clean up empty elements
 * 15. Serialize
 */
export function sanitizeForGmail(
  html: string,
  options: SanitizeOptions = {},
): string {
  const {
    preserveImages = true,
    stripEmptyElements: shouldStripEmpty = true,
    convertMarkdown = true,
  } = options;

  // Step 0: Convert markdown to HTML (if present)
  let processed = convertMarkdown ? convertMarkdownToHtml(html) : html;

  // Step 1: Inline CSS before we parse with cheerio
  processed = inlineCss(processed);

  // Step 2: Parse
  const $ = load(processed);

  // Step 3: Strip unsafe elements
  stripUnsafeElements($);

  // Optionally strip images
  if (!preserveImages) {
    $('img').remove();
  }

  // Step 4: Unwrap unknown elements (section → div-like behavior)
  unwrapUnknownElements($);

  // Step 5: Convert headings to paragraphs with inline font-size
  convertHeadingsToParagraphs($);

  // Step 6: Strip broken flex layouts
  stripBrokenFlex($);

  // Step 7: Whitelist CSS properties
  whitelistCssProperties($);

  // Step 8: Strip unsafe attributes
  stripUnsafeAttributes($);

  // Step 9: Normalize fonts to Gmail-safe stacks
  normalizeFonts($);

  // Step 10: Fix dark mode colors
  fixDarkModeColors($);

  // Step 11: Fix images
  if (preserveImages) {
    fixImages($);
  }

  // Step 12: Normalize lists
  normalizeLists($);

  // Step 13: Normalize blockquotes
  normalizeBlockquotes($);

  // Step 14: Clean up empty elements
  if (shouldStripEmpty) {
    cleanupEmptyElements($);
  }

  // Step 15: Serialize
  const body = $('body');
  const output = body.length > 0 ? body.html() : $.html();

  return (output || '').trim();
}

export interface SanitizeResult {
  /** The sanitized Gmail-safe HTML */
  html: string;
  /** Report of what was changed */
  report: SanitizeReport;
  /** Size warning if email approaches Gmail's 102KB clip limit */
  sizeWarning: SizeWarning;
}

/**
 * Same as sanitizeForGmail but also returns a report of what was fixed
 * and a size warning if the email is approaching Gmail's 102KB clip limit.
 */
export function sanitizeForGmailWithReport(
  html: string,
  options: SanitizeOptions = {},
): SanitizeResult {
  const sanitized = sanitizeForGmail(html, options);
  const report = generateReport(html, sanitized);
  const sizeWarning = checkEmailSize(sanitized);
  return { html: sanitized, report, sizeWarning };
}
