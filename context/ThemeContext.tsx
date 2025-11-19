import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import { Colors, ThemeColors, ColorScheme } from '@/constants/theme';
import * as storage from '@/services/storage';

interface ThemeContextType {
  colorScheme: ColorScheme;
  colors: ThemeColors;
  toggleTheme: () => void;
  setThemePreference: (pref: 'light' | 'dark' | 'system') => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  colorScheme: 'dark',
  colors: Colors.dark,
  toggleTheme: () => {},
  setThemePreference: () => {},
  isDark: true,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useSystemColorScheme();
  const [preference, setPreference] = useState<'light' | 'dark' | 'system'>('dark');

  useEffect(() => {
    storage.getTheme().then((saved) => {
      if (saved) setPreference(saved);
    });
  }, []);

  const colorScheme: ColorScheme =
    preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;

  const colors = Colors[colorScheme];
  const isDark = colorScheme === 'dark';

  const toggleTheme = () => {
    const next = isDark ? 'light' : 'dark';
    setPreference(next);
    storage.saveTheme(next);
  };

  const setThemePreference = (pref: 'light' | 'dark' | 'system') => {
    setPreference(pref);
    storage.saveTheme(pref);
  };

  return (
    <ThemeContext.Provider value={{ colorScheme, colors, toggleTheme, setThemePreference, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
