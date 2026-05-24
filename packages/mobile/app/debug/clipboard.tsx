/**
 * Debug route — reads UIPasteboard's type identifiers and renders them in
 * a single text node Maestro can assert against. Used by the Maestro
 * clipboard-format flow to verify `com.apple.webarchive` lands on the
 * pasteboard after a Copy (the marker that distinguishes a working
 * binary from a v1.1.0-class regression where the native module is
 * missing from the prebuild).
 *
 * Gated by __DEV__ || EXPO_PUBLIC_DEBUG_CLIPBOARD === '1':
 *   - dev / Metro builds: always accessible
 *   - preview EAS profile: set EXPO_PUBLIC_DEBUG_CLIPBOARD=1 in eas.json
 *     to opt the build in
 *   - production EAS profile: route renders a "disabled" placeholder so a
 *     curious user typing /debug/clipboard into a deep link can't dump
 *     pasteboard contents
 */
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';

import { getAvailableClipboardTypes } from '@/native/html-clipboard';

const DEBUG_ENABLED =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).__DEV__ ||
  process.env.EXPO_PUBLIC_DEBUG_CLIPBOARD === '1';

export default function ClipboardDebug() {
  const router = useRouter();
  const [types, setTypes] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const result = await getAvailableClipboardTypes();
      setTypes(result);
    } catch (e) {
      setError(String(e));
    }
  }, []);

  useEffect(() => {
    if (DEBUG_ENABLED) refresh();
  }, [refresh]);

  /* istanbul ignore next — DEBUG_ENABLED is evaluated at module load
     so its false branch can't be exercised in the Jest run that also
     covers the true branch (resetModules tears down React). Verified
     by inspection: shipping production builds render the disabled
     placeholder; Maestro doesn't depend on it. */
  if (!DEBUG_ENABLED) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Debug — disabled' }} />
        <Text style={styles.text} testID="clipboard-debug-disabled">
          Disabled in production builds.
        </Text>
      </View>
    );
  }

  // Single comma-joined string makes Maestro substring matching trivial:
  //   assertVisible: "com.apple.webarchive"
  const typesText =
    types === null
      ? 'null — native module missing or non-iOS'
      : types.join(', ');

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Clipboard types' }} />
      <Text style={styles.heading}>UIPasteboard types</Text>
      <Text style={styles.text} testID="clipboard-types">
        {typesText}
      </Text>
      {error ? (
        <Text style={styles.error} testID="clipboard-debug-error">
          {error}
        </Text>
      ) : null}
      <TouchableOpacity
        onPress={refresh}
        style={styles.button}
        testID="clipboard-debug-refresh">
        <Text style={styles.buttonText}>Refresh</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.back()}
        style={[styles.button, styles.secondary]}
        testID="clipboard-debug-back">
        <Text style={styles.buttonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 12,
    backgroundColor: '#000',
  },
  heading: { color: '#fff', fontSize: 18, fontWeight: '600' },
  text: { color: '#e8eaed', fontSize: 14, fontFamily: 'Menlo' },
  error: { color: '#ff8a80', fontSize: 12 },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondary: { backgroundColor: '#3a3a3c' },
  buttonText: { color: '#fff', fontWeight: '600' },
});
