
import React, { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { ModuleSelector } from './settings/ModuleSelector';
import { SettingsPanel } from './settings/SettingsPanel';
import { EmptyModulesState } from './settings/EmptyModulesState';
import { useWorkspace } from '@/hooks/useWorkspace';

interface Module {
  name: string;
  displayName: string;
  isActive: boolean;
  isAvailable: boolean;
  isRestricted: boolean;
  statusMessage?: string;
  hasDependencies?: boolean;
  missingDependencies?: string[];
  version?: string;
  settings?: any;
}

interface ModuleSettingsProps {
  modules: Module[];
}

export function ModuleSettings({ modules }: ModuleSettingsProps) {
  const { updateModuleSettings } = useWorkspace();
  const [selectedModule, setSelectedModule] = useState<string>(
    modules.find(m => m.isActive)?.name || modules[0]?.name || ''
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [currentSettings, setCurrentSettings] = useState<Record<string, any>>({});

  const activeModules = modules.filter(m => m.isActive);
  const currentModule = modules.find(m => m.name === selectedModule);

  const handleSaveSettings = async () => {
    if (!currentModule) return;
    
    try {
      await updateModuleSettings.mutateAsync({
        moduleId: currentModule.name,
        settings: currentSettings
      });
      setHasUnsavedChanges(false);
      console.log('Settings saved successfully for module:', selectedModule);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const handleResetSettings = () => {
    setCurrentSettings({});
    setHasUnsavedChanges(false);
    console.log('Settings reset for module:', selectedModule);
  };

  const handleSettingChange = (key: string, value: any) => {
    setCurrentSettings(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
    console.log(`Setting ${key} changed to:`, value);
  };

  const handleModuleSelect = (moduleName: string) => {
    if (hasUnsavedChanges) {
      const confirmChange = window.confirm(
        'You have unsaved changes. Do you want to discard them and switch modules?'
      );
      if (!confirmChange) return;
    }
    
    setSelectedModule(moduleName);
    setCurrentSettings({});
    setHasUnsavedChanges(false);
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
          onModuleSelect={handleModuleSelect}
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
