
import React, { useState, forwardRef, useImperativeHandle, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { NaturalLanguageInput } from './NaturalLanguageInput';
import { DynamicReportTable } from './DynamicReportTable';
import { ReportConfig, FilterCriteria } from './types';
import { ReportQueryEngine } from './ReportQueryEngine';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Save, Download, RefreshCw, Sparkles } from 'lucide-react';
import { getRTLAwareTextAlign, getRTLAwareIconPosition } from '@/utils/rtl';

interface AIReportResponse {
  dataSource: string;
  selectedColumns: string[];
  filters: FilterCriteria[];
  name: string;
  explanation: string;
}

export interface AIReportBuilderRef {
  focusInput: () => void;
}

export const AIReportBuilder = forwardRef<AIReportBuilderRef>((props, ref) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [reportConfig, setReportConfig] = useState<ReportConfig | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [reportData, setReportData] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const naturalLanguageInputRef = useRef<{ focusInput: () => void } | null>(null);

  useImperativeHandle(ref, () => ({
    focusInput: () => {
      if (naturalLanguageInputRef.current) {
        naturalLanguageInputRef.current.focusInput();
      }
    }
  }));

  const handleQuerySubmit = async (query: string) => {
    setIsGenerating(true);
    setError('');
    setReportConfig(null);
    setReportData([]);
    setAiExplanation('');

    try {
      const { data, error } = await supabase.functions.invoke('ai-report-generator', {
        body: { query }
      });

      if (error) throw error;

      const aiResponse: AIReportResponse = data;
      
      const config: ReportConfig = {
        dataSource: aiResponse.dataSource,
        selectedColumns: aiResponse.selectedColumns,
        filters: aiResponse.filters || [],
        name: aiResponse.name || 'AI Generated Report'
      };

      setReportConfig(config);
      setAiExplanation(aiResponse.explanation || '');
      
      // Automatically generate the report
      await generateReport(config);

      toast({
        title: 'AI Report Generated',
        description: 'Successfully interpreted your query and generated a report configuration.',
      });
    } catch (error) {
      console.error('Failed to generate AI report:', error);
      setError(error.message || 'Failed to generate report. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to generate AI report. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateReport = async (config: ReportConfig) => {
    setIsLoadingData(true);
    try {
      const data = await ReportQueryEngine.generateReport(config);
      setReportData(data);
      toast({
        title: 'Report Data Loaded',
        description: `Successfully loaded ${data.length} rows of data`,
      });
    } catch (error) {
      console.error('Failed to load report data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load report data. Please check your configuration.',
        variant: 'destructive'
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleRefresh = () => {
    if (reportConfig) {
      generateReport(reportConfig);
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-primary to-secondary rounded-xl">
          <Sparkles className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">{t('reports.aiReportBuilder')}</h2>
          <p className="text-muted-foreground">{t('reports.aiSubtitle')}</p>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-gradient-theme-primary p-6 rounded-xl border border-border">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className={getRTLAwareTextAlign('start')}>{t('reports.naturalLanguageQuery')}</CardTitle>
              </CardHeader>
              <CardContent>
                <NaturalLanguageInput 
                  ref={naturalLanguageInputRef}
                  onQuerySubmit={handleQuerySubmit}
                  isLoading={isGenerating || isLoadingData}
                />
              </CardContent>
            </Card>

            {reportConfig && (
              <Card>
                <CardHeader>
                  <CardTitle className={`flex items-center justify-between gap-4 rtl:flex-row-reverse`}>
                    <span className={getRTLAwareTextAlign('start')}>{t('reports.generatedConfiguration')}</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleRefresh}
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
            )}
          </div>

          <div>
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
                {error ? (
                  <Alert variant="destructive">
                    <AlertDescription className={getRTLAwareTextAlign('start')} dir="auto">{error}</AlertDescription>
                  </Alert>
                ) : !reportConfig ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className={getRTLAwareTextAlign('center')}>{t('reports.enterQueryToGenerate')}</p>
                  </div>
                ) : isLoadingData ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className={getRTLAwareTextAlign('center')}>{t('reports.loadingReportData')}</p>
                  </div>
                ) : reportData.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className={getRTLAwareTextAlign('center')}>{t('reports.noDataFound')}</p>
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

AIReportBuilder.displayName = 'AIReportBuilder';
