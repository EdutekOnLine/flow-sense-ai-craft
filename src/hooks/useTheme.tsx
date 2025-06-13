
import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeSettings, defaultThemeSettings } from '@/types/theme';
import { colorPalettes, borderRadiusValues, cardShadowValues } from '@/config/themes';

interface ThemeContextType {
  themeSettings: ThemeSettings;
  updateThemeSettings: (settings: Partial<ThemeSettings>) => void;
  resetTheme: () => void;
  availablePalettes: typeof colorPalettes;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'neuraflow-theme-settings';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultThemeSettings);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme) {
      try {
        const parsed = JSON.parse(savedTheme);
        setThemeSettings({ ...defaultThemeSettings, ...parsed });
      } catch (error) {
        console.error('Error parsing saved theme:', error);
      }
    }
  }, []);

  // Apply theme to CSS custom properties
  useEffect(() => {
    const applyTheme = () => {
      const root = document.documentElement;
      const palette = colorPalettes.find(p => p.id === themeSettings.colorPalette) || colorPalettes[0];
      
      console.log('🎨 Applying theme:', themeSettings.colorPalette, palette.name);
      
      // Apply color palette
      Object.entries(palette.colors).forEach(([key, value]) => {
        const cssProperty = `--${key}`;
        root.style.setProperty(cssProperty, value);
        console.log(`🎨 Setting ${cssProperty}: ${value}`);
      });

      // Apply border radius
      const radiusValue = borderRadiusValues[themeSettings.visualPreferences.borderRadius];
      root.style.setProperty('--radius', radiusValue);
      console.log('🎨 Setting border radius:', radiusValue);

      // Apply card shadows
      const shadowValue = cardShadowValues[themeSettings.visualPreferences.cardShadows];
      root.style.setProperty('--card-shadow', shadowValue);
      console.log('🎨 Setting card shadow:', shadowValue);

      // Apply animation preferences
      if (themeSettings.visualPreferences.animationStyle === 'reduced') {
        root.style.setProperty('--animation-duration', '0.1s');
        document.body.classList.add('reduce-motion');
      } else {
        root.style.setProperty('--animation-duration', '0.3s');
        document.body.classList.remove('reduce-motion');
      }

      // Apply dark mode class (for future dark mode support)
      if (themeSettings.isDarkMode) {
        document.body.classList.add('dark');
      } else {
        document.body.classList.remove('dark');
      }
      
      console.log('🎨 Theme application complete!');
    };

    applyTheme();
  }, [themeSettings]);

  const updateThemeSettings = (newSettings: Partial<ThemeSettings>) => {
    const updatedSettings = { ...themeSettings, ...newSettings };
    console.log('🎨 Updating theme settings:', updatedSettings);
    setThemeSettings(updatedSettings);
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(updatedSettings));
  };

  const resetTheme = () => {
    console.log('🎨 Resetting theme to default');
    setThemeSettings(defaultThemeSettings);
    localStorage.removeItem(THEME_STORAGE_KEY);
  };

  return (
    <ThemeContext.Provider
      value={{
        themeSettings,
        updateThemeSettings,
        resetTheme,
        availablePalettes: colorPalettes,
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
