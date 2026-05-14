/**
 * Convert common Markdown syntax to HTML.
 *
 * This runs as a pre-processing step BEFORE the HTML sanitizer pipeline.
 * It handles mixed content — if the input is already HTML, markdown fragments
 * embedded in text nodes are still converted.
 *
 * Supported syntax:
 *   [text](url)        → <a href="url">text</a>
 *   **bold**           → <strong>bold</strong>
 *   *italic*           → <em>italic</em>
 *   ~~strikethrough~~  → <s>strikethrough</s>
 *   `code`             → <code>code</code>
 *   - list item        → <ul><li>list item</li></ul>
 *   1. list item       → <ol><li>list item</li></ol>
 *   > blockquote       → <blockquote>blockquote</blockquote>
 *   # Heading          → <h1>Heading</h1> (## → h2, ### → h3)
 */
export function convertMarkdownToHtml(input: string): string {
  // Don't process if input looks like it's already fully HTML
  // (starts with a tag and has no obvious markdown)
  if (/^\s*<[a-z][\s\S]*>/i.test(input) && !containsMarkdown(input)) {
    return input;
  }

  let result = input;

  // Process block-level elements first (line-by-line)
  result = processBlockElements(result);

  // Then inline elements
  result = processInlineElements(result);

  return result;
}

/**
 * Quick check: does the string contain obvious markdown syntax?
 */
function containsMarkdown(input: string): boolean {
  return /\[.+?\]\(.+?\)|\*\*.+?\*\*|\*[^*]+\*|~~.+?~~|^#{1,6}\s|^>\s|^[-*]\s|^\d+\.\s/m.test(input);
}

/**
 * Convert block-level markdown (headings, lists, blockquotes) to HTML.
 */
function processBlockElements(input: string): string {
  const lines = input.split('\n');
  const output: string[] = [];
  let inUl = false;
  let inOl = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Close open lists if this line isn't a list item
    const isUnorderedItem = /^[\s]*[-*+]\s+/.test(line);
    const isOrderedItem = /^[\s]*\d+\.\s+/.test(line);

    if (inUl && !isUnorderedItem) {
      output.push('</ul>');
      inUl = false;
    }
    if (inOl && !isOrderedItem) {
      output.push('</ol>');
      inOl = false;
    }

    // Headings: # Heading → <h1>
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      output.push(`<h${level}>${headingMatch[2].trim()}</h${level}>`);
      continue;
    }

    // Blockquote: > text → <blockquote>
    const quoteMatch = line.match(/^>\s+(.+)$/);
    if (quoteMatch) {
      output.push(`<blockquote>${quoteMatch[1].trim()}</blockquote>`);
      continue;
    }

    // Unordered list: - item or * item
    if (isUnorderedItem) {
      if (!inUl) {
        output.push('<ul>');
        inUl = true;
      }
      const content = line.replace(/^[\s]*[-*+]\s+/, '');
      output.push(`<li>${content}</li>`);
      continue;
    }

    // Ordered list: 1. item
    if (isOrderedItem) {
      if (!inOl) {
        output.push('<ol>');
        inOl = true;
      }
      const content = line.replace(/^[\s]*\d+\.\s+/, '');
      output.push(`<li>${content}</li>`);
      continue;
    }

    // Horizontal rule: --- or ***
    if (/^[-*_]{3,}\s*$/.test(line)) {
      output.push('<hr>');
      continue;
    }

    // Regular line — wrap in <p> if it's not already HTML and not empty
    if (line.trim() && !line.trim().startsWith('<')) {
      output.push(`<p>${line}</p>`);
    } else {
      output.push(line);
    }
  }

  // Close any open lists
  if (inUl) output.push('</ul>');
  if (inOl) output.push('</ol>');

  return output.join('\n');
}

/**
 * Convert inline markdown (links, bold, italic, code, strikethrough) to HTML.
 */
function processInlineElements(input: string): string {
  let result = input;

  // Links: [text](url) → <a href="url">text</a>
  //
  // url matches three forms (in priority order):
  //   1. http://… or https://… — used verbatim as href
  //   2. www.example.com[/path] — prepended with http://
  //   3. bare domain like example.com[/path] — prepended with http://
  //
  // The bare-domain branch requires a "name.tld" shape where the TLD is
  // 2+ letters. That avoids false positives like [Step 1](click here):
  // "click here" has no dot+TLD so it's left alone. URLs without a recognized
  // shape are not converted — the literal markdown is preserved instead of
  // producing a broken link.
  result = result.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+|www\.[^\s)]+|[a-z0-9][a-z0-9-]*\.[a-z]{2,}[^\s)]*)\)/gi,
    (_match: string, text: string, url: string) => {
      const href = /^https?:\/\//i.test(url) ? url : `http://${url}`;
      return `<a href="${href}">${text}</a>`;
    },
  );

  // Bold: **text** → <strong>text</strong>
  result = result.replace(
    /\*\*([^*]+)\*\*/g,
    '<strong>$1</strong>',
  );

  // Italic: *text* → <em>text</em>  (but not ** which is bold)
  result = result.replace(
    /(?<!\*)\*([^*]+)\*(?!\*)/g,
    '<em>$1</em>',
  );

  // Strikethrough: ~~text~~ → <s>text</s>
  result = result.replace(
    /~~([^~]+)~~/g,
    '<s>$1</s>',
  );

  // Inline code: `code` → <code>code</code>
  result = result.replace(
    /`([^`]+)`/g,
    '<code>$1</code>',
  );

  return result;
}
