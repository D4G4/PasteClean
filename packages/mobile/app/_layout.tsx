import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useColorScheme } from '@/components/useColorScheme';
import { ThemeProvider as AccentThemeProvider, useTheme } from '@/contexts/ThemeContext';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  // GestureHandlerRootView MUST be at the very top — react-native-gesture-
  // handler attaches its native gesture recognizers to this view's UIView,
  // and any sheet/swipe using it has to be a descendant. BottomSheetModal-
  // Provider is what allows BottomSheetModal instances anywhere in the tree
  // to portal-render up to this provider.
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <RootLayoutNav />
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <AccentThemeProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <RootContent />
      </ThemeProvider>
    </AccentThemeProvider>
  );
}

function RootContent() {
  const { accent, setAccent, onboardingDone, setOnboardingDone } = useTheme();

  if (!onboardingDone) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <OnboardingFlow
          accent={accent}
          setAccent={setAccent}
          onDone={() => setOnboardingDone(true)}
        />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerLargeTitle: true,
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="preview"
        options={{
          presentation: 'transparentModal',
          headerShown: false,
          animation: 'none',
        }}
      />
    </Stack>
  );
}
