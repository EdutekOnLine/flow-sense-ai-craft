
import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function ColorPaletteSelector() {
  const { themeSettings, updateThemeSettings, availablePalettes } = useTheme();
  const { t } = useTranslation();

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
            onClick={() => updateThemeSettings({ colorPalette: palette.id })}
          >
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{palette.name}</span>
                  {themeSettings.colorPalette === palette.id && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
                <div className="flex space-x-1">
                  <div
                    className="w-6 h-6 rounded-full border"
                    style={{ backgroundColor: `hsl(${palette.colors.primary})` }}
                  />
                  <div
                    className="w-6 h-6 rounded-full border"
                    style={{ backgroundColor: `hsl(${palette.colors.secondary})` }}
                  />
                  <div
                    className="w-6 h-6 rounded-full border"
                    style={{ backgroundColor: `hsl(${palette.colors.accent})` }}
                  />
                  <div
                    className="w-6 h-6 rounded-full border"
                    style={{ backgroundColor: `hsl(${palette.colors.muted})` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
