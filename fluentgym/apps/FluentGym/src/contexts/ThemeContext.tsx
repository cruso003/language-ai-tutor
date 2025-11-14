import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';

type ColorScheme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  colorScheme: 'light' | 'dark';
  themePreference: ColorScheme;
  setThemePreference: (theme: ColorScheme) => Promise<void>;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themePreference, setThemePreferenceState] = useState<ColorScheme>('system');

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await SecureStore.getItemAsync('themePreference');
      if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
        setThemePreferenceState(savedTheme);
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
    }
  };

  const setThemePreference = async (theme: ColorScheme) => {
    try {
      await SecureStore.setItemAsync('themePreference', theme);
      setThemePreferenceState(theme);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  const colorScheme = themePreference === 'system'
    ? (systemColorScheme || 'light')
    : themePreference;

  const isDark = colorScheme === 'dark';

  return (
    <ThemeContext.Provider
      value={{
        colorScheme,
        themePreference,
        setThemePreference,
        isDark,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
