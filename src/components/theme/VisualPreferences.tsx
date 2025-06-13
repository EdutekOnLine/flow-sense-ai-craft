
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

  const shapeOptions = [
    // Basic Shapes
    { value: 'sharp', label: 'Sharp', category: 'Basic' },
    { value: 'rounded', label: 'Rounded', category: 'Basic' },
    { value: 'very-rounded', label: 'Very Rounded', category: 'Basic' },
    { value: 'pill', label: 'Pill', category: 'Basic' },
    
    // Creative Shapes
    { value: 'asymmetric', label: 'Asymmetric', category: 'Creative' },
    { value: 'beveled', label: 'Beveled', category: 'Creative' },
    { value: 'skewed', label: 'Skewed', category: 'Creative' },
    { value: 'notched', label: 'Notched', category: 'Creative' },
    
    // Geometric Shapes
    { value: 'hexagonal', label: 'Hexagonal', category: 'Geometric' },
    { value: 'diamond', label: 'Diamond', category: 'Geometric' },
  ] as const;

  const groupedShapes = shapeOptions.reduce((acc, shape) => {
    if (!acc[shape.category]) {
      acc[shape.category] = [];
    }
    acc[shape.category].push(shape);
    return acc;
  }, {} as Record<string, typeof shapeOptions>);

  return (
    <div className="space-y-6">
      {/* Card Shapes */}
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
            {Object.entries(groupedShapes).map(([category, shapes]) => (
              <div key={category} className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">{category}</h4>
                <div className="grid grid-cols-2 gap-2">
                  {shapes.map((shape) => (
                    <div key={shape.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={shape.value} id={shape.value} />
                      <Label htmlFor={shape.value} className="flex items-center space-x-2 cursor-pointer">
                        <span className="text-sm">{shape.label}</span>
                        <div className={`shape-preview shape-preview-${shape.value}`} />
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
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
                <span>None</span>
                <div className="w-8 h-6 bg-primary rounded border" />
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="subtle" id="subtle" />
              <Label htmlFor="subtle" className="flex items-center space-x-2">
                <span>Subtle</span>
                <div className="w-8 h-6 bg-primary rounded shadow-sm" />
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pronounced" id="pronounced" />
              <Label htmlFor="pronounced" className="flex items-center space-x-2">
                <span>Pronounced</span>
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
              <Label htmlFor="compact">Compact</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="standard" id="standard" />
              <Label htmlFor="standard">Standard</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="spacious" id="spacious" />
              <Label htmlFor="spacious">Spacious</Label>
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
            <Label htmlFor="reduced-motion">Reduce animations</Label>
            <Switch
              id="reduced-motion"
              checked={themeSettings.visualPreferences.animationStyle === 'reduced'}
              onCheckedChange={(checked) =>
                updateVisualPreference('animationStyle', checked ? 'reduced' : 'full')
              }
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Enable this to reduce motion for accessibility or performance
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
