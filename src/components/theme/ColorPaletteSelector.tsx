
import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function ColorPaletteSelector() {
  const { themeSettings, updateThemeSettings, availablePalettes } = useTheme();
  const { t } = useTranslation();

  const handlePaletteSelect = (paletteId: string) => {
    console.log('Selecting palette:', paletteId);
    updateThemeSettings({ colorPalette: paletteId });
  };

  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold">{t('settings.colorPalette')}</Label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {availablePalettes.map((palette) => (
          <Card
            key={palette.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              themeSettings.colorPalette === palette.id
                ? 'ring-2 ring-primary ring-offset-2'
                : ''
            }`}
            onClick={() => handlePaletteSelect(palette.id)}
          >
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{palette.name}</span>
                  {themeSettings.colorPalette === palette.id && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
                {/* Color preview with actual HSL values */}
                <div className="flex space-x-1">
                  <div
                    className="w-6 h-6 rounded-full border-2 border-gray-200"
                    style={{ backgroundColor: `hsl(${palette.colors.primary})` }}
                    title="Primary"
                  />
                  <div
                    className="w-6 h-6 rounded-full border-2 border-gray-200"
                    style={{ backgroundColor: `hsl(${palette.colors.secondary})` }}
                    title="Secondary"
                  />
                  <div
                    className="w-6 h-6 rounded-full border-2 border-gray-200"
                    style={{ backgroundColor: `hsl(${palette.colors.accent})` }}
                    title="Accent"
                  />
                  <div
                    className="w-6 h-6 rounded-full border-2 border-gray-200"
                    style={{ backgroundColor: `hsl(${palette.colors.background})` }}
                    title="Background"
                  />
                </div>
                {/* Live preview section */}
                <div 
                  className="p-2 rounded border"
                  style={{ 
                    backgroundColor: `hsl(${palette.colors.background})`,
                    color: `hsl(${palette.colors.foreground})`,
                    borderColor: `hsl(${palette.colors.border})`
                  }}
                >
                  <div className="text-xs">Preview</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
