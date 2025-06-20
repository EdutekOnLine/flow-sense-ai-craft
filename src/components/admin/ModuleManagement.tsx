
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useModulePermissions } from '@/hooks/useModulePermissions';
import { useWorkspace } from '@/hooks/useWorkspace';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Shield, Loader2 } from 'lucide-react';
import { ModuleManagementHeader } from './module-management/ModuleManagementHeader';
import { ModuleManagementSearch } from './module-management/ModuleManagementSearch';
import { ModuleManagementTabs } from './module-management/ModuleManagementTabs';
import { ModuleManagementOverview } from './module-management/ModuleManagementOverview';
import { ModuleSettings } from './module-management/ModuleSettings';
import { ModuleMarketplace } from './module-management/ModuleMarketplace';

export default function ModuleManagement() {
  const { profile, loading: authLoading, authError } = useAuth();
  const { t } = useTranslation();
  const { getModulesWithStatus, canManageModules } = useModulePermissions();
  const { toggleModule } = useWorkspace();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Show loading state while profile is being fetched
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading module management...</span>
        </div>
      </div>
    );
  }

  // Show auth error if present
  if (authError) {
    return (
      <div className="text-center py-8">
        <div className="flex flex-col items-center space-y-4">
          <Shield className="h-16 w-16 text-muted-foreground" />
          <h2 className="text-2xl font-bold text-foreground">Authentication Error</h2>
          <p className="text-muted-foreground">{authError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Access control - ensure we have a profile before checking permissions
  if (!profile || !canManageModules()) {
    return (
      <div className="text-center py-8">
        <div className="flex flex-col items-center space-y-4">
          <Shield className="h-16 w-16 text-muted-foreground" />
          <h2 className="text-2xl font-bold text-foreground">Access Denied</h2>
          <p className="text-muted-foreground">
            Only root users can access module management.
          </p>
          {profile && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Current user: {profile.email} (Role: {profile.role})
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const modules = getModulesWithStatus();
  
  // Memoize filtered modules to prevent unnecessary recalculations
  const filteredModules = useMemo(() => 
    modules.filter(module =>
      module.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.name.toLowerCase().includes(searchTerm.toLowerCase())
    ), [modules, searchTerm]
  );

  const moduleDisplayNames = useMemo(() => 
    modules.reduce((acc, module) => {
      acc[module.name] = module.displayName;
      return acc;
    }, {} as Record<string, string>)
  , [modules]);

  const activeModulesCount = modules.filter(m => m.isActive).length;
  const totalModulesCount = modules.length;

  const handleModuleToggle = async (moduleId: string, isActive: boolean) => {
    try {
      await toggleModule.mutateAsync({ moduleId, isActive });
    } catch (error) {
      console.error('Failed to toggle module:', error);
    }
  };

  const handleBulkToggle = async (moduleIds: string[], isActive: boolean) => {
    for (const moduleId of moduleIds) {
      try {
        await toggleModule.mutateAsync({ moduleId, isActive });
      } catch (error) {
        console.error(`Failed to toggle module ${moduleId}:`, error);
      }
    }
    setSelectedModules([]);
  };

  const handleModuleSelect = (moduleId: string, selected: boolean) => {
    if (selected) {
      setSelectedModules([...selectedModules, moduleId]);
    } else {
      setSelectedModules(selectedModules.filter(id => id !== moduleId));
    }
  };

  return (
    <div className="space-y-6">
      <ModuleManagementHeader
        activeModulesCount={activeModulesCount}
        totalModulesCount={totalModulesCount}
      />

      <ModuleManagementSearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedModules={selectedModules}
        moduleDisplayNames={moduleDisplayNames}
        onBulkToggle={handleBulkToggle}
        isLoading={toggleModule.isPending}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <ModuleManagementTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <TabsContent value="overview" className="space-y-6">
          <ModuleManagementOverview
            modules={filteredModules}
            selectedModules={selectedModules}
            onModuleSelect={handleModuleSelect}
            onModuleToggle={handleModuleToggle}
            isLoading={toggleModule.isPending}
            searchTerm={searchTerm}
          />
        </TabsContent>

        <TabsContent value="settings">
          <ModuleSettings modules={filteredModules} />
        </TabsContent>

        <TabsContent value="marketplace">
          <ModuleMarketplace />
        </TabsContent>
      </Tabs>
    </div>
  );
}
