import { describe, it, expect } from 'vitest';
import { sanitizeForGmail, sanitizeForGmailWithReport } from '../sanitizer.js';

describe('sanitizeForGmail', () => {
  describe('unsafe element removal', () => {
    it('strips <script> tags', () => {
      const result = sanitizeForGmail('<p>Hello</p><script>alert("xss")</script>');
      expect(result).not.toContain('<script');
      expect(result).toContain('Hello');
    });

    it('strips <style> tags (after juice inlines them)', () => {
      const result = sanitizeForGmail('<style>.red { color: red; }</style><p class="red">Hi</p>');
      expect(result).not.toContain('<style');
    });

    it('strips <iframe> tags', () => {
      const result = sanitizeForGmail('<p>Hi</p><iframe src="https://evil.com"></iframe>');
      expect(result).not.toContain('<iframe');
    });

    it('strips <svg> tags', () => {
      const result = sanitizeForGmail('<p>Hi</p><svg><circle r="10"/></svg>');
      expect(result).not.toContain('<svg');
      expect(result).not.toContain('<circle');
    });

    it('strips <form> and <input> tags (entire subtree removed)', () => {
      const result = sanitizeForGmail('<p>Before</p><form><input type="text"/><p>Inside form</p></form><p>After</p>');
      expect(result).not.toContain('<form');
      expect(result).not.toContain('<input');
      expect(result).not.toContain('Inside form');
      expect(result).toContain('Before');
      expect(result).toContain('After');
    });
  });

  describe('unknown element unwrapping', () => {
    it('unwraps <section> to keep its children', () => {
      const result = sanitizeForGmail('<section><p>Inside section</p></section>');
      expect(result).not.toContain('<section');
      expect(result).toContain('<p');
      expect(result).toContain('Inside section');
    });

    it('unwraps <article> to keep its children', () => {
      const result = sanitizeForGmail('<article><h1>Title</h1><p>Body</p></article>');
      expect(result).not.toContain('<article');
      expect(result).toContain('Title');
      expect(result).toContain('Body');
      expect(result).toContain('font-weight: bold'); // h1 converted to bold p
    });

    it('unwraps nested unknown elements', () => {
      const result = sanitizeForGmail('<main><section><p>Deep</p></section></main>');
      expect(result).not.toContain('<main');
      expect(result).not.toContain('<section');
      expect(result).toContain('Deep');
    });
  });

  describe('CSS property whitelisting', () => {
    it('keeps allowed properties like color and font-size', () => {
      const result = sanitizeForGmail('<p style="color: red; font-size: 14px;">Text</p>');
      expect(result).toContain('color: red');
      expect(result).toContain('font-size: 14px');
    });

    it('strips position property', () => {
      const result = sanitizeForGmail('<div style="position: absolute; top: 10px; color: blue;">Text</div>');
      expect(result).not.toContain('position');
      expect(result).not.toContain('top:');
      expect(result).toContain('color:');
    });

    it('strips transform and animation', () => {
      const result = sanitizeForGmail('<div style="transform: rotate(45deg); animation: spin 1s;">Text</div>');
      expect(result).not.toContain('transform');
      expect(result).not.toContain('animation');
    });

    it('strips CSS variables', () => {
      const result = sanitizeForGmail('<div style="--my-color: red; color: var(--my-color);">Text</div>');
      expect(result).not.toContain('--my-color');
      expect(result).not.toContain('var(');
    });

    it('strips background-image with url()', () => {
      const result = sanitizeForGmail(
        '<div style="background-image: url(https://example.com/img.png); color: black;">Text</div>',
      );
      expect(result).not.toContain('background-image');
      expect(result).not.toContain('url(');
    });

    it('strips background with linear-gradient', () => {
      const result = sanitizeForGmail(
        '<div style="background: linear-gradient(to right, red, blue); color: black;">Text</div>',
      );
      expect(result).not.toContain('linear-gradient');
    });
  });

  describe('attribute stripping', () => {
    it('removes class attribute', () => {
      const result = sanitizeForGmail('<p class="dark-text" style="color: black;">Hi</p>');
      expect(result).not.toContain('class=');
    });

    it('removes id attribute', () => {
      const result = sanitizeForGmail('<p id="main-text">Hi</p>');
      expect(result).not.toContain('id=');
    });

    it('removes data-* attributes', () => {
      const result = sanitizeForGmail('<p data-theme="dark" data-id="123">Hi</p>');
      expect(result).not.toContain('data-');
    });

    it('removes onclick and other event handlers', () => {
      const result = sanitizeForGmail('<p onclick="alert(1)" onmouseover="hack()">Hi</p>');
      expect(result).not.toContain('onclick');
      expect(result).not.toContain('onmouseover');
    });

    it('preserves href on links', () => {
      const result = sanitizeForGmail('<a href="https://example.com">Link</a>');
      expect(result).toContain('href="https://example.com"');
    });

    it('preserves src and alt on images', () => {
      const result = sanitizeForGmail('<img src="https://example.com/photo.jpg" alt="Photo">');
      expect(result).toContain('src="https://example.com/photo.jpg"');
      expect(result).toContain('alt="Photo"');
    });
  });

  describe('CSS inlining from <style> blocks', () => {
    it('inlines class-based styles', () => {
      const html = `
        <style>.highlight { background-color: yellow; }</style>
        <p class="highlight">Important</p>
      `;
      const result = sanitizeForGmail(html);
      expect(result).toContain('background-color: yellow');
      expect(result).not.toContain('<style');
    });

    it('inlines multiple selectors', () => {
      const html = `
        <style>
          .bold { font-weight: bold; }
          .red { color: red; }
        </style>
        <p class="bold red">Styled</p>
      `;
      const result = sanitizeForGmail(html);
      expect(result).toContain('font-weight: bold');
    });
  });

  describe('dark mode color fixing', () => {
    it('darkens white text (dark-mode artifact)', () => {
      const result = sanitizeForGmail('<p style="color: #ffffff;">White text</p>');
      // White text on white bg has ~1:1 contrast — must be darkened
      expect(result).not.toContain('#ffffff');
      expect(result).not.toContain('#FFFFFF');
      expect(result).not.toContain('rgb(255, 255, 255)');
    });

    it('darkens very light gray text', () => {
      const result = sanitizeForGmail('<p style="color: #e0e0e0;">Light gray</p>');
      // #e0e0e0 has luminance ~0.75, contrast against white ~1.3:1
      expect(result).not.toContain('#e0e0e0');
    });

    it('preserves dark text that has good contrast', () => {
      const result = sanitizeForGmail('<p style="color: #333333;">Dark text</p>');
      // #333333 has high contrast against white — should be preserved
      expect(result).toContain('#333333');
    });

    it('preserves colored text with sufficient contrast', () => {
      const result = sanitizeForGmail('<p style="color: #0000ff;">Blue text</p>');
      // Blue has good contrast against white
      expect(result).toContain('#0000ff');
    });

    it('strips dark backgrounds', () => {
      const result = sanitizeForGmail(
        '<div style="background-color: #1a1a1a; color: #ffffff;"><p>Dark mode content</p></div>',
      );
      // Dark background should be stripped, text should be darkened
      expect(result).not.toContain('#1a1a1a');
    });

    it('preserves light backgrounds', () => {
      const result = sanitizeForGmail(
        '<div style="background-color: #f5f5f5; color: #000000;"><p>Light bg</p></div>',
      );
      expect(result).toContain('#f5f5f5');
    });

    it('adds explicit color to elements with no color set', () => {
      const result = sanitizeForGmail('<p>No color set</p>');
      expect(result).toContain('color: #000000');
    });

    it('handles rgb() color values', () => {
      const result = sanitizeForGmail('<p style="color: rgb(240, 240, 240);">Nearly white</p>');
      expect(result).not.toContain('rgb(240, 240, 240)');
    });

    it('handles rgba() color values', () => {
      const result = sanitizeForGmail('<p style="color: rgba(255, 255, 255, 0.9);">Transparent white</p>');
      expect(result).not.toContain('rgba(255, 255, 255');
    });
  });

  describe('real-world dark mode scenarios', () => {
    it('fixes typical dark-mode browser copy (white text on dark bg)', () => {
      const darkModePaste = `
        <div style="background-color: #1e1e1e; color: #d4d4d4;">
          <h2 style="color: #e0e0e0;">Meeting Notes</h2>
          <p style="color: #cccccc;">Please review the attached documents.</p>
          <ul>
            <li style="color: #bbbbbb;">Item 1</li>
            <li style="color: #bbbbbb;">Item 2</li>
          </ul>
        </div>
      `;
      const result = sanitizeForGmail(darkModePaste);

      // Dark background should be gone
      expect(result).not.toContain('#1e1e1e');

      // Light text colors should be darkened
      expect(result).not.toContain('#d4d4d4');
      expect(result).not.toContain('#e0e0e0');
      expect(result).not.toContain('#cccccc');
      expect(result).not.toContain('#bbbbbb');

      // Structure should be preserved (h2 converted to bold p)
      expect(result).toContain('font-weight: bold');
      expect(result).toContain('<li');
      expect(result).toContain('Meeting Notes');
    });

    it('fixes VS Code / code editor paste (dark theme)', () => {
      const codeEditorPaste = `
        <div style="background-color: #1e1e1e; font-family: 'Consolas', monospace;">
          <span style="color: #569cd6;">const</span>
          <span style="color: #9cdcfe;">name</span>
          <span style="color: #d4d4d4;">=</span>
          <span style="color: #ce9178;">"hello"</span>
        </div>
      `;
      const result = sanitizeForGmail(codeEditorPaste);

      // Dark background gone
      expect(result).not.toContain('#1e1e1e');
      // Structure preserved
      expect(result).toContain('<span');
      expect(result).toContain('name');
    });

    it('handles Notion dark mode paste', () => {
      const notionPaste = `
        <div style="background: rgb(25, 25, 25);">
          <p style="color: rgba(255, 255, 255, 0.81);">
            <strong style="color: rgba(255, 255, 255, 0.81);">Important:</strong>
            Check the deadline
          </p>
        </div>
      `;
      const result = sanitizeForGmail(notionPaste);

      expect(result).not.toContain('rgb(25, 25, 25)');
      expect(result).not.toContain('rgba(255, 255, 255');
      expect(result).toContain('Important');
      expect(result).toContain('deadline');
    });
  });

  describe('heading to paragraph conversion', () => {
    it('converts <h1> to <p> with font-weight: bold (font-size stripped — Gmail ignores it on paste)', () => {
      const result = sanitizeForGmail('<h1>Big Title</h1>');
      expect(result).not.toContain('<h1');
      expect(result).toContain('<p');
      expect(result).toContain('font-weight: bold');
      expect(result).not.toContain('font-size');
      expect(result).toContain('Big Title');
    });

    it('converts <h2> to <p> with bold', () => {
      const result = sanitizeForGmail('<h2>Subtitle</h2>');
      expect(result).not.toContain('<h2');
      expect(result).toContain('font-weight: bold');
    });

    it('converts <h3> to <p> with bold', () => {
      const result = sanitizeForGmail('<h3>Section</h3>');
      expect(result).not.toContain('<h3');
      expect(result).toContain('font-weight: bold');
    });

    it('preserves existing inline styles on headings', () => {
      const result = sanitizeForGmail('<h1 style="color: red;">Styled Title</h1>');
      expect(result).toContain('font-weight: bold');
      expect(result).toContain('color: red');
    });
  });

  describe('preserveImages option', () => {
    it('keeps images by default', () => {
      const result = sanitizeForGmail('<p><img src="photo.jpg" alt="Photo"></p>');
      expect(result).toContain('<img');
    });

    it('strips images when preserveImages is false', () => {
      const result = sanitizeForGmail('<p><img src="photo.jpg" alt="Photo"></p>', {
        preserveImages: false,
      });
      expect(result).not.toContain('<img');
    });
  });

  describe('link preservation', () => {
    it('preserves <a> tags with href', () => {
      const result = sanitizeForGmail('<p>Check <a href="https://example.com">this link</a> out</p>');
      expect(result).toContain('<a href="https://example.com"');
      expect(result).toContain('this link</a>');
    });

    it('preserves multiple links in the same paragraph', () => {
      const result = sanitizeForGmail(
        '<p>See <a href="https://a.com">link A</a> and <a href="https://b.com">link B</a></p>',
      );
      expect(result).toContain('href="https://a.com"');
      expect(result).toContain('href="https://b.com"');
    });

    it('preserves links from pasted HTML with inline styles', () => {
      const result = sanitizeForGmail(
        '<p>Visit <a href="https://example.com" style="color: #0066cc; text-decoration: underline;">our site</a></p>',
      );
      expect(result).toContain('href="https://example.com"');
      expect(result).toContain('our site');
    });

    it('preserves links nested inside styled elements', () => {
      const result = sanitizeForGmail(
        '<div style="background: #1a1a1a; color: #ffffff;"><p>Click <a href="https://example.com" style="color: #88ccff;">here</a></p></div>',
      );
      expect(result).toContain('href="https://example.com"');
      expect(result).toContain('here</a>');
    });
  });

  describe('markdown conversion', () => {
    it('converts markdown links [text](url) to <a> tags', () => {
      const result = sanitizeForGmail('Check out [this article](https://example.com) for details');
      expect(result).toContain('<a href="https://example.com"');
      expect(result).toContain('this article</a>');
    });

    it('accepts www.* URLs and prepends http://', () => {
      const result = sanitizeForGmail('See [the site](www.example.com) for details');
      expect(result).toContain('<a href="http://www.example.com"');
      expect(result).toContain('the site</a>');
    });

    it('accepts bare domains (example.com) and prepends http://', () => {
      const result = sanitizeForGmail('Check [the docs](example.com) please');
      expect(result).toContain('<a href="http://example.com"');
      expect(result).toContain('the docs</a>');
    });

    it('accepts bare domains with paths and queries', () => {
      const result = sanitizeForGmail(
        'See [docs](example.com/path?q=1) for more',
      );
      expect(result).toContain('<a href="http://example.com/path?q=1"');
      expect(result).toContain('docs</a>');
    });

    it('preserves an explicit https:// URL verbatim (no double-prefix)', () => {
      const result = sanitizeForGmail('[link](https://example.com/x)');
      expect(result).toContain('<a href="https://example.com/x"');
      expect(result).not.toContain('http://https://');
    });

    it('does not convert [text](non-url) — prevents false positives on plain text inside parens', () => {
      const result = sanitizeForGmail('See [Step 1](click here) below');
      expect(result).not.toContain('<a href');
      expect(result).toContain('[Step 1]');
    });

    it('does not convert mailto: or javascript: pseudo-URLs', () => {
      const mailto = sanitizeForGmail('[email me](mailto:foo@bar.com)');
      expect(mailto).not.toContain('<a href="mailto:');
      const js = sanitizeForGmail('[click](javascript:alert(1))');
      expect(js).not.toContain('<a href="javascript:');
    });

    it('converts **bold** to <strong>', () => {
      const result = sanitizeForGmail('This is **very important** text');
      expect(result).toContain('<strong>very important</strong>');
    });

    it('converts *italic* to <em>', () => {
      const result = sanitizeForGmail('This is *slightly emphasized* text');
      expect(result).toContain('<em>slightly emphasized</em>');
    });

    it('converts ~~strikethrough~~ to <s>', () => {
      const result = sanitizeForGmail('This is ~~no longer valid~~ text');
      expect(result).toContain('<s>no longer valid</s>');
    });

    it('converts `code` to <code>', () => {
      const result = sanitizeForGmail('Use the `sanitizeForGmail` function');
      expect(result).toContain('<code>sanitizeForGmail</code>');
    });

    it('converts markdown headings to bold paragraphs', () => {
      const result = sanitizeForGmail('# Big Title\n\nSome content');
      expect(result).toContain('font-weight: bold');
      expect(result).toContain('Big Title');
    });

    it('converts unordered lists', () => {
      const result = sanitizeForGmail('- Item one\n- Item two\n- Item three');
      expect(result).toContain('<ul');
      expect(result).toContain('<li');
      expect(result).toContain('Item one');
    });

    it('converts ordered lists', () => {
      const result = sanitizeForGmail('1. First\n2. Second\n3. Third');
      expect(result).toContain('<ol');
      expect(result).toContain('<li');
      expect(result).toContain('First');
    });

    it('handles mixed markdown and HTML', () => {
      const result = sanitizeForGmail('<p>Already HTML</p>\n\nBut **this** has [a link](https://example.com)');
      expect(result).toContain('Already HTML');
      expect(result).toContain('<strong>this</strong>');
      expect(result).toContain('href="https://example.com"');
    });

    it('does not convert markdown when option is disabled', () => {
      const result = sanitizeForGmail('Check [this](https://example.com)', { convertMarkdown: false });
      expect(result).not.toContain('<a href');
      expect(result).toContain('[this]');
    });

    it('leaves pure HTML untouched', () => {
      const html = '<div><p>Already <strong>formatted</strong></p></div>';
      const result = sanitizeForGmail(html);
      expect(result).toContain('<strong>formatted</strong>');
    });
  });

  describe('font normalization', () => {
    it('replaces web fonts with Gmail-safe stack', () => {
      const result = sanitizeForGmail('<p style="font-family: Inter, system-ui, sans-serif;">Text</p>');
      expect(result).toContain('Arial');
      expect(result).not.toContain('Inter');
      expect(result).not.toContain('system-ui');
    });

    it('preserves monospace intent for code', () => {
      const result = sanitizeForGmail('<code style="font-family: Consolas, Monaco, monospace;">code</code>');
      expect(result).toContain('Courier New');
      expect(result).toContain('monospace');
    });

    it('preserves serif intent', () => {
      const result = sanitizeForGmail('<p style="font-family: \'Playfair Display\', Georgia, serif;">Text</p>');
      expect(result).toContain('Georgia');
      expect(result).toContain('serif');
    });

    it('handles Notion paste fonts', () => {
      const result = sanitizeForGmail(
        '<div style="font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, \'Segoe UI\', sans-serif;">Notion text</div>',
      );
      expect(result).toContain('Arial');
      expect(result).not.toContain('ui-sans-serif');
      expect(result).not.toContain('BlinkMacSystemFont');
    });
  });

  describe('image fixes', () => {
    it('adds display:block to images to remove descender gap', () => {
      const result = sanitizeForGmail('<p><img src="photo.jpg" alt="Photo"></p>');
      expect(result).toContain('display: block');
    });

    it('adds max-width:100% for mobile rendering', () => {
      const result = sanitizeForGmail('<img src="photo.jpg">');
      expect(result).toContain('max-width: 100%');
    });
  });

  describe('list normalization', () => {
    it('adds consistent padding to unordered lists', () => {
      const result = sanitizeForGmail('<ul><li>Item</li></ul>');
      expect(result).toContain('padding-left: 24px');
    });

    it('adds consistent padding to ordered lists', () => {
      const result = sanitizeForGmail('<ol><li>First</li></ol>');
      expect(result).toContain('padding-left: 24px');
    });

    it('adds spacing to list items', () => {
      const result = sanitizeForGmail('<ul><li>Item one</li><li>Item two</li></ul>');
      expect(result).toContain('margin-bottom: 4px');
    });
  });

  describe('blockquote normalization', () => {
    it('adds Gmail-native left border style', () => {
      const result = sanitizeForGmail('<blockquote>A wise quote</blockquote>');
      expect(result).toContain('border-left: 3px solid #c0c0c0');
      expect(result).toContain('A wise quote');
    });

    it('adds padding and margin', () => {
      const result = sanitizeForGmail('<blockquote>Quote text</blockquote>');
      expect(result).toContain('padding: 8px 12px');
    });
  });

  describe('flex layout stripping', () => {
    it('converts display:flex to display:block', () => {
      const result = sanitizeForGmail(
        '<div style="display: flex; align-items: center; justify-content: space-between;">Content</div>',
      );
      expect(result).not.toContain('flex');
      expect(result).not.toContain('align-items');
      expect(result).not.toContain('justify-content');
      expect(result).toContain('display: block');
    });
  });

  describe('102KB size warning', () => {
    it('reports no warning for small emails', () => {
      const { sizeWarning } = sanitizeForGmailWithReport('<p>Short email</p>');
      expect(sizeWarning.willBeClipped).toBe(false);
      expect(sizeWarning.warning).toBeNull();
    });

    it('warns when approaching 102KB limit', () => {
      // Generate a large HTML string (96KB+)
      const bigContent = '<p>' + 'x'.repeat(97 * 1024) + '</p>';
      const { sizeWarning } = sanitizeForGmailWithReport(bigContent);
      expect(sizeWarning.warning).not.toBeNull();
    });
  });

  describe('edge cases', () => {
    it('handles empty input', () => {
      expect(sanitizeForGmail('')).toBe('');
    });

    it('handles plain text (no HTML)', () => {
      const result = sanitizeForGmail('Just some plain text');
      expect(result).toContain('Just some plain text');
    });

    it('handles deeply nested elements', () => {
      const result = sanitizeForGmail(
        '<div><div><div><div><p>Deep</p></div></div></div></div>',
      );
      expect(result).toContain('Deep');
    });

    it('handles elements with no style attribute', () => {
      const result = sanitizeForGmail('<p>No style</p>');
      expect(result).toContain('No style');
    });

    it('handles malformed CSS gracefully', () => {
      const result = sanitizeForGmail('<p style="color: ; font-size: px; : value;">Text</p>');
      expect(result).toContain('Text');
    });
  });
});
