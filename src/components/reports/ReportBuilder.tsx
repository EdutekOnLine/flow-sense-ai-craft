
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataSourceSelector } from './DataSourceSelector';
import { CriteriaBuilder } from './CriteriaBuilder';
import { ColumnSelector } from './ColumnSelector';
import { DynamicReportTable } from './DynamicReportTable';
import { ReportConfig, FilterCriteria } from './types';
import { Play, Save, Download } from 'lucide-react';

export function ReportBuilder() {
  const { t } = useTranslation();
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
      return;
    }

    setIsGenerating(true);
    try {
      // This will be implemented in the query engine
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportConfig)
      });
      
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

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
            disabled={!reportConfig.dataSource || reportConfig.selectedColumns.length === 0 || isGenerating}
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
          {reportData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {t('reports.preview')}
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    {t('reports.export')}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DynamicReportTable
                  data={reportData}
                  columns={reportConfig.selectedColumns}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
