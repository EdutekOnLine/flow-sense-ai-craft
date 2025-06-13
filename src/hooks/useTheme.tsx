
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

  // Apply theme to CSS custom properties with force update
  useEffect(() => {
    const applyTheme = () => {
      const root = document.documentElement;
      const palette = colorPalettes.find(p => p.id === themeSettings.colorPalette) || colorPalettes[0];
      
      console.log('🎨 Applying theme:', themeSettings.colorPalette, palette.name);
      
      // Remove any existing theme classes
      document.body.classList.remove('theme-applied');
      
      // Apply color palette with proper HSL format and force update
      Object.entries(palette.colors).forEach(([key, value]) => {
        const cssProperty = `--${key}`;
        root.style.setProperty(cssProperty, value);
        console.log(`🎨 Setting ${cssProperty}: ${value}`);
      });

      // Apply border radius with force
      const radiusValue = borderRadiusValues[themeSettings.visualPreferences.borderRadius];
      root.style.setProperty('--radius', radiusValue);
      console.log('🎨 Setting border radius:', radiusValue);

      // Apply card shadows with force
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

      // Add theme-applied class and force a repaint
      document.body.classList.add('theme-applied');
      
      // Force immediate visual update by toggling body styles
      const originalDisplay = document.body.style.display;
      document.body.style.display = 'none';
      document.body.offsetHeight; // Trigger reflow
      document.body.style.display = originalDisplay;
      
      // Additional force update for stubborn elements
      setTimeout(() => {
        const allElements = document.querySelectorAll('*');
        allElements.forEach(el => {
          if (el instanceof HTMLElement) {
            el.style.cssText = el.style.cssText;
          }
        });
      }, 100);
      
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
