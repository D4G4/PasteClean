import type { CheerioAPI } from 'cheerio';

/**
 * Gmail-safe font stack. Gmail supports these reliably across all platforms.
 * Web fonts (@font-face) are stripped, and exotic font-family values fall back
 * unpredictably per device. Normalizing to a safe stack ensures the recipient
 * sees what the sender intended.
 */
const GMAIL_SAFE_FONTS = new Set([
  'arial',
  'helvetica',
  'sans-serif',
  'verdana',
  'georgia',
  'times new roman',
  'times',
  'serif',
  'courier new',
  'courier',
  'monospace',
  'tahoma',
  'trebuchet ms',
  'comic sans ms',
  'impact',
]);

const DEFAULT_FONT_STACK = 'Arial, Helvetica, sans-serif';

/**
 * Normalize font-family declarations to Gmail-safe fonts.
 *
 * When users paste from Notion (Inter), VS Code (Consolas), websites
 * (custom web fonts), etc., the font-family values are often fonts
 * the recipient won't have. Gmail falls back unpredictably.
 *
 * Strategy:
 * - Parse the font-family stack
 * - If any Gmail-safe font is in the stack, keep just the safe ones
 * - If no safe font is found, replace with the default safe stack
 * - Preserve monospace intent (code blocks)
 */
export function normalizeFonts($: CheerioAPI): void {
  $('[style]').each(function () {
    const el = $(this);
    const style = el.attr('style') || '';

    if (!style.includes('font-family') && !style.includes('font :')) return;

    const normalized = normalizeFontFamilyInStyle(style);
    el.attr('style', normalized);
  });

  // Also handle <font face="..."> attributes (legacy HTML)
  $('font[face]').each(function () {
    const el = $(this);
    const face = el.attr('face') || '';
    const safeFace = findSafeFont(face);
    if (safeFace) {
      el.attr('face', safeFace);
    } else {
      el.removeAttr('face');
    }
  });
}

function normalizeFontFamilyInStyle(style: string): string {
  const parts = style.split(';');
  const result: string[] = [];

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) {
      result.push(trimmed);
      continue;
    }

    const property = trimmed.substring(0, colonIndex).trim().toLowerCase();
    const value = trimmed.substring(colonIndex + 1).trim();

    if (property === 'font-family') {
      const safeStack = buildSafeFontStack(value);
      result.push(`font-family: ${safeStack}`);
    } else if (property === 'font') {
      // Font shorthand — try to extract and fix font-family at the end
      const safeFontShorthand = normalizeFontShorthand(value);
      result.push(`font: ${safeFontShorthand}`);
    } else {
      result.push(trimmed);
    }
  }

  return result.join('; ');
}

