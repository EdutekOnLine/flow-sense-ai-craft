import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useModulePermissions } from '@/hooks/useModulePermissions';
import { useWorkspace } from '@/hooks/useWorkspace';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  Search, 
  Package, 
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { ModuleCard } from './module-management/ModuleCard';
import { ModuleSettings } from './module-management/ModuleSettings';
import { ModuleMarketplace } from './module-management/ModuleMarketplace';
import { BulkActions } from './module-management/BulkActions';

export default function ModuleManagement() {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const { getModulesWithStatus, canManageModules } = useModulePermissions();
  const { toggleModule } = useWorkspace();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Access control
  if (!canManageModules()) {
    return (
      <div className="text-center py-8">
        <div className="flex flex-col items-center space-y-4">
          <Shield className="h-16 w-16 text-muted-foreground" />
          <h2 className="text-2xl font-bold text-foreground">Access Denied</h2>
          <p className="text-muted-foreground">Only root users can access module management.</p>
        </div>
      </div>
    );
  }

  const modules = getModulesWithStatus();
  const filteredModules = modules.filter(module =>
    module.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    module.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative bg-gradient-theme-primary border border-border rounded-xl p-8">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Module Management</h1>
                <p className="text-muted-foreground">Manage and configure workspace modules</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                <CheckCircle className="h-3 w-3 mr-1" />
                {activeModulesCount} Active
              </Badge>
              <Badge variant="outline" className="bg-muted/10 text-muted-foreground border-muted/20">
                <Package className="h-3 w-3 mr-1" />
                {totalModulesCount} Total
              </Badge>
            </div>
          </div>
          <Badge variant="secondary" className="bg-secondary/10 text-secondary">
            <Shield className="h-3 w-3 mr-1" />
            Root Access
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search modules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <BulkActions
          selectedModules={selectedModules}
          onBulkToggle={handleBulkToggle}
          isLoading={toggleModule.isPending}
        />
      </div>

      {/* Module Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="marketplace" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Marketplace
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {filteredModules.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No modules found</h3>
                <p className="text-muted-foreground text-center">
                  {searchTerm ? 'Try adjusting your search criteria.' : 'No modules are available.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredModules.map(module => (
                <ModuleCard
                  key={module.name}
                  module={module}
                  isSelected={selectedModules.includes(module.name)}
                  onSelect={(selected) => {
                    if (selected) {
                      setSelectedModules([...selectedModules, module.name]);
                    } else {
                      setSelectedModules(selectedModules.filter(id => id !== module.name));
                    }
                  }}
                  onToggle={handleModuleToggle}
                  isLoading={toggleModule.isPending}
                />
              ))}
            </div>
          )}
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
