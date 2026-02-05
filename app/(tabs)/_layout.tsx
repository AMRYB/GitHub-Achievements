import React from 'react';
import { Tabs } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { Platform } from 'react-native';
import { Trophy, LayoutDashboard, Zap, LucideIcon } from 'lucide-react-native';

function TabIcon({ Icon, focused, color }: { Icon: LucideIcon; focused: boolean; color: string }) {
  return <Icon size={24} color={color} style={{ opacity: focused ? 1 : 0.6 }} />;
}

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
          borderTopWidth: 1,
          height: Platform.OS === 'web' ? 60 : 85,
          paddingBottom: Platform.OS === 'web' ? 8 : 25,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Achievements',
          tabBarIcon: ({ focused, color }) => <TabIcon Icon={Trophy} focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ focused, color }) => <TabIcon Icon={LayoutDashboard} focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="actions"
        options={{
          title: 'Actions',
          tabBarIcon: ({ focused, color }) => <TabIcon Icon={Zap} focused={focused} color={color} />,
        }}
      />
    </Tabs>
  );
}
