import React from 'react';
import { Tabs } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { Platform, View } from 'react-native';
import { GithubHeader } from '@/components/GithubHeader';

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <GithubHeader />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' }, // Hides the bottom bar completely!
        }}
      >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="actions" />
    </Tabs>
    </View>
  );
}
