
import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function ThemeDebugger() {
  const { themeSettings, availablePalettes } = useTheme();

  const getCurrentPalette = () => {
    return availablePalettes.find(p => p.id === themeSettings.colorPalette);
  };

  const logCurrentTheme = () => {
    const root = document.documentElement;
    const palette = getCurrentPalette();
    
    console.log('Current Theme Settings:', themeSettings);
    console.log('Current Palette:', palette);
    
    // Log current CSS custom properties
    const cssVars = [
      'primary', 'secondary', 'accent', 'background', 'foreground', 
      'border', 'card', 'muted', 'radius', 'card-shadow'
    ];
    
    cssVars.forEach(varName => {
      const value = getComputedStyle(root).getPropertyValue(`--${varName}`);
      console.log(`--${varName}:`, value);
    });
  };

  const testColors = () => {
    const palette = getCurrentPalette();
    if (!palette) return [];
    
    return [
      { name: 'Primary', value: palette.colors.primary },
      { name: 'Secondary', value: palette.colors.secondary },
      { name: 'Accent', value: palette.colors.accent },
      { name: 'Background', value: palette.colors.background },
      { name: 'Foreground', value: palette.colors.foreground },
    ];
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-sm">Theme Debugger</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-xs">
          <div>Active Palette: {themeSettings.colorPalette}</div>
          <div>Border Radius: {themeSettings.visualPreferences.borderRadius}</div>
          <div>Card Shadows: {themeSettings.visualPreferences.cardShadows}</div>
        </div>
        
        <div className="grid grid-cols-5 gap-2">
          {testColors().map(color => (
            <div key={color.name} className="text-center">
              <div 
                className="w-8 h-8 rounded border mx-auto mb-1"
                style={{ backgroundColor: `hsl(${color.value})` }}
              />
              <div className="text-xs">{color.name}</div>
            </div>
          ))}
        </div>
        
        <Button onClick={logCurrentTheme} size="sm" variant="outline">
          Log Theme to Console
        </Button>
      </CardContent>
    </Card>
  );
}
