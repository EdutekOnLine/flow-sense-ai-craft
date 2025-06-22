
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useModulePermissions } from '@/hooks/useModulePermissions';
import { ModuleDataSourceMapper } from '@/utils/moduleDataSourceMapper';
import { getRTLAwareTextAlign } from '@/utils/rtl';
import { Info, AlertCircle } from 'lucide-react';

interface DataSourceSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function DataSourceSelector({ value, onChange }: DataSourceSelectorProps) {
  const { t } = useTranslation();
  const { activeModules, canManageModules, getModuleDisplayName } = useModulePermissions();
  
  const isRootUser = canManageModules();
  
  // Get available data sources based on active modules
  const availableDataSources = ModuleDataSourceMapper.getAvailableDataSources(activeModules, isRootUser);

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

  return (
    <div className="space-y-2">
      <label className={`text-sm font-medium ${getRTLAwareTextAlign('start')}`}>
        {t('reports.selectDataSource')}
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={getRTLAwareTextAlign('start')}>
          <SelectValue placeholder={t('reports.chooseDataSource')} />
        </SelectTrigger>
        <SelectContent>
          {availableDataSources.map((source) => (
            <SelectItem key={source.id} value={source.id} className={getRTLAwareTextAlign('start')}>
              <div className="flex items-center justify-between w-full">
                <span>{source.name}</span>
                <div className="flex gap-1 ml-2">
                  {source.requiredModules.slice(0, 2).map(moduleId => (
                    <Badge 
                      key={moduleId} 
                      variant="outline" 
                      className={`text-xs ${getModuleBadgeColor(moduleId)}`}
                    >
                      {getModuleDisplayName(moduleId)}
                    </Badge>
                  ))}
                  {source.requiredModules.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{source.requiredModules.length - 2}
                    </Badge>
                  )}
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {/* Show info about current selection */}
      {value && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className={getRTLAwareTextAlign('start')}>
            {availableDataSources.find(ds => ds.id === value)?.description}
          </AlertDescription>
        </Alert>
      )}

      {/* Show message if no data sources available */}
      {availableDataSources.length === 0 && !isRootUser && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            No data sources available. Contact your administrator to activate modules for your workspace.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
