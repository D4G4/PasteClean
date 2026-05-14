import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Pressable,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

// ────────────────────────────────────────
// Gmail Handoff Toast
// ────────────────────────────────────────

export interface GmailToastProps {
  visible: boolean;
  dark: boolean;
  accent: string;
  onDismiss: () => void;
  onOpenGmail: () => void;
  autoOpen: boolean;
  onAutoOpenChange: (value: boolean) => void;
}

export function GmailHandoffToast({
  visible,
  dark,
  accent,
  onDismiss,
  onOpenGmail,
  autoOpen,
  onAutoOpenChange,
}: GmailToastProps) {
  const slideAnim = useRef(new Animated.Value(200)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      timerRef.current = setTimeout(() => {
        onDismiss();
      }, 6000);
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 200,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible, slideAnim, opacityAnim, onDismiss]);

  if (!visible) return null;

  const toastBg = dark ? 'rgba(44,44,46,0.96)' : 'rgba(255,255,255,0.98)';
  const fg = dark ? '#FFFFFF' : '#1C1C1E';
  const fgMuted = dark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const notNowBg = dark ? 'rgba(120,120,128,0.24)' : 'rgba(120,120,128,0.16)';
  const sep = dark ? 'rgba(84,84,88,0.5)' : 'rgba(60,60,67,0.16)';

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          backgroundColor: toastBg,
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      {/* Header row */}
      <View style={styles.toastHeader}>
        <View style={styles.toastCheckCircle}>
          <FontAwesome name="check" size={16} color="#34C759" />
        </View>
        <View style={styles.toastTextColumn}>
          <Text style={[styles.toastTitle, { color: fg }]}>
            Copied — open Gmail?
          </Text>
          <Text style={[styles.toastSubtitle, { color: fgMuted }]}>
            Paste your sanitized email in the compose window.
          </Text>
        </View>
        <TouchableOpacity
          onPress={onDismiss}
          style={styles.toastCloseButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <FontAwesome name="times" size={16} color={fgMuted} />
        </TouchableOpacity>
      </View>

      {/* Action buttons */}
      <View style={styles.toastButtons}>
        <TouchableOpacity
          style={[styles.toastBtn, { backgroundColor: notNowBg }]}
          onPress={onDismiss}
          activeOpacity={0.7}
        >
          <Text style={[styles.toastBtnText, { color: fg }]}>Not now</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toastBtn, { backgroundColor: accent }]}
          onPress={onOpenGmail}
          activeOpacity={0.7}
        >
          <Text style={[styles.toastBtnText, { color: '#FFFFFF' }]}>
            Open Gmail
          </Text>
        </TouchableOpacity>
      </View>

      {/* Auto-open checkbox */}
      <Pressable
        style={[styles.toastCheckboxRow, { borderTopColor: sep }]}
        onPress={() => onAutoOpenChange(!autoOpen)}
      >
        <View
          style={[
            styles.toastCheckbox,
            {
              backgroundColor: autoOpen ? accent : 'transparent',
              borderColor: autoOpen ? accent : fgMuted,
            },
          ]}
        >
          {autoOpen && <FontAwesome name="check" size={10} color="#FFFFFF" />}
        </View>
        <Text style={[styles.toastCheckboxLabel, { color: fg }]}>
          Always copy + open Gmail
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 28,
    borderRadius: 18,
    paddingTop: 14,
    paddingHorizontal: 14,
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.22,
    shadowRadius: 40,
    elevation: 10,
  },
  toastHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  toastCheckCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#34c75922',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastTextColumn: {
    flex: 1,
  },
  toastTitle: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  toastSubtitle: {
    fontSize: 12.5,
    letterSpacing: -0.1,
  },
  toastCloseButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  toastBtn: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastBtnText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  toastCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 0.5,
  },
  toastCheckbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastCheckboxLabel: {
    fontSize: 12.5,
    letterSpacing: -0.1,
  },
});
