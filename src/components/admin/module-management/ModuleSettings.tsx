
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  AlertCircle,
  Info,
  Package
} from 'lucide-react';

interface Module {
  name: string;
  displayName: string;
  isActive: boolean;
  isAvailable: boolean;
  isRestricted: boolean;
  statusMessage?: string;
}

interface ModuleSettingsProps {
  modules: Module[];
}

export function ModuleSettings({ modules }: ModuleSettingsProps) {
  const [selectedModule, setSelectedModule] = useState<string>(modules[0]?.name || '');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const activeModules = modules.filter(m => m.isActive);
  const currentModule = modules.find(m => m.name === selectedModule);

  const getModuleSettingsSchema = (moduleName: string) => {
    const schemas: Record<string, any> = {
      'neura-core': {
        general: {
          maxUsers: { type: 'number', default: 100, label: 'Maximum Users' },
          sessionTimeout: { type: 'number', default: 30, label: 'Session Timeout (minutes)' },
          enableAuditLog: { type: 'boolean', default: true, label: 'Enable Audit Logging' },
        },
        security: {
          passwordMinLength: { type: 'number', default: 8, label: 'Minimum Password Length' },
          requireMFA: { type: 'boolean', default: false, label: 'Require Multi-Factor Authentication' },
          allowGuestAccess: { type: 'boolean', default: false, label: 'Allow Guest Access' },
        }
      },
      'neura-flow': {
        workflow: {
          maxStepsPerWorkflow: { type: 'number', default: 50, label: 'Max Steps per Workflow' },
          autoSaveInterval: { type: 'number', default: 5, label: 'Auto-save Interval (minutes)' },
          enableVersioning: { type: 'boolean', default: true, label: 'Enable Workflow Versioning' },
        },
        execution: {
          maxConcurrentExecutions: { type: 'number', default: 10, label: 'Max Concurrent Executions' },
          executionTimeout: { type: 'number', default: 60, label: 'Execution Timeout (minutes)' },
          retryAttempts: { type: 'number', default: 3, label: 'Retry Attempts on Failure' },
        }
      },
      'neura-crm': {
        contacts: {
          maxContactsPerUser: { type: 'number', default: 1000, label: 'Max Contacts per User' },
          enableDuplicateDetection: { type: 'boolean', default: true, label: 'Enable Duplicate Detection' },
          autoEnrichment: { type: 'boolean', default: false, label: 'Auto Contact Enrichment' },
        },
        pipeline: {
          maxPipelineStages: { type: 'number', default: 10, label: 'Max Pipeline Stages' },
          enableActivityTracking: { type: 'boolean', default: true, label: 'Enable Activity Tracking' },
          autoMoveDeals: { type: 'boolean', default: false, label: 'Auto-move Stale Deals' },
        }
      }
    };
    return schemas[moduleName] || {};
  };

  const renderSettingField = (key: string, setting: any, value: any, onChange: (value: any) => void) => {
    switch (setting.type) {
      case 'boolean':
        return (
          <div className="flex items-center justify-between">
            <Label htmlFor={key} className="text-sm font-medium">{setting.label}</Label>
            <Switch
              id={key}
              checked={value}
              onCheckedChange={onChange}
            />
          </div>
        );
      case 'number':
        return (
          <div className="space-y-2">
            <Label htmlFor={key} className="text-sm font-medium">{setting.label}</Label>
            <Input
              id={key}
              type="number"
              value={value}
              onChange={(e) => onChange(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        );
      case 'text':
        return (
          <div className="space-y-2">
            <Label htmlFor={key} className="text-sm font-medium">{setting.label}</Label>
            <Input
              id={key}
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full"
            />
          </div>
        );
      case 'textarea':
        return (
          <div className="space-y-2">
            <Label htmlFor={key} className="text-sm font-medium">{setting.label}</Label>
            <Textarea
              id={key}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full"
              rows={3}
            />
          </div>
        );
      default:
        return null;
    }
  };

  const handleSaveSettings = () => {
    // Implementation for saving settings
    setHasUnsavedChanges(false);
    console.log('Saving settings for module:', selectedModule);
  };

  const handleResetSettings = () => {
    // Implementation for resetting settings
    setHasUnsavedChanges(false);
    console.log('Resetting settings for module:', selectedModule);
  };

  if (activeModules.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Active Modules</h3>
          <p className="text-muted-foreground text-center">
            Enable modules to configure their settings.
          </p>
        </CardContent>
      </Card>
    );
  }

  const settingsSchema = getModuleSettingsSchema(selectedModule);
  const settingsSections = Object.keys(settingsSchema);

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Module settings control the behavior and limits of each module in your workspace. 
          Changes may require module restart to take effect.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Module Selector */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Modules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {activeModules.map(module => (
              <Button
                key={module.name}
                variant={selectedModule === module.name ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setSelectedModule(module.name)}
              >
                <Package className="h-4 w-4 mr-2" />
                {module.displayName}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Settings Panel */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl">{currentModule?.displayName} Settings</CardTitle>
                <Badge variant="outline">{currentModule?.name}</Badge>
              </div>
              <div className="flex items-center gap-2">
                {hasUnsavedChanges && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Unsaved Changes
                  </Badge>
                )}
                <Button variant="outline" size="sm" onClick={handleResetSettings}>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Reset
                </Button>
                <Button size="sm" onClick={handleSaveSettings}>
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
                          {renderSettingField(key, setting, setting.default, (value) => {
                            setHasUnsavedChanges(true);
                            console.log(`Setting ${key} to:`, value);
                          })}
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
      </div>
    </div>
  );
}
