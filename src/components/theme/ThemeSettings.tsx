
import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ColorPaletteSelector } from './ColorPaletteSelector';
import { VisualPreferences } from './VisualPreferences';
import { useTranslation } from 'react-i18next';
import { Palette, Settings, RotateCcw } from 'lucide-react';
import { getRTLAwareTextAlign } from '@/utils/rtl';

export function ThemeSettings() {
  const { resetTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      {/* Header - using semantic colors only */}
      <div className="relative bg-gradient-theme-primary border border-border rounded-xl p-8">
        <div className="absolute inset-0 bg-gradient-theme-primary rounded-xl"></div>
        <div className="relative">
          <div className={`flex items-start justify-between gap-4`}>
            <div className={`flex items-start gap-4 ${getRTLAwareTextAlign('start')}`}>
              <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-card">
                <Palette className="h-8 w-8 text-primary-foreground" />
              </div>
              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-foreground">{t('settings.appearance')}</h1>
                <p className="text-lg text-muted-foreground">{t('settings.appearanceDescription')}</p>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                    {t('settings.personalCustomization')}
                  </span>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={resetTheme}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              {t('settings.resetToDefault')}
            </Button>
          </div>
        </div>
      </div>

      {/* Color Palette Section - using semantic colors */}
      <Card className="bg-gradient-theme-secondary border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-foreground">
            <Palette className="h-5 w-5" />
            {t('settings.colorThemes')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ColorPaletteSelector />
        </CardContent>
      </Card>

      <Separator />

      {/* Visual Preferences Section - using semantic colors */}
      <Card className="bg-gradient-theme-accent border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-foreground">
            <Settings className="h-5 w-5" />
            {t('settings.visualPreferences')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <VisualPreferences />
        </CardContent>
      </Card>

      {/* Info Card - using semantic colors */}
      <Card className="bg-gradient-theme-primary border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <p className="text-sm text-muted-foreground">
              {t('settings.themeNote')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
