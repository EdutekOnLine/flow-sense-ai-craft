
import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Check, Palette } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function ColorPaletteSelector() {
  const { themeSettings, updateThemeSettings, availablePalettes } = useTheme();
  const { t } = useTranslation();

  const handlePaletteSelect = (paletteId: string) => {
    console.log('🎨 Selecting palette:', paletteId);
    updateThemeSettings({ colorPalette: paletteId });
  };

  // Group themes into categories for better organization
  const professionalThemes = availablePalettes.filter(p => 
    ['default', 'ocean', 'sunset', 'forest', 'purple', 'monochrome'].includes(p.id)
  );
  
  const colorfulThemes = availablePalettes.filter(p => 
    !['default', 'ocean', 'sunset', 'forest', 'purple', 'monochrome'].includes(p.id)
  );

  const ThemeGrid = ({ themes, title }: { themes: typeof availablePalettes, title: string }) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Palette className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {themes.map((palette) => (
          <Card
            key={palette.id}
            className={`cursor-pointer transition-all hover:shadow-card hover:scale-105 ${
              themeSettings.colorPalette === palette.id
                ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                : ''
            }`}
            onClick={() => handlePaletteSelect(palette.id)}
          >
            <CardContent className="p-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-xs text-foreground truncate">{palette.name}</span>
                  {themeSettings.colorPalette === palette.id && (
                    <Check className="h-3 w-3 text-primary flex-shrink-0" />
                  )}
                </div>
                {/* Main color preview */}
                <div className="flex space-x-1">
                  <div
                    className="w-4 h-4 rounded-full border border-border shadow-sm"
                    style={{ backgroundColor: `hsl(${palette.colors.primary})` }}
                    title="Primary"
                  />
                  <div
                    className="w-4 h-4 rounded-full border border-border shadow-sm"
                    style={{ backgroundColor: `hsl(${palette.colors.secondary})` }}
                    title="Secondary"
                  />
                  <div
                    className="w-4 h-4 rounded-full border border-border shadow-sm"
                    style={{ backgroundColor: `hsl(${palette.colors.accent})` }}
                    title="Accent"
                  />
                  <div
                    className="w-4 h-4 rounded-full border border-border shadow-sm"
                    style={{ backgroundColor: `hsl(${palette.colors.background})` }}
                    title="Background"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Label className="text-base font-semibold text-foreground">{t('settings.colorPalette')}</Label>
        <p className="text-sm text-muted-foreground mt-1">Choose from professional or vibrant colorful themes</p>
      </div>
      
      <ThemeGrid themes={professionalThemes} title="Professional Themes" />
      
      <div className="border-t border-border pt-4">
        <ThemeGrid themes={colorfulThemes} title="Colorful Themes" />
      </div>
      
      <div className="text-center pt-4">
        <p className="text-xs text-muted-foreground">
          {availablePalettes.length} themes available • Changes apply instantly
        </p>
      </div>
    </div>
  );
}
