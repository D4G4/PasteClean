/**
 * Unit tests for native/html-clipboard.ts. Two paths:
 *   - iOS + native HtmlClipboard module present → calls HtmlClipboard.setHtml
 *   - otherwise → falls back to expo-clipboard.setStringAsync(html, { HTML })
 *
 * jest.setup.js globally mocks @/native/html-clipboard to a no-op for tests
 * that consume the wrapper (useCopyForGmail etc.). Here we need the REAL
 * file, so we jest.unmock it and instead mock expo-clipboard + flip
 * Platform.OS / NativeModules.HtmlClipboard per test.
 */
jest.unmock('@/native/html-clipboard');

const mockSetStringAsync = jest.fn().mockResolvedValue(undefined);
jest.mock('expo-clipboard', () => ({
  setStringAsync: (...args) => mockSetStringAsync(...args),
  StringFormat: { HTML: 'html', PLAIN_TEXT: 'plainText' },
}));

import { NativeModules, Platform } from 'react-native';

const mockNativeSetHtml = jest.fn().mockResolvedValue(undefined);

beforeEach(() => {
  mockSetStringAsync.mockClear();
  mockNativeSetHtml.mockClear();
  // @ts-expect-error — test writes to the read-only-typed property
  delete NativeModules.HtmlClipboard;
});

async function importFresh() {
  let mod;
  jest.isolateModules(() => {
    mod = require('@/native/html-clipboard');
  });
  return mod;
}

describe('copyHtmlToClipboard', () => {
  it('iOS with native module present → calls HtmlClipboard.setHtml', async () => {
    Object.defineProperty(Platform, 'OS', { value: 'ios', configurable: true });
    // @ts-expect-error
    NativeModules.HtmlClipboard = { setHtml: mockNativeSetHtml };

    const { copyHtmlToClipboard } = await importFresh();
    await copyHtmlToClipboard('<p>hi</p>', 'hi');

    expect(mockNativeSetHtml).toHaveBeenCalledWith('<p>hi</p>', 'hi');
    expect(mockSetStringAsync).not.toHaveBeenCalled();
  });

  it('iOS without native module → falls back to expo-clipboard', async () => {
    // The EAS-built-without-our-Swift-module scenario that caused the
    // v1.1.0 regression. The fallback writes HTML via NSAttributedString
    // round-trip (which loses inline styles); the assertion here is that
    // we DO call the fallback, not that the result is good.
    Object.defineProperty(Platform, 'OS', { value: 'ios', configurable: true });

    const { copyHtmlToClipboard } = await importFresh();
    await copyHtmlToClipboard('<p>hi</p>', 'hi');

    expect(mockSetStringAsync).toHaveBeenCalledWith('<p>hi</p>', {
      inputFormat: 'html',
    });
    expect(mockNativeSetHtml).not.toHaveBeenCalled();
  });

  it('android → always falls back to expo-clipboard, even with module mocked', async () => {
    Object.defineProperty(Platform, 'OS', {
      value: 'android',
      configurable: true,
    });
    // @ts-expect-error
    NativeModules.HtmlClipboard = { setHtml: mockNativeSetHtml };

    const { copyHtmlToClipboard } = await importFresh();
    await copyHtmlToClipboard('<p>hi</p>', 'hi');

    expect(mockSetStringAsync).toHaveBeenCalled();
    expect(mockNativeSetHtml).not.toHaveBeenCalled();
  });

  it('web → falls back to expo-clipboard', async () => {
    Object.defineProperty(Platform, 'OS', { value: 'web', configurable: true });

    const { copyHtmlToClipboard } = await importFresh();
    await copyHtmlToClipboard('<p>hi</p>', 'hi');

    expect(mockSetStringAsync).toHaveBeenCalled();
  });
});

describe('getAvailableClipboardTypes', () => {
  it('iOS + native module → returns parsed type identifiers', async () => {
    Object.defineProperty(Platform, 'OS', { value: 'ios', configurable: true });
    // @ts-expect-error
    NativeModules.HtmlClipboard = {
      getAvailableTypes: () =>
        Promise.resolve(
          JSON.stringify([
            'com.apple.webarchive',
            'public.html',
            'public.utf8-plain-text',
          ]),
        ),
    };

    const { getAvailableClipboardTypes } = await importFresh();
    const types = await getAvailableClipboardTypes();
    expect(types).toEqual([
      'com.apple.webarchive',
      'public.html',
      'public.utf8-plain-text',
    ]);
  });

  it('iOS without native module → returns null (regression marker)', async () => {
    Object.defineProperty(Platform, 'OS', { value: 'ios', configurable: true });
    const { getAvailableClipboardTypes } = await importFresh();
    expect(await getAvailableClipboardTypes()).toBeNull();
  });

  it('android → returns null (no UIPasteboard equivalent)', async () => {
    Object.defineProperty(Platform, 'OS', {
      value: 'android',
      configurable: true,
    });
    const { getAvailableClipboardTypes } = await importFresh();
    expect(await getAvailableClipboardTypes()).toBeNull();
  });

  it('malformed native response (non-JSON) → returns null', async () => {
    Object.defineProperty(Platform, 'OS', { value: 'ios', configurable: true });
    // @ts-expect-error
    NativeModules.HtmlClipboard = {
      getAvailableTypes: () => Promise.resolve('not json {'),
    };

    const { getAvailableClipboardTypes } = await importFresh();
    expect(await getAvailableClipboardTypes()).toBeNull();
  });

  it('native response that is JSON but not an array → returns null', async () => {
    Object.defineProperty(Platform, 'OS', { value: 'ios', configurable: true });
    // @ts-expect-error
    NativeModules.HtmlClipboard = {
      getAvailableTypes: () => Promise.resolve('{"oops": true}'),
    };

    const { getAvailableClipboardTypes } = await importFresh();
    expect(await getAvailableClipboardTypes()).toBeNull();
  });
});
