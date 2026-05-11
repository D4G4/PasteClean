import { load } from 'cheerio';
import { UNSAFE_ELEMENTS } from './whitelist.js';

export interface SanitizeReportItem {
  /** What category of fix was applied */
  category: 'dark-mode' | 'unsafe-element' | 'unsafe-css' | 'unsafe-attribute' | 'heading-convert' | 'color-added' | 'background-stripped';
  /** Human-readable description */
  description: string;
}

export interface SanitizeReport {
  /** Total number of fixes applied */
  totalFixes: number;
  /** Individual fix descriptions */
  items: SanitizeReportItem[];
  /** Quick summary: "clean" | "fixed" | "major-fixes" */
  status: 'clean' | 'fixed' | 'major-fixes';
}

/**
 * Compare original HTML with sanitized HTML and produce a human-readable
 * report of what changed. This runs AFTER sanitization — it doesn't modify
 * anything, just observes differences.
 */
export function generateReport(originalHtml: string, sanitizedHtml: string): SanitizeReport {
  const items: SanitizeReportItem[] = [];

  const $orig = load(originalHtml);
  const $clean = load(sanitizedHtml);

  // Check for removed unsafe elements
  for (const tag of UNSAFE_ELEMENTS) {
    const count = $orig(tag).length;
    if (count > 0) {
      items.push({
        category: 'unsafe-element',
        description: `Removed ${count} <${tag}> element${count > 1 ? 's' : ''}`,
      });
    }
  }

  // Check for dark backgrounds stripped
  const darkBgCount = countMatchesInStyles($orig, /background(?:-color)?:\s*(?:#[0-3][0-9a-f]{5}|rgb\(\s*[0-4]\d|rgb\(\s*[0-9],)/i);
  if (darkBgCount > 0) {
    items.push({
      category: 'background-stripped',
      description: `Stripped ${darkBgCount} dark background${darkBgCount > 1 ? 's' : ''} (Gmail renders on white)`,
    });
  }

  // Check for light text colors that were darkened
  const lightTextCount = countMatchesInStyles($orig, /(?:^|;\s*)color:\s*(?:#[c-f][0-9a-f]{5}|#[c-f]{3}|rgb\(\s*(?:1[8-9]\d|2\d\d))/i);
  if (lightTextCount > 0) {
    items.push({
      category: 'dark-mode',
      description: `Darkened ${lightTextCount} light text color${lightTextCount > 1 ? 's' : ''} (would be invisible on white)`,
    });
  }

  // Check for headings converted
  const headingTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  let headingCount = 0;
  for (const tag of headingTags) {
    headingCount += $orig(tag).length;
  }
  if (headingCount > 0) {
    items.push({
      category: 'heading-convert',
      description: `Converted ${headingCount} heading${headingCount > 1 ? 's' : ''} to Gmail-safe font sizes`,
    });
  }

  // Check for class/id attributes removed
  const classCount = $orig('[class]').length;
  const idCount = $orig('[id]').length;
  const attrTotal = classCount + idCount;
  if (attrTotal > 0) {
    items.push({
      category: 'unsafe-attribute',
      description: `Removed ${attrTotal} unsupported attribute${attrTotal > 1 ? 's' : ''} (class, id)`,
    });
  }

  // Check for <style> blocks inlined
  const styleBlockCount = $orig('style').length;
  if (styleBlockCount > 0) {
    items.push({
      category: 'unsafe-css',
      description: `Inlined ${styleBlockCount} CSS <style> block${styleBlockCount > 1 ? 's' : ''} (Gmail ignores them)`,
    });
  }

  // Check for explicit colors added (elements with no color in original that now have one)
  const origNoColor = countElementsWithoutColor($orig);
  const cleanWithColor = countElementsWithColor($clean);
  if (origNoColor > 0 && cleanWithColor > origNoColor) {
    const added = cleanWithColor - ($orig('[style*="color"]').length);
    if (added > 0) {
      items.push({
        category: 'color-added',
        description: `Added explicit color to ${added} element${added > 1 ? 's' : ''} (prevents Gmail dark mode inversion)`,
      });
    }
  }

  const totalFixes = items.length;
  let status: SanitizeReport['status'] = 'clean';
  if (totalFixes > 0 && totalFixes <= 3) status = 'fixed';
  if (totalFixes > 3) status = 'major-fixes';

  return { totalFixes, items, status };
}

function countMatchesInStyles($: ReturnType<typeof load>, pattern: RegExp): number {
  let count = 0;
  $('[style]').each(function () {
    const style = $(this).attr('style') || '';
    if (pattern.test(style)) count++;
  });
  return count;
}

function countElementsWithoutColor($: ReturnType<typeof load>): number {
  let count = 0;
  $('p, span, div, li, td, th, h1, h2, h3, h4, h5, h6, a, b, strong, em, i, u').each(function () {
    const style = $(this).attr('style') || '';
    if (!style.includes('color:') && !style.includes('color :')) {
      count++;
    }
  });
  return count;
}

function countElementsWithColor($: ReturnType<typeof load>): number {
  let count = 0;
  $('p, span, div, li, td, th, a, b, strong, em, i, u').each(function () {
    const style = $(this).attr('style') || '';
    if (style.includes('color:') || style.includes('color :')) {
      count++;
    }
  });
  return count;
}
