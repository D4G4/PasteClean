// Use juice/client instead of juice to avoid Node.js fs/path dependencies.
// This makes the sanitizer portable to React Native and browser environments.
// @ts-expect-error juice/client has no type declarations
import juice from 'juice/client.js';

/**
 * Convert <style> blocks and class-based CSS into inline style="" attributes.
 * This must run BEFORE CSS property whitelisting, since juice resolves
 * selectors that cheerio can't see in inline styles alone.
 *
 * Note: juice silently drops pseudo-elements (::before), @media queries,
 * @keyframes, and other constructs it can't inline. This is acceptable —
 * Gmail wouldn't support them anyway.
 */
export function inlineCss(html: string): string {
  return juice(html, {
    // Don't remove the <style> tags — stripUnsafeElements handles that
    // after inlining, in case juice misses some selectors
    removeStyleTags: true,
    // Preserve !important by inlining it (Gmail ignores !important but
    // the value itself is still used)
    preserveImportant: true,
    // Don't add width/height attributes from CSS — let the whitelist filter handle it
    insertPreservedExtraCss: false,
    // Apply styles to elements with existing inline styles by merging
    applyStyleTags: true,
    applyAttributesTableElements: false,
  });
}
