import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useColorScheme } from '@/components/useColorScheme';
import { getColors, ACCENT_OPTIONS } from '@/constants/Colors';

interface AccentPickerProps {
  selected: string;
  onPick: (color: string) => void;
}

export default function AccentPicker({ selected, onPick }: AccentPickerProps) {
  const colorScheme = useColorScheme();
  const dark = colorScheme === 'dark';
  const colors = getColors(dark);

  return (
    <View style={styles.list}>
      {ACCENT_OPTIONS.map((opt) => {
        const isSelected = selected === opt.id;
        return (
          <TouchableOpacity
            key={opt.id}
            activeOpacity={0.7}
            onPress={() => onPick(opt.id)}
            style={[
              styles.button,
              {
                backgroundColor: dark ? colors.cardBg : '#fff',
                borderColor: isSelected ? opt.id : 'transparent',
              },
              isSelected && {
                shadowColor: opt.id,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.2,
                shadowRadius: 22,
                elevation: 6,
              },
              !isSelected && {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.06,
                shadowRadius: 4,
                elevation: 1,
              },
            ]}>
            {/* Color swatch */}
            <View style={[styles.swatch, { backgroundColor: opt.id }]} />

            {/* Name + subtitle */}
            <View style={styles.textColumn}>
              <Text style={[styles.name, { color: colors.fg }]}>{opt.name}</Text>
              <Text style={[styles.sub, { color: colors.fgMuted }]}>{opt.sub}</Text>
            </View>

            {/* Checkmark circle */}
            <View
              style={[
                styles.circle,
                isSelected
                  ? { backgroundColor: opt.id, borderColor: opt.id }
                  : { borderColor: colors.fgMuted },
              ]}>
              {isSelected && (
                <FontAwesome name="check" size={12} color="#fff" />
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
    marginHorizontal: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 2,
  },
  swatch: {
    width: 38,
    height: 38,
    borderRadius: 12,
  },
  textColumn: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
  },
  sub: {
    fontSize: 12,
    marginTop: 1,
  },
  circle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});
