
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useModulePermissions } from '@/hooks/useModulePermissions';
import { ModuleDataSourceMapper, DataSourceInfo } from '@/utils/moduleDataSourceMapper';
import { getRTLAwareTextAlign } from '@/utils/rtl';
import { Info, AlertCircle, Settings } from 'lucide-react';

interface ModuleDataSourceSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function ModuleDataSourceSelector({ value, onChange }: ModuleDataSourceSelectorProps) {
  const { t } = useTranslation();
  const { activeModules, canManageModules } = useModulePermissions();
  
  // Check if user is root (can access all data sources)
  const isRootUser = canManageModules();
  
  // Get available data sources based on active modules
  const availableDataSources = ModuleDataSourceMapper.getAvailableDataSources(activeModules, isRootUser);
  const allDataSources = Object.values(ModuleDataSourceMapper.DATA_SOURCE_INFO);
  const unavailableDataSources = allDataSources.filter((ds: DataSourceInfo) => 
    !availableDataSources.find(ads => ads.id === ds.id)
  );

  // Get suggested modules for unavailable data sources
  const suggestedModules = ModuleDataSourceMapper.getSuggestedModules(
    unavailableDataSources.map((ds: DataSourceInfo) => ds.id),
    activeModules
  );

  const getModuleDisplayName = (moduleId: string) => {
    const displayNames: Record<string, string> = {
      'neura-core': 'NeuraCore',
      'neura-flow': 'NeuraFlow',
      'neura-crm': 'NeuraCRM',
      'neura-forms': 'NeuraForms',
      'neura-edu': 'NeuraEdu'
    };
    return displayNames[moduleId] || moduleId;
  };

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
    <div className="space-y-4">
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
                    {source.requiredModules.map(moduleId => (
                      <Badge 
                        key={moduleId} 
                        variant="outline" 
                        className={`text-xs ${getModuleBadgeColor(moduleId)}`}
                      >
                        {getModuleDisplayName(moduleId)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Show info about current selection */}
      {value && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className={getRTLAwareTextAlign('start')}>
            {availableDataSources.find(ds => ds.id === value)?.description}
          </AlertDescription>
        </Alert>
      )}

      {/* Show suggestions for accessing more data sources */}
      {!isRootUser && unavailableDataSources.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <div className="space-y-2">
              <p className="font-medium">More data sources available!</p>
              <p className="text-sm">
                Activate these modules to access additional data sources: {' '}
                {suggestedModules.map(moduleId => (
                  <Badge 
                    key={moduleId}
                    variant="outline" 
                    className={`mr-1 ${getModuleBadgeColor(moduleId)}`}
                  >
                    {getModuleDisplayName(moduleId)}
                  </Badge>
                ))}
              </p>
              {canManageModules() && (
                <Button variant="outline" size="sm" className="mt-2">
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Modules
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Root user indicator */}
      {isRootUser && (
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Root Access:</strong> You have access to all data sources regardless of workspace module configuration.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
