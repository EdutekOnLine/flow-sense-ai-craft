
import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { useTranslation } from 'react-i18next';
import { VisualPreferences as VisualPreferencesType } from '@/types/theme';

export function VisualPreferences() {
  const { themeSettings, updateThemeSettings } = useTheme();
  const { t } = useTranslation();

  const updateVisualPreference = <K extends keyof VisualPreferencesType>(
    key: K,
    value: VisualPreferencesType[K]
  ) => {
    updateThemeSettings({
      visualPreferences: {
        ...themeSettings.visualPreferences,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Border Radius */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('settings.borderRadius')}</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={themeSettings.visualPreferences.borderRadius}
            onValueChange={(value) => updateVisualPreference('borderRadius', value as any)}
            className="space-y-4"
          >
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="sharp" id="sharp" />
              <Label htmlFor="sharp" className="flex items-center space-x-3 cursor-pointer flex-1">
                <span className="flex-1">{t('settings.borderRadiusSharp')}</span>
                <div className="bg-blue-500 text-white px-4 py-2 text-sm font-medium shadow-sm" style={{ borderRadius: '0px' }}>
                  Button
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="rounded" id="rounded" />
              <Label htmlFor="rounded" className="flex items-center space-x-3 cursor-pointer flex-1">
                <span className="flex-1">{t('settings.borderRadiusRounded')}</span>
                <div className="bg-blue-500 text-white px-4 py-2 text-sm font-medium shadow-sm rounded-md">
                  Button
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="very-rounded" id="very-rounded" />
              <Label htmlFor="very-rounded" className="flex items-center space-x-3 cursor-pointer flex-1">
                <span className="flex-1">{t('settings.borderRadiusVeryRounded')}</span>
                <div className="bg-blue-500 text-white px-4 py-2 text-sm font-medium shadow-sm rounded-full">
                  Button
                </div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Card Shadows */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('settings.cardShadows')}</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={themeSettings.visualPreferences.cardShadows}
            onValueChange={(value) => updateVisualPreference('cardShadows', value as any)}
            className="space-y-4"
          >
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="none" id="none" />
              <Label htmlFor="none" className="flex items-center space-x-3 cursor-pointer flex-1">
                <span className="flex-1">{t('settings.shadowsNone')}</span>
                <div className="bg-white border border-gray-200 rounded-lg p-3 text-sm text-gray-800">
                  Card
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="subtle" id="subtle" />
              <Label htmlFor="subtle" className="flex items-center space-x-3 cursor-pointer flex-1">
                <span className="flex-1">{t('settings.shadowsSubtle')}</span>
                <div className="bg-white border border-gray-200 rounded-lg p-3 text-sm text-gray-800 shadow-sm">
                  Card
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="pronounced" id="pronounced" />
              <Label htmlFor="pronounced" className="flex items-center space-x-3 cursor-pointer flex-1">
                <span className="flex-1">{t('settings.shadowsPronounced')}</span>
                <div className="bg-white border border-gray-200 rounded-lg p-3 text-sm text-gray-800 shadow-lg">
                  Card
                </div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Sidebar Style */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('settings.sidebarStyle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={themeSettings.visualPreferences.sidebarStyle}
            onValueChange={(value) => updateVisualPreference('sidebarStyle', value as any)}
            className="space-y-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="compact" id="compact" />
              <Label htmlFor="compact">{t('settings.sidebarCompact')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="standard" id="standard" />
              <Label htmlFor="standard">{t('settings.sidebarStandard')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="spacious" id="spacious" />
              <Label htmlFor="spacious">{t('settings.sidebarSpacious')}</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Animation Style */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('settings.animations')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="reduced-motion">{t('settings.animationsReduced')}</Label>
            <Switch
              id="reduced-motion"
              checked={themeSettings.visualPreferences.animationStyle === 'reduced'}
              onCheckedChange={(checked) =>
                updateVisualPreference('animationStyle', checked ? 'reduced' : 'full')
              }
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {t('settings.animationsReducedDescription')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
