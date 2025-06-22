
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getRTLAwareTextAlign } from '@/utils/rtl';
import { PredefinedReport } from './constants/predefinedReports';

interface PredefinedReportCardProps {
  report: PredefinedReport;
  onGenerate: (reportId: string) => void;
  getModuleDisplayName: (moduleId: string) => string;
  getModuleBadgeColor: (moduleId: string) => string;
  isAvailable?: boolean;
}

export function PredefinedReportCard({
  report,
  onGenerate,
  getModuleDisplayName,
  getModuleBadgeColor,
  isAvailable = true
}: PredefinedReportCardProps) {
  const { t } = useTranslation();
  const Icon = report.icon;

  if (!isAvailable) {
    return (
      <Card className="relative flex flex-col h-full">
        <div className="absolute inset-0 bg-muted/50 rounded-lg z-10 flex items-center justify-center">
          <Badge variant="secondary">Module Required</Badge>
        </div>
        <CardHeader className="pb-3 flex-shrink-0">
          <div className={`flex items-start justify-between rtl:flex-row-reverse`}>
            <div className={`flex items-center space-x-2 rtl:space-x-reverse rtl:flex-row-reverse flex-1`}>
              <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <div className="min-h-[3rem] flex items-start">
                <CardTitle className={`text-lg text-muted-foreground line-clamp-2 ${getRTLAwareTextAlign('start')}`}>
                  {report.name}
                </CardTitle>
              </div>
            </div>
          </div>
          <div className="min-h-[2rem] flex items-start mt-2">
            <div className="flex flex-wrap gap-1">
              {report.requiredModules.map(moduleId => (
                <Badge 
                  key={moduleId}
                  variant="outline" 
                  className="text-xs bg-muted text-muted-foreground"
                >
                  {getModuleDisplayName(moduleId)}
                </Badge>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col flex-1">
          <div className="min-h-[4rem] flex items-start">
            <p className={`text-sm text-muted-foreground line-clamp-3 overflow-hidden ${getRTLAwareTextAlign('start')}`}>
              {report.description}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow relative flex flex-col h-full">
      {report.isPopular && (
        <Badge className="absolute -top-2 -right-2 bg-yellow-500 text-yellow-900">
          Popular
        </Badge>
      )}
      <CardHeader className="pb-3 flex-shrink-0">
        <div className={`flex items-start justify-between rtl:flex-row-reverse`}>
          <div className={`flex items-center space-x-2 rtl:space-x-reverse rtl:flex-row-reverse flex-1`}>
            <Icon className="h-5 w-5 text-primary flex-shrink-0" />
            <div className="min-h-[3rem] flex items-start">
              <CardTitle className={`text-lg line-clamp-2 overflow-hidden ${getRTLAwareTextAlign('start')}`}>
                {report.name}
              </CardTitle>
            </div>
          </div>
        </div>
        <div className="min-h-[2rem] flex items-start mt-2">
          <div className="flex flex-wrap gap-1">
            {report.requiredModules.map(moduleId => (
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
      </CardHeader>
      <CardContent className="flex flex-col flex-1 space-y-4">
        <div className="min-h-[4rem] flex items-start flex-1">
          <p className={`text-sm text-muted-foreground line-clamp-3 overflow-hidden ${getRTLAwareTextAlign('start')}`}>
            {report.description}
          </p>
        </div>
        <div className={`flex justify-end rtl:justify-start flex-shrink-0 pt-2`}>
          <Button 
            size="sm"
            onClick={() => onGenerate(report.id)}
          >
            {t('reports.generate')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
