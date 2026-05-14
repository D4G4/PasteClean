import React from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';

import FloatingNav from '@/components/FloatingNav';

export default function TabLayout() {
  // We hide the system tab bar entirely and render a single FloatingNav at
  // this layout level. The nav sits above the home indicator and hides
  // itself when the keyboard is up.
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
        }}>
        <Tabs.Screen name="index" />
        <Tabs.Screen name="templates" />
        <Tabs.Screen name="settings" />
      </Tabs>
      <FloatingNav />
    </View>
  );
}
