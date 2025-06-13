
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
            className="space-y-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sharp" id="sharp" />
              <Label htmlFor="sharp" className="flex items-center space-x-2">
                <span>{t('settings.borderRadiusSharp')}</span>
                <div className="w-4 h-4 bg-primary" />
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="rounded" id="rounded" />
              <Label htmlFor="rounded" className="flex items-center space-x-2">
                <span>{t('settings.borderRadiusRounded')}</span>
                <div className="w-4 h-4 bg-primary rounded" />
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="very-rounded" id="very-rounded" />
              <Label htmlFor="very-rounded" className="flex items-center space-x-2">
                <span>{t('settings.borderRadiusVeryRounded')}</span>
                <div className="w-4 h-4 bg-primary rounded-xl" />
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
            className="space-y-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="none" id="none" />
              <Label htmlFor="none" className="flex items-center space-x-2">
                <span>{t('settings.shadowsNone')}</span>
                <div className="w-8 h-6 bg-primary rounded border" />
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="subtle" id="subtle" />
              <Label htmlFor="subtle" className="flex items-center space-x-2">
                <span>{t('settings.shadowsSubtle')}</span>
                <div className="w-8 h-6 bg-primary rounded shadow-sm" />
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pronounced" id="pronounced" />
              <Label htmlFor="pronounced" className="flex items-center space-x-2">
                <span>{t('settings.shadowsPronounced')}</span>
                <div className="w-8 h-6 bg-primary rounded shadow-lg" />
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
