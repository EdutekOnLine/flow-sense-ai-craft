
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Save, Download, Settings } from 'lucide-react';
import { getRTLAwareTextAlign, getRTLAwareIconPosition } from '@/utils/rtl';
import { DynamicReportTable } from './DynamicReportTable';
import { ReportConfig } from './types';

interface ReportPreviewPanelProps {
  reportConfig: ReportConfig | null;
  reportData: any[];
  error: string;
  isLoadingData: boolean;
  availableDataSources: any[];
  isRootUser: boolean;
}

export function ReportPreviewPanel({
  reportConfig,
  reportData,
  error,
  isLoadingData,
  availableDataSources,
  isRootUser
}: ReportPreviewPanelProps) {
  const { t } = useTranslation();

  const renderContent = () => {
    if (error) {
      return (
        <Alert variant="destructive">
          <AlertDescription className={getRTLAwareTextAlign('start')} dir="auto">{error}</AlertDescription>
        </Alert>
      );
    }

    if (!reportConfig && availableDataSources.length === 0 && !isRootUser) {
      return (
        <div className="text-center py-8">
          <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className={`${getRTLAwareTextAlign('center')} text-muted-foreground mb-2`}>
            No data sources available
          </p>
          <p className={`${getRTLAwareTextAlign('center')} text-sm text-muted-foreground`}>
            Contact your administrator to activate modules for your workspace.
          </p>
        </div>
      );
    }

    if (!reportConfig) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <p className={getRTLAwareTextAlign('center')}>{t('reports.enterQueryToGenerate')}</p>
        </div>
      );
    }

    if (isLoadingData) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <p className={getRTLAwareTextAlign('center')}>{t('reports.loadingReportData')}</p>
        </div>
      );
    }

    if (reportData.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <p className={getRTLAwareTextAlign('center')}>{t('reports.noDataFound')}</p>
        </div>
      );
    }

    return (
      <DynamicReportTable
        data={reportData}
        columns={reportConfig.selectedColumns}
      />
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className={`flex items-center justify-between gap-4 rtl:flex-row-reverse`}>
          <span className={getRTLAwareTextAlign('start')}>
            {reportConfig ? reportConfig.name : t('reports.reportPreview')}
          </span>
          {reportData.length > 0 && (
            <div className={`flex items-center gap-2 rtl:flex-row-reverse flex-shrink-0`}>
              <Button variant="outline" size="sm" disabled className={`flex items-center gap-2 rtl:flex-row-reverse`}>
                <Save className={`h-4 w-4 ${getRTLAwareIconPosition('before')}`} />
                <span>{t('common.save')}</span>
              </Button>
              <Button variant="outline" size="sm" disabled className={`flex items-center gap-2 rtl:flex-row-reverse`}>
                <Download className={`h-4 w-4 ${getRTLAwareIconPosition('before')}`} />
                <span>{t('reports.export')}</span>
              </Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}
