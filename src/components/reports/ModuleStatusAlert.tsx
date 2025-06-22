
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Settings } from 'lucide-react';

interface ModuleStatusAlertProps {
  isRootUser: boolean;
  availableDataSources: any[];
  activeModules: string[];
  getModuleDisplayName: (moduleId: string) => string;
}

export function ModuleStatusAlert({ 
  isRootUser, 
  availableDataSources, 
  activeModules, 
  getModuleDisplayName 
}: ModuleStatusAlertProps) {
  const { t } = useTranslation();

  const getModuleBadgeColor = (moduleId: string) => {
    const colors: Record<string, string> = {
      'neura-core': 'bg-blue-100 text-blue-800 border-blue-200',
      'neura-flow': 'bg-purple-100 text-purple-800 border-purple-200',
      'neura-crm': 'bg-green-100 text-green-800 border-green-200',
      'neura-forms': 'bg-orange-100 text-orange-800 border-orange-200',
      'neura-edu': 'bg-pink-100 text-pink-800 border-pink-200'
    };
    return colors[moduleId] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (isRootUser) return null;

  if (availableDataSources.length === 0) {
    return (
      <Alert className="border-orange-200 bg-orange-50">
        <Settings className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <div className="space-y-2">
            <p className="font-medium">No data sources available</p>
            <p className="text-sm">Contact your administrator to activate modules for your workspace.</p>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-blue-200 bg-blue-50">
      <Sparkles className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-800">
        <div className="space-y-2">
          <p className="font-medium">Available Data Sources: {availableDataSources.length}</p>
          <div className="flex flex-wrap gap-1">
            {activeModules.map(moduleId => (
              <Badge 
                key={moduleId}
                className={getModuleBadgeColor(moduleId)}
              >
                {getModuleDisplayName(moduleId)}
              </Badge>
            ))}
            {activeModules.length === 0 && (
              <Badge variant="outline" className="text-muted-foreground">
                No modules active
              </Badge>
            )}
          </div>
          {availableDataSources.length === 0 && (
            <p className="text-sm">Activate modules to access data sources for reporting.</p>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
