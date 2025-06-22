import React, { useState, forwardRef, useImperativeHandle, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NaturalLanguageInput } from './NaturalLanguageInput';
import { ModuleStatusAlert } from './ModuleStatusAlert';
import { ReportConfigurationDisplay } from './ReportConfigurationDisplay';
import { ReportPreviewPanel } from './ReportPreviewPanel';
import { ReportConfig, FilterCriteria } from './types';
import { ReportQueryEngine } from './ReportQueryEngine';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useModulePermissions } from '@/hooks/useModulePermissions';
import { ModuleDataSourceMapper } from '@/utils/moduleDataSourceMapper';
import { Sparkles } from 'lucide-react';
import { getRTLAwareTextAlign } from '@/utils/rtl';

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
  const { activeModules, canManageModules, getModuleDisplayName } = useModulePermissions();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [reportConfig, setReportConfig] = useState<ReportConfig | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [reportData, setReportData] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const naturalLanguageInputRef = useRef<{ focusInput: () => void } | null>(null);

  const isRootUser = canManageModules();
  const availableDataSources = ModuleDataSourceMapper.getAvailableDataSources(activeModules, isRootUser);

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
        body: { 
          query,
          activeModules,
          isRootUser
        }
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

      {/* Module Status Alert */}
      <ModuleStatusAlert
        isRootUser={isRootUser}
        availableDataSources={availableDataSources}
        activeModules={activeModules}
        getModuleDisplayName={getModuleDisplayName}
      />

      {/* Input Section - Full Width */}
      <div className="bg-gradient-theme-primary p-6 rounded-xl border border-border">
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
                activeModules={activeModules}
                isRootUser={isRootUser}
              />
            </CardContent>
          </Card>

          {reportConfig && (
            <ReportConfigurationDisplay
              reportConfig={reportConfig}
              aiExplanation={aiExplanation}
              isLoadingData={isLoadingData}
              onRefresh={handleRefresh}
              getModuleDisplayName={getModuleDisplayName}
            />
          )}
        </div>
      </div>

      {/* Report Preview Section - Full Width Below */}
      <div className="bg-gradient-theme-primary p-6 rounded-xl border border-border">
        <ReportPreviewPanel
          reportConfig={reportConfig}
          reportData={reportData}
          error={error}
          isLoadingData={isLoadingData}
          availableDataSources={availableDataSources}
          isRootUser={isRootUser}
        />
      </div>
    </div>
  );
});

AIReportBuilder.displayName = 'AIReportBuilder';
