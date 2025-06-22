
import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DataSourceSelector } from './DataSourceSelector';
import { CriteriaBuilder } from './CriteriaBuilder';
import { ColumnSelector } from './ColumnSelector';
import { DynamicReportTable } from './DynamicReportTable';
import { ReportConfig, FilterCriteria } from './types';
import { ReportQueryEngine } from './ReportQueryEngine';
import { useModulePermissions } from '@/hooks/useModulePermissions';
import { ModuleDataSourceMapper } from '@/utils/moduleDataSourceMapper';
import { Play, Save, Download, FileBarChart, Settings } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { getRTLAwareTextAlign, getRTLAwareIconPosition } from '@/utils/rtl';

export interface ReportBuilderRef {
  resetBuilder: () => void;
}

const ReportBuilderComponent = forwardRef<ReportBuilderRef>((props, ref) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { activeModules, canManageModules } = useModulePermissions();
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    dataSource: '',
    selectedColumns: [],
    filters: [],
    name: ''
  });
  const [reportData, setReportData] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const isRootUser = canManageModules();
  const availableDataSources = ModuleDataSourceMapper.getAvailableDataSources(activeModules, isRootUser);

  useImperativeHandle(ref, () => ({
    resetBuilder: () => {
      setReportConfig({
        dataSource: '',
        selectedColumns: [],
        filters: [],
        name: ''
      });
      setReportData([]);
      setIsGenerating(false);
    }
  }));

  const handleDataSourceChange = (dataSource: string) => {
    setReportConfig(prev => ({
      ...prev,
      dataSource,
      selectedColumns: [],
      filters: []
    }));
    setReportData([]);
  };

  const handleColumnsChange = (columns: string[]) => {
    setReportConfig(prev => ({
      ...prev,
      selectedColumns: columns
    }));
  };

  const handleFiltersChange = (filters: FilterCriteria[]) => {
    setReportConfig(prev => ({
      ...prev,
      filters
    }));
  };

  const generateReport = async () => {
    if (!reportConfig.dataSource || reportConfig.selectedColumns.length === 0) {
      toast({
        title: 'Missing Configuration',
        description: 'Please select a data source and at least one column',
        variant: 'destructive'
      });
      return;
    }

    // Check if data source is available
    if (!ModuleDataSourceMapper.isDataSourceAvailable(reportConfig.dataSource, activeModules, isRootUser)) {
      const requiredModules = ModuleDataSourceMapper.getModulesForDataSource(reportConfig.dataSource);
      toast({
        title: 'Data Source Unavailable',
        description: `This data source requires: ${requiredModules.join(', ')}`,
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    try {
      const data = await ReportQueryEngine.generateReport(reportConfig);
      setReportData(data);
      toast({
        title: 'Report Generated',
        description: `Successfully generated report with ${data.length} rows`,
      });
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate report. Please check your configuration.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const canGenerate = reportConfig.dataSource && reportConfig.selectedColumns.length > 0 && 
    (isRootUser || availableDataSources.length > 0);

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-secondary to-accent rounded-xl">
          <FileBarChart className="h-6 w-6 text-secondary-foreground" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">{t('reports.reportBuilder')}</h2>
          <p className="text-muted-foreground">Build custom reports with advanced filtering and data selection</p>
        </div>
      </div>

      {/* Module Status Alert for non-root users */}
      {!isRootUser && availableDataSources.length === 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <Settings className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <p className="font-medium">No data sources available</p>
            <p className="text-sm">Contact your administrator to activate modules for your workspace.</p>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Card */}
      <div className="bg-gradient-theme-secondary p-6 rounded-xl border border-border">
        <div className={`flex items-center justify-between mb-6 rtl:flex-row-reverse`}>
          <h3 className={`text-lg font-semibold text-foreground ${getRTLAwareTextAlign('start')}`}>Report Configuration</h3>
          <div className={`flex space-x-2 rtl:space-x-reverse rtl:flex-row-reverse`}>
            <Button variant="outline" disabled className="rtl:flex-row-reverse">
              <Save className={`h-4 w-4 ${getRTLAwareIconPosition('before')}`} />
              {t('common.save')}
            </Button>
            <Button 
              onClick={generateReport}
              disabled={!canGenerate || isGenerating}
              className="rtl:flex-row-reverse"
            >
              <Play className={`h-4 w-4 ${getRTLAwareIconPosition('before')}`} />
              {isGenerating ? t('reports.generating') : t('reports.generateReport')}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className={getRTLAwareTextAlign('start')}>{t('reports.dataSource')}</CardTitle>
              </CardHeader>
              <CardContent>
                <DataSourceSelector
                  value={reportConfig.dataSource}
                  onChange={handleDataSourceChange}
                />
              </CardContent>
            </Card>

            {reportConfig.dataSource && (
              <Card>
                <CardHeader>
                  <CardTitle className={getRTLAwareTextAlign('start')}>{t('reports.selectColumns')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ColumnSelector
                    dataSource={reportConfig.dataSource}
                    selectedColumns={reportConfig.selectedColumns}
                    onChange={handleColumnsChange}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            {reportConfig.dataSource && (
              <Card>
                <CardHeader>
                  <CardTitle className={getRTLAwareTextAlign('start')}>{t('reports.filters')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CriteriaBuilder
                    dataSource={reportConfig.dataSource}
                    filters={reportConfig.filters}
                    onChange={handleFiltersChange}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className={`flex items-center justify-between rtl:flex-row-reverse ${getRTLAwareTextAlign('start')}`}>
                  <span>{t('reports.preview')}</span>
                  {reportData.length > 0 && (
                    <Button variant="outline" size="sm" className="rtl:flex-row-reverse">
                      <Download className={`h-4 w-4 ${getRTLAwareIconPosition('before')}`} />
                      {t('reports.export')}
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!isRootUser && availableDataSources.length === 0 ? (
                  <div className="text-center py-8">
                    <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className={`${getRTLAwareTextAlign('center')} text-muted-foreground mb-2`}>
                      No data sources available
                    </p>
                    <p className={`${getRTLAwareTextAlign('center')} text-sm text-muted-foreground`}>
                      Activate modules to access data for reporting.
                    </p>
                  </div>
                ) : !reportConfig.dataSource ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className={getRTLAwareTextAlign('center')}>{t('reports.selectDataSourceFirst')}</p>
                  </div>
                ) : reportConfig.selectedColumns.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className={getRTLAwareTextAlign('center')}>{t('reports.selectColumnsFirst')}</p>
                  </div>
                ) : reportData.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className={getRTLAwareTextAlign('center')}>{t('reports.clickGenerateToSeeResults')}</p>
                  </div>
                ) : (
                  <DynamicReportTable
                    data={reportData}
                    columns={reportConfig.selectedColumns}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
});

ReportBuilderComponent.displayName = 'ReportBuilder';

export const ReportBuilder = ReportBuilderComponent;
