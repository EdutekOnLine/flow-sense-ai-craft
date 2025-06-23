
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useModulePermissions } from '@/hooks/useModulePermissions';
import { 
  Workflow, 
  Users, 
  FileText, 
  BookOpen, 
  Settings,
  ExternalLink,
  Grid3X3
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MODULE_REGISTRY } from '@/modules';

export function ModuleIntegrationOverview() {
  const { getAccessibleModules, canManageModules } = useModulePermissions();
  const { t } = useTranslation();

  const accessibleModules = getAccessibleModules();
  
  const moduleIcons = {
    'neura-core': Settings,
    'neura-flow': Workflow,
    'neura-crm': Users,
    'neura-forms': FileText,
    'neura-edu': BookOpen
  };

  const handleModuleClick = (moduleName: string) => {
    // Navigate to module-specific section based on the module
    switch (moduleName) {
      case 'neura-flow':
        window.location.hash = 'workflow-inbox';
        break;
      case 'neura-crm':
        window.location.hash = 'crm';
        break;
      case 'neura-forms':
        window.location.hash = 'forms';
        break;
      case 'neura-edu':
        window.location.hash = 'education';
        break;
      default:
        window.location.hash = 'dashboard';
    }
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  };

  const handleManageModules = () => {
    window.location.hash = 'module-management';
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <div className="p-3 bg-gradient-to-br from-primary to-accent rounded-xl border border-border shadow-card">
            <Grid3X3 className="h-6 w-6 text-primary-foreground" />
          </div>
          Active Modules
        </CardTitle>
        {canManageModules() && (
          <Button variant="outline" size="sm" onClick={handleManageModules}>
            <Settings className="h-4 w-4 mr-2" />
            Manage
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accessibleModules.map((moduleName) => {
            const moduleInfo = MODULE_REGISTRY[moduleName];
            const IconComponent = moduleIcons[moduleName as keyof typeof moduleIcons] || Settings;
            const isCore = moduleInfo?.isCore;
            
            return (
              <Card 
                key={moduleName} 
                className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/20"
                onClick={() => handleModuleClick(moduleName)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <IconComponent className="h-8 w-8 text-primary" />
                    <Badge variant={isCore ? "default" : "secondary"}>
                      {isCore ? "Core" : "Module"}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-sm mb-1">
                    {moduleInfo?.name || moduleName}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    {moduleInfo?.description || `${moduleName} functionality`}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      v{moduleInfo?.version || '1.0.0'}
                    </Badge>
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {accessibleModules.length === 1 && (
          <div className="mt-4 text-center text-muted-foreground">
            <p className="text-sm">
              You have access to core functionality. 
              {canManageModules() && (
                <span className="ml-1">
                  <Button variant="link" className="h-auto p-0 text-primary" onClick={handleManageModules}>
                    Activate more modules
                  </Button> to unlock additional features.
                </span>
              )}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
