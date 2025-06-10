
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataSourceSelector } from './DataSourceSelector';
import { CriteriaBuilder } from './CriteriaBuilder';
import { ColumnSelector } from './ColumnSelector';
import { DynamicReportTable } from './DynamicReportTable';
import { ReportConfig, FilterCriteria } from './types';
import { ReportQueryEngine } from './ReportQueryEngine';
import { Play, Save, Download } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export function ReportBuilder() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    dataSource: '',
    selectedColumns: [],
    filters: [],
    name: ''
  });
  const [reportData, setReportData] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

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

  const canGenerate = reportConfig.dataSource && reportConfig.selectedColumns.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('reports.reportBuilder')}</h1>
        <div className="flex space-x-2">
          <Button variant="outline" disabled>
            <Save className="h-4 w-4 mr-2" />
            {t('common.save')}
          </Button>
          <Button 
            onClick={generateReport}
            disabled={!canGenerate || isGenerating}
          >
            <Play className="h-4 w-4 mr-2" />
            {isGenerating ? t('reports.generating') : t('reports.generateReport')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('reports.dataSource')}</CardTitle>
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
                <CardTitle>{t('reports.selectColumns')}</CardTitle>
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
                <CardTitle>{t('reports.filters')}</CardTitle>
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
              <CardTitle className="flex items-center justify-between">
                {t('reports.preview')}
                {reportData.length > 0 && (
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    {t('reports.export')}
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!reportConfig.dataSource ? (
                <div className="text-center py-8 text-gray-500">
                  <p>{t('reports.selectDataSourceFirst')}</p>
                </div>
              ) : reportConfig.selectedColumns.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>{t('reports.selectColumnsFirst')}</p>
                </div>
              ) : reportData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>{t('reports.clickGenerateToSeeResults')}</p>
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
  );
}
