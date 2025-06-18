
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Settings, Save, RotateCcw, AlertCircle, Package } from 'lucide-react';
import { SettingField } from './SettingField';
import { getModuleSettingsSchema } from './ModuleSettingsSchema';

interface Module {
  name: string;
  displayName: string;
  isActive: boolean;
  isAvailable: boolean;
  isRestricted: boolean;
  statusMessage?: string;
}

interface SettingsPanelProps {
  currentModule: Module;
  hasUnsavedChanges: boolean;
  onSaveSettings: () => void;
  onResetSettings: () => void;
  onSettingChange: (key: string, value: any) => void;
}

export function SettingsPanel({
  currentModule,
  hasUnsavedChanges,
  onSaveSettings,
  onResetSettings,
  onSettingChange
}: SettingsPanelProps) {
  const [currentValues, setCurrentValues] = useState<Record<string, any>>({});
  const settingsSchema = getModuleSettingsSchema(currentModule.name);

  useEffect(() => {
    // Initialize settings with default values
    const defaultValues: Record<string, any> = {};
    Object.entries(settingsSchema).forEach(([category, settings]) => {
      Object.entries(settings).forEach(([key, setting]) => {
        defaultValues[key] = setting.default;
      });
    });
    setCurrentValues(defaultValues);
  }, [currentModule.name, settingsSchema]);

  const handleSettingChange = (key: string, value: any) => {
    setCurrentValues(prev => ({ ...prev, [key]: value }));
    onSettingChange(key, value);
  };

  const categoryCount = Object.keys(settingsSchema).length;
  const totalSettings = Object.values(settingsSchema).reduce(
    (sum, category) => sum + Object.keys(category).length, 
    0
  );

  return (
    <div className="lg:col-span-3 space-y-6">
      {/* Module Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">{currentModule.displayName}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configure settings for this module
                </p>
              </div>
            </div>
            <Badge variant={currentModule.isActive ? "default" : "secondary"}>
              {currentModule.statusMessage}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Categories</span>
              <span className="text-lg font-semibold">{categoryCount}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Settings</span>
              <span className="text-lg font-semibold">{totalSettings}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Categories */}
      {Object.entries(settingsSchema).map(([categoryName, categorySettings]) => (
        <Card key={categoryName}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-lg capitalize">{categoryName}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(categorySettings).map(([settingKey, settingDef]) => (
              <SettingField
                key={settingKey}
                settingKey={settingKey}
                setting={settingDef}
                value={currentValues[settingKey] ?? settingDef.default}
                onChange={(value) => handleSettingChange(settingKey, value)}
              />
            ))}
          </CardContent>
        </Card>
      ))}

      {/* No Settings Available */}
      {categoryCount === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Settings Available</h3>
            <p className="text-muted-foreground text-center">
              This module doesn't have any configurable settings.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {categoryCount > 0 && (
        <Card>
          <CardContent className="pt-6">
            {hasUnsavedChanges && (
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You have unsaved changes. Save your settings to apply them.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={onResetSettings}
                disabled={!hasUnsavedChanges}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Changes
              </Button>
              
              <Button
                onClick={onSaveSettings}
                disabled={!hasUnsavedChanges}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
