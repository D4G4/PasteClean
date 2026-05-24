/**
 * useColorScheme has two trivial implementations (native re-export, web
 * hard-coded 'light'). Importing each at least pulls them through the
 * coverage report — neither has runtime branches worth deep testing.
 */
import { useColorScheme as useColorSchemeWeb } from '@/components/useColorScheme.web';
import { useColorScheme as useColorSchemeNative } from '@/components/useColorScheme';

describe('useColorScheme', () => {
  it('web build returns "light" deterministically', () => {
    expect(useColorSchemeWeb()).toBe('light');
  });

  it('native build is a function (re-exported from react-native)', () => {
    expect(typeof useColorSchemeNative).toBe('function');
  });
});
