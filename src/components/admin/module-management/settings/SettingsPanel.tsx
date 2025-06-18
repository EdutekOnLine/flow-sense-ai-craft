
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Save, RotateCcw, AlertCircle } from 'lucide-react';
import { SettingField } from './SettingField';
import { getModuleSettingsSchema, SettingDefinition } from './ModuleSettingsSchema';

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
  const settingsSchema = getModuleSettingsSchema(currentModule.name);
  const settingsSections = Object.keys(settingsSchema);

  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-xl">{currentModule.displayName} Settings</CardTitle>
            <Badge variant="outline">{currentModule.name}</Badge>
          </div>
          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                <AlertCircle className="h-3 w-3 mr-1" />
                Unsaved Changes
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={onResetSettings}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
            <Button size="sm" onClick={onSaveSettings}>
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {settingsSections.length > 0 ? (
          <Tabs defaultValue={settingsSections[0]} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              {settingsSections.map(section => (
                <TabsTrigger key={section} value={section} className="capitalize">
                  {section}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {settingsSections.map(section => (
              <TabsContent key={section} value={section} className="space-y-4">
                <div className="grid gap-4">
                  {Object.entries(settingsSchema[section]).map(([key, setting]) => (
                    <div key={key} className="p-4 border rounded-lg">
                      <SettingField
                        settingKey={key}
                        setting={setting}
                        value={setting.default}
                        onChange={(value) => onSettingChange(key, value)}
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="text-center py-8">
            <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Settings Available</h3>
            <p className="text-muted-foreground">
              This module doesn't have configurable settings yet.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
