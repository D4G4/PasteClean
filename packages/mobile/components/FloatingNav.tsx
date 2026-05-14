import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Keyboard,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, usePathname } from 'expo-router';
import { BlurView } from 'expo-blur';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { useColorScheme } from '@/components/useColorScheme';
import { resolveAccent } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';

const ITEMS = [
  { icon: 'pencil' as const, route: '/' },
  { icon: 'bookmark' as const, route: '/templates' },
  { icon: 'cog' as const, route: '/settings' },
];

// iOS 26 "liquid glass" pill nav. The pill is a thick BlurView with a
// hairline highlight border and a faint inner overlay so it reads as
// translucent material, not flat color. Sits above the home indicator
// and hides itself when the keyboard is up.
export default function FloatingNav() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const dark = colorScheme === 'dark';
  const { accent } = useTheme();
  const a = resolveAccent(accent, dark);

  const [keyboardVisible, setKeyboardVisible] = useState(false);
  useEffect(() => {
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvt, () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvt, () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  if (keyboardVisible) return null;

  // Hairline border + faint tint overlay sit on top of the blur to give the
  // glass its edge highlight and a slight tone (warm in light, cool in dark).
  const borderColor = dark
    ? 'rgba(255,255,255,0.14)'
    : 'rgba(255,255,255,0.55)';
  const innerTint = dark
    ? 'rgba(255,255,255,0.04)'
    : 'rgba(255,255,255,0.18)';

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrap, { bottom: Math.max(8, insets.bottom + 8) }]}>
      <View style={[styles.shadowHost]}>
        <View style={styles.clip}>
          <BlurView
            intensity={Platform.OS === 'ios' ? 70 : 100}
            tint={dark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
          {/* Subtle inner tint — keeps the glass from going fully transparent
              over busy content. */}
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: innerTint },
            ]}
          />
          {/* Hairline highlight border. */}
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              styles.borderHighlight,
              { borderColor },
            ]}
          />

          <View style={styles.row}>
            {ITEMS.map(({ icon, route }) => {
              const isActive =
                pathname === route ||
                (route === '/' && (pathname === '/index' || pathname === '/'));
              return (
                <TouchableOpacity
                  key={icon}
                  onPress={() => {
                    if (!isActive) router.navigate(route as never);
                  }}
                  activeOpacity={0.6}
                  style={styles.btn}>
                  {isActive && (
                    // Glass-on-glass: a brighter inner capsule for the active
                    // item, plus its own thin border for the lensing effect.
                    <View
                      pointerEvents="none"
                      style={[
                        styles.activeChip,
                        {
                          backgroundColor: dark
                            ? 'rgba(255,255,255,0.14)'
                            : 'rgba(255,255,255,0.7)',
                          borderColor: dark
                            ? 'rgba(255,255,255,0.22)'
                            : 'rgba(255,255,255,0.95)',
                        },
                      ]}
                    />
                  )}
                  <FontAwesome
                    name={icon}
                    size={17}
                    color={
                      isActive
                        ? a
                        : dark
                          ? 'rgba(235,235,245,0.7)'
                          : 'rgba(60,60,67,0.7)'
                    }
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  // Shadow has to live outside the clipping container; iOS can't render a
  // shadow on a view with overflow: 'hidden'.
  shadowHost: {
    borderRadius: 26,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 10,
  },
  clip: {
    borderRadius: 26,
    overflow: 'hidden',
  },
  borderHighlight: {
    borderRadius: 26,
    borderWidth: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: 'row',
    gap: 4,
    padding: 5,
  },
  btn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeChip: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 21,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
