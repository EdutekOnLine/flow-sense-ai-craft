
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { RefreshCw } from 'lucide-react';
import { getRTLAwareTextAlign, getRTLAwareIconPosition } from '@/utils/rtl';
import { ReportConfig } from './types';
import { ModuleDataSourceMapper } from '@/utils/moduleDataSourceMapper';

interface ReportConfigurationDisplayProps {
  reportConfig: ReportConfig;
  aiExplanation: string;
  isLoadingData: boolean;
  onRefresh: () => void;
  getModuleDisplayName: (moduleId: string) => string;
}

export function ReportConfigurationDisplay({
  reportConfig,
  aiExplanation,
  isLoadingData,
  onRefresh,
  getModuleDisplayName
}: ReportConfigurationDisplayProps) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className={`flex items-center justify-between gap-4 rtl:flex-row-reverse`}>
          <span className={getRTLAwareTextAlign('start')}>{t('reports.generatedConfiguration')}</span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onRefresh}
            disabled={isLoadingData}
            className={`flex items-center gap-2 rtl:flex-row-reverse flex-shrink-0`}
          >
            <RefreshCw className={`h-4 w-4 ${getRTLAwareIconPosition('before')} ${isLoadingData ? 'animate-spin' : ''}`} />
            <span>{t('common.refresh')}</span>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {aiExplanation && (
          <Alert>
            <AlertDescription className={getRTLAwareTextAlign('start')} dir="auto">{aiExplanation}</AlertDescription>
          </Alert>
        )}
        
        <div className={`space-y-2 ${getRTLAwareTextAlign('start')}`}>
          <div dir="auto">
            <span className="font-medium text-foreground">{t('reports.dataSource')}: </span>
            <span className="text-sm text-muted-foreground">{reportConfig.dataSource}</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {ModuleDataSourceMapper.getModulesForDataSource(reportConfig.dataSource).map(moduleId => (
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
          <div dir="auto">
            <span className="font-medium text-foreground">{t('reports.selectedColumns')}: </span>
            <span className="text-sm text-muted-foreground">{reportConfig.selectedColumns.join(', ')}</span>
          </div>
          {reportConfig.filters.length > 0 && (
            <div dir="auto">
              <span className="font-medium text-foreground">{t('reports.filters')}: </span>
              <ul className="text-sm mt-1 space-y-1">
                {reportConfig.filters.map((filter, index) => (
                  <li key={index} className={`ml-4 rtl:mr-4 rtl:ml-0 ${getRTLAwareTextAlign('start')} text-muted-foreground`} dir="auto">
                    • {filter.column} {filter.operator} {filter.value}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
