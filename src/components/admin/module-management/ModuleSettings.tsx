
import React, { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { ModuleSelector } from './settings/ModuleSelector';
import { SettingsPanel } from './settings/SettingsPanel';
import { EmptyModulesState } from './settings/EmptyModulesState';

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

  const handleSaveSettings = () => {
    setHasUnsavedChanges(false);
    console.log('Saving settings for module:', selectedModule);
  };

  const handleResetSettings = () => {
    setHasUnsavedChanges(false);
    console.log('Resetting settings for module:', selectedModule);
  };

  const handleSettingChange = (key: string, value: any) => {
    setHasUnsavedChanges(true);
    console.log(`Setting ${key} to:`, value);
  };

  if (activeModules.length === 0) {
    return <EmptyModulesState />;
  }

  if (!currentModule) {
    return <EmptyModulesState />;
  }

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
        <ModuleSelector
          modules={modules}
          selectedModule={selectedModule}
          onModuleSelect={setSelectedModule}
        />
        
        <SettingsPanel
          currentModule={currentModule}
          hasUnsavedChanges={hasUnsavedChanges}
          onSaveSettings={handleSaveSettings}
          onResetSettings={handleResetSettings}
          onSettingChange={handleSettingChange}
        />
      </div>
    </div>
  );
}
