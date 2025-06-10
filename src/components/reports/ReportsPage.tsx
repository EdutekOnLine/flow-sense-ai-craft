
import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReportBuilder } from './ReportBuilder';
import { PredefinedReports } from './PredefinedReports';
import { SavedReports } from './SavedReports';
import { AIReportBuilder } from './AIReportBuilder';
import { BarChart3, FileBarChart, FileText, Plus, Sparkles } from 'lucide-react';
import { getRTLAwareTextAlign, getRTLAwareIconPosition } from '@/utils/rtl';

export function ReportsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('ai-assistant');
  const aiInputRef = useRef<{ focusInput: () => void } | null>(null);
  const reportBuilderRef = useRef<{ resetBuilder: () => void } | null>(null);

  const handleNewReport = () => {
    switch (activeTab) {
      case 'ai-assistant':
        // Focus the AI input and add a helpful prompt
        if (aiInputRef.current) {
          aiInputRef.current.focusInput();
        }
        break;
      case 'builder':
        // Reset the report builder to start fresh
        if (reportBuilderRef.current) {
          reportBuilderRef.current.resetBuilder();
        }
        break;
      case 'predefined':
        // Switch to builder tab for custom template creation
        setActiveTab('builder');
        setTimeout(() => {
          if (reportBuilderRef.current) {
            reportBuilderRef.current.resetBuilder();
          }
        }, 100);
        break;
      case 'saved':
        // Switch to AI assistant for easy report creation
        setActiveTab('ai-assistant');
        setTimeout(() => {
          if (aiInputRef.current) {
            aiInputRef.current.focusInput();
          }
        }, 100);
        break;
      default:
        setActiveTab('ai-assistant');
    }
  };

  const getButtonText = () => {
    switch (activeTab) {
      case 'ai-assistant':
        return t('reports.generateAIReport');
      case 'builder':
        return t('reports.newReport');
      case 'predefined':
        return t('reports.createReport');
      case 'saved':
        return t('reports.newReport');
      default:
        return t('reports.newReport');
    }
  };

  const getButtonIcon = () => {
    const iconClass = getRTLAwareIconPosition('before');
    switch (activeTab) {
      case 'ai-assistant':
        return <Sparkles className={`h-4 w-4 ${iconClass}`} />;
      case 'builder':
        return <FileBarChart className={`h-4 w-4 ${iconClass}`} />;
      case 'predefined':
        return <Plus className={`h-4 w-4 ${iconClass}`} />;
      case 'saved':
        return <Plus className={`h-4 w-4 ${iconClass}`} />;
      default:
        return <Plus className={`h-4 w-4 ${iconClass}`} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className={`flex items-start justify-between gap-4 rtl:flex-row-reverse`}>
        <div className={`flex-1 space-y-1 ${getRTLAwareTextAlign('start')}`}>
          <h1 className="text-3xl font-bold">{t('navigation.reports')}</h1>
          <p className="text-muted-foreground">{t('reports.subtitle')}</p>
        </div>
        {(activeTab === 'ai-assistant' || activeTab === 'builder') && (
          <div className="flex-shrink-0">
            <Button onClick={handleNewReport} className={`flex items-center gap-2 rtl:flex-row-reverse`}>
              {getButtonIcon()}
              <span>{getButtonText()}</span>
            </Button>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6" dir="ltr">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ai-assistant" className={`flex items-center gap-2 rtl:flex-row-reverse ${getRTLAwareTextAlign('center')}`}>
            <Sparkles className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{t('reports.aiAssistant')}</span>
          </TabsTrigger>
          <TabsTrigger value="builder" className={`flex items-center gap-2 rtl:flex-row-reverse ${getRTLAwareTextAlign('center')}`}>
            <FileBarChart className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{t('reports.reportBuilder')}</span>
          </TabsTrigger>
          <TabsTrigger value="predefined" className={`flex items-center gap-2 rtl:flex-row-reverse ${getRTLAwareTextAlign('center')}`}>
            <BarChart3 className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{t('reports.predefinedReports')}</span>
          </TabsTrigger>
          <TabsTrigger value="saved" className={`flex items-center gap-2 rtl:flex-row-reverse ${getRTLAwareTextAlign('center')}`}>
            <FileText className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{t('reports.savedReports')}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai-assistant">
          <AIReportBuilder ref={aiInputRef} />
        </TabsContent>

        <TabsContent value="builder">
          <ReportBuilder ref={reportBuilderRef} />
        </TabsContent>

        <TabsContent value="predefined">
          <PredefinedReports />
        </TabsContent>

        <TabsContent value="saved">
          <SavedReports />
        </TabsContent>
      </Tabs>
    </div>
  );
}
