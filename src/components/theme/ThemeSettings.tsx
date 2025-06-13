
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
      {/* Header */}
      <div className="relative bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border border-blue-200 rounded-xl p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-purple-50/80 to-pink-50/80 rounded-xl"></div>
        <div className="relative">
          <div className={`flex items-start justify-between gap-4`}>
            <div className={`flex items-start gap-4 ${getRTLAwareTextAlign('start')}`}>
              <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <Palette className="h-8 w-8 text-white" />
              </div>
              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-gray-900">{t('settings.appearance')}</h1>
                <p className="text-lg text-gray-600">{t('settings.appearanceDescription')}</p>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                    Personal Customization
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

      {/* Color Palette Section */}
      <Card className="bg-gradient-to-br from-blue-50/30 to-purple-50/30 border-blue-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Palette className="h-5 w-5" />
            {t('settings.colorThemes')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ColorPaletteSelector />
        </CardContent>
      </Card>

      <Separator />

      {/* Visual Preferences Section */}
      <Card className="bg-gradient-to-br from-purple-50/30 to-pink-50/30 border-purple-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Settings className="h-5 w-5" />
            {t('settings.visualPreferences')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <VisualPreferences />
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-sm text-gray-600">
              {t('settings.themeNote')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