function buildSafeFontStack(fontFamily: string): string {
  const fonts = fontFamily.split(',').map(f => f.trim().replace(/['"]/g, '').toLowerCase());

  // Check if this is a monospace/code context
  const isMonospace = fonts.some(f => f === 'monospace' || f === 'courier' || f === 'courier new' || f === 'consolas' || f === 'monaco' || f === 'menlo');
  if (isMonospace) {
    return "'Courier New', Courier, monospace";
  }

  // Check if this is a serif context
  const isSerif = fonts.some(f => f === 'serif' || f === 'georgia' || f === 'times new roman' || f === 'times');
  if (isSerif) {
    return "Georgia, 'Times New Roman', Times, serif";
  }

  // Default: sans-serif
  return DEFAULT_FONT_STACK;
}

function normalizeFontShorthand(value: string): string {
  // Font shorthand: [style] [variant] [weight] [size][/line-height] family
  // We just need to replace the family portion at the end
  // Simple approach: find the last comma-separated group that looks like font names
  const parts = value.split(/\s+/);
  const familyStartIndex = parts.findIndex(p =>
    /[a-zA-Z]/.test(p) && !['normal', 'bold', 'bolder', 'lighter', 'italic', 'oblique', 'small-caps'].includes(p.toLowerCase()) && !/^\d/.test(p),
  );

  if (familyStartIndex === -1) return value;

  const beforeFamily = parts.slice(0, familyStartIndex).join(' ');
  const familyPart = parts.slice(familyStartIndex).join(' ');
  const safeFamily = buildSafeFontStack(familyPart);

  return beforeFamily ? `${beforeFamily} ${safeFamily}` : safeFamily;
}

function findSafeFont(face: string): string | null {
  const lower = face.toLowerCase().trim();
  if (GMAIL_SAFE_FONTS.has(lower)) return face;
  return null;
}

/**
 * Fix images for Gmail rendering.
 *
 * Gmail renders images as inline elements (HTML5 DOCTYPE), which adds
 * 3-5px of descender space below each image. Adding display:block fixes this.
 * Also ensures images have max-width for mobile rendering.
 */
export function fixImages($: CheerioAPI): void {
  $('img').each(function () {
    const el = $(this);
    const style = el.attr('style') || '';

    const additions: string[] = [];

    if (!style.includes('display')) {
      additions.push('display: block');
    }
    if (!style.includes('max-width')) {
      additions.push('max-width: 100%');
    }
    if (!style.includes('height')) {
      // Prevent distortion when max-width kicks in
      additions.push('height: auto');
    }

    if (additions.length > 0) {
      const newStyle = style ? `${style}; ${additions.join('; ')}` : additions.join('; ');
      el.attr('style', newStyle);
    }
  });
}

/**
 * Normalize bullet lists for Gmail.
 *
 * Gmail's webmail adds extra left indentation to <ul>/<ol> that other
 * clients don't. We add explicit margin and padding to ensure consistent
 * rendering across Gmail web, Gmail iOS, Gmail Android, and other clients.
 *
 * Also styles blockquotes to match Gmail's native quote style (left blue bar).
 */
export function normalizeLists($: CheerioAPI): void {
  $('ul, ol').each(function () {
    const el = $(this);
    const style = el.attr('style') || '';

    const additions: string[] = [];

    // Consistent left indentation across clients
    if (!style.includes('padding-left') && !style.includes('padding:')) {
      additions.push('padding-left: 24px');
    }
    if (!style.includes('margin-left') && !style.includes('margin:')) {
      additions.push('margin-left: 0');
    }
    if (!style.includes('margin-top') && !style.includes('margin:')) {
      additions.push('margin-top: 8px');
    }
    if (!style.includes('margin-bottom') && !style.includes('margin:')) {
      additions.push('margin-bottom: 8px');
    }

    if (additions.length > 0) {
      const newStyle = style ? `${style}; ${additions.join('; ')}` : additions.join('; ');
      el.attr('style', newStyle);
    }
  });

  // Ensure list items have consistent spacing
  $('li').each(function () {
    const el = $(this);
    const style = el.attr('style') || '';

    if (!style.includes('margin-bottom')) {
      const newStyle = style ? `${style}; margin-bottom: 4px` : 'margin-bottom: 4px';
      el.attr('style', newStyle);
    }
  });
}

/**
 * Style blockquotes to match Gmail's native quote rendering.
 *
 * Gmail's compose toolbar creates quotes with a left blue/gray border.
 * We replicate that style so blockquotes from other sources (Notion,
 * markdown, etc.) look native in Gmail.
 */
export function normalizeBlockquotes($: CheerioAPI): void {
  $('blockquote').each(function () {
    const el = $(this);
    const style = el.attr('style') || '';

    // Gmail's native blockquote style: left border, indented, gray text
    const gmailQuoteStyle = [
      'margin: 8px 0',
      'padding: 8px 12px',
      'border-left: 3px solid #c0c0c0',
      'color: #555555',
    ];

    // Only add styles that aren't already set
    const additions = gmailQuoteStyle.filter(decl => {
      const prop = decl.split(':')[0].trim();
      return !style.includes(prop);
    });

    if (additions.length > 0) {
      const newStyle = style ? `${style}; ${additions.join('; ')}` : additions.join('; ');
      el.attr('style', newStyle);
    }
  });
}

/**
 * Strip display:flex entirely — Gmail keeps `display: flex` but strips
 * all flex sub-properties (align-items, justify-content, flex-direction,
 * flex-wrap), making flex layouts broken. Better to remove it entirely
 * so the browser falls back to block display.
 */
export function stripBrokenFlex($: CheerioAPI): void {
  $('[style]').each(function () {
    const el = $(this);
    const style = el.attr('style') || '';

    if (!style.includes('flex')) return;

    const parts = style.split(';');
    const cleaned: string[] = [];

    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed) continue;

      const property = trimmed.substring(0, trimmed.indexOf(':')).trim().toLowerCase();

      // Strip all flex-related properties
      if (
        property === 'display' && trimmed.toLowerCase().includes('flex')
      ) {
        // Replace display:flex with display:block
        cleaned.push('display: block');
        continue;
      }

      if (
        property.startsWith('flex') ||
        property === 'align-items' ||
        property === 'align-content' ||
        property === 'align-self' ||
        property === 'justify-content' ||
        property === 'justify-items' ||
        property === 'gap' ||
        property === 'row-gap' ||
        property === 'column-gap' ||
        property === 'order'
      ) {
        continue; // strip it
      }

      cleaned.push(trimmed);
    }

    el.attr('style', cleaned.join('; '));
  });
}

/**
 * Estimate the byte size of the HTML and return a warning if it
 * approaches Gmail's 102KB clipping threshold.
 */
export interface SizeWarning {
  sizeBytes: number;
  sizeKB: number;
  willBeClipped: boolean;
  warning: string | null;
}

export function checkEmailSize(html: string): SizeWarning {
  const sizeBytes = new TextEncoder().encode(html).length;
  const sizeKB = Math.round(sizeBytes / 1024);
  const willBeClipped = sizeBytes > 102 * 1024;

  let warning: string | null = null;
  if (willBeClipped) {
    warning = `Email is ${sizeKB}KB — Gmail will clip it at 102KB. Recipients will see "[Message clipped]" and may miss content.`;
  } else if (sizeBytes > 95 * 1024) {
    warning = `Email is ${sizeKB}KB — approaching Gmail's 102KB clip limit. Consider shortening.`;
  }

  return { sizeBytes, sizeKB, willBeClipped, warning };
}
