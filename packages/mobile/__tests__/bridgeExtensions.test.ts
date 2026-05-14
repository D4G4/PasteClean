/**
 * Contract tests for the TenTap bridge customization we ship.
 *
 * Why this exists: a future TenTap upgrade could rename bridges, drop the
 * `link` bridge name, or change how extension overrides are serialized.
 * Any of those would silently regress our link-insertion patch (the one
 * the user repeatedly hit), and a snapshot test wouldn't catch it because
 * the rendered tree wouldn't change. So we test the structure directly.
 *
 * Specifically, we verify:
 *   1. All the formatting bridges users see in the toolbar are still in our
 *      bridgeExtensions array — bold, italic, underline, strike, code,
 *      heading, bulletList, orderedList, taskList, blockquote, link.
 *      If TenTap renames one, this test breaks loudly.
 *   2. The `link` bridge specifically carries our `inclusive: false`
 *      override, so the link mark stops at the end of the inserted text
 *      and subsequent typing produces plain text.
 *
 * We re-derive the bridgeExtensions array the same way the editor screen
 * builds it. If the construction changes, this test changes alongside it.
 */
import {
  LinkBridge,
  TenTapStartKit,
} from '@10play/tentap-editor';

const bridgeExtensions = TenTapStartKit.map((ext) =>
  ext.name === 'link' ? LinkBridge.extendExtension({ inclusive: false }) : ext,
);

// Bridges users can toggle from the formatting toolbar. If TenTap drops or
// renames any of these, the toolbar button on-device would no-op silently —
// this test flips that into a CI failure.
const REQUIRED_BRIDGE_NAMES = [
  'bold',
  'italic',
  'underline',
  'strike',
  'code',
  'heading',
  'bulletList',
  'orderedList',
  'taskList',
  'blockquote',
  'link',
];

describe('mobile bridge extensions contract', () => {
  it('contains every bridge the formatting toolbar relies on', () => {
    const names = bridgeExtensions.map((b) => b.name);
    for (const required of REQUIRED_BRIDGE_NAMES) {
      expect(names).toContain(required);
    }
  });

  it("does not drop any bridge from TenTap's starter kit", () => {
    // Same length means our map() didn't accidentally filter or duplicate.
    expect(bridgeExtensions).toHaveLength(TenTapStartKit.length);
  });

  it('carries the inclusive:false override on the link bridge', () => {
    const link = bridgeExtensions.find((b) => b.name === 'link');
    expect(link).toBeDefined();
    // `extendExtension` stores the override on `.extendConfig`; the WebView
    // bundle reads this at editor mount and applies it to the TipTap link
    // extension via Extension.extend(). If TenTap renames this field, our
    // override silently stops applying — fail loudly here instead.
    expect(link?.extendConfig).toEqual({ inclusive: false });
  });

  it('leaves every other bridge unmodified (no extendConfig on non-link)', () => {
    for (const bridge of bridgeExtensions) {
      if (bridge.name === 'link') continue;
      expect(bridge.extendConfig).toBeUndefined();
    }
  });
});
