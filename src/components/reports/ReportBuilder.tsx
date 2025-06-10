
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MultiDataSourceSelector } from './MultiDataSourceSelector';
import { MultiCriteriaBuilder } from './MultiCriteriaBuilder';
import { MultiColumnSelector } from './MultiColumnSelector';
import { DynamicReportTable } from './DynamicReportTable';
import { MultiSourceReportTable } from './MultiSourceReportTable';
import { ReportConfig, FilterCriteria, DataSourceWithJoins, SelectedColumn } from './types';
import { ReportQueryEngine } from './ReportQueryEngine';
import { Play, Save, Download } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export function ReportBuilder() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    dataSources: [],
    selectedColumns: [],
    filters: [],
    name: ''
  });
  const [reportData, setReportData] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDataSourcesChange = (dataSources: DataSourceWithJoins[]) => {
    setReportConfig(prev => ({
      ...prev,
      dataSources,
      selectedColumns: prev.selectedColumns.filter(col => 
        dataSources.some(ds => ds.sourceId === col.sourceId)
      ),
      filters: prev.filters.filter(filter => 
        dataSources.some(ds => ds.sourceId === filter.sourceId)
      )
    }));
    setReportData([]);
  };

  const handleColumnsChange = (columns: SelectedColumn[]) => {
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
    if (reportConfig.dataSources.length === 0 || reportConfig.selectedColumns.length === 0) {
      toast({
        title: 'Missing Configuration',
        description: 'Please select at least one data source and columns',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    try {
      console.log('Generating report with config:', reportConfig);
      const data = await ReportQueryEngine.generateReport(reportConfig);
      console.log('Raw report data:', data);
      console.log('Data keys sample:', data.length > 0 ? Object.keys(data[0]) : 'No data');
      
      setReportData(data);
      toast({
        title: 'Report Generated',
        description: `Successfully generated report with ${data.length} rows from ${reportConfig.dataSources.length} data source(s)`,
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

  // Extract original column names for display (no longer needed as table will auto-detect)
  const getDisplayColumns = () => {
    return reportConfig.selectedColumns.map(col => col.alias || col.column);
  };

  // Determine if this is a multi-source report
  const isMultiSource = reportConfig.dataSources.length > 1;
  const hasMultiSourceData = reportData.length > 0 && reportData[0]._source;

  const canGenerate = reportConfig.dataSources.length > 0 && reportConfig.selectedColumns.length > 0;

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
              <CardTitle>{t('reports.dataSources')}</CardTitle>
            </CardHeader>
            <CardContent>
              <MultiDataSourceSelector
                dataSources={reportConfig.dataSources}
                onChange={handleDataSourcesChange}
              />
            </CardContent>
          </Card>

          {reportConfig.dataSources.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t('reports.selectColumns')}</CardTitle>
              </CardHeader>
              <CardContent>
                <MultiColumnSelector
                  dataSources={reportConfig.dataSources}
                  selectedColumns={reportConfig.selectedColumns}
                  onChange={handleColumnsChange}
                />
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {reportConfig.dataSources.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t('reports.filters')}</CardTitle>
              </CardHeader>
              <CardContent>
                <MultiCriteriaBuilder
                  dataSources={reportConfig.dataSources}
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
              {reportConfig.dataSources.length === 0 ? (
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
                <>
                  {isMultiSource || hasMultiSourceData ? (
                    <MultiSourceReportTable
                      data={reportData}
                      columns={getDisplayColumns()}
                    />
                  ) : (
                    <DynamicReportTable
                      data={reportData}
                      columns={getDisplayColumns()}
                    />
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
