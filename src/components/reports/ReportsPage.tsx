
import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReportBuilder } from './ReportBuilder';
import { PredefinedReports } from './PredefinedReports';
import { SavedReports } from './SavedReports';
import { AIReportBuilder } from './AIReportBuilder';
import { BarChart3, Settings, FileText, Plus, Sparkles } from 'lucide-react';

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
    switch (activeTab) {
      case 'ai-assistant':
        return <Sparkles className="h-4 w-4 mr-2" />;
      case 'builder':
        return <Settings className="h-4 w-4 mr-2" />;
      case 'predefined':
        return <Plus className="h-4 w-4 mr-2" />;
      case 'saved':
        return <Plus className="h-4 w-4 mr-2" />;
      default:
        return <Plus className="h-4 w-4 mr-2" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('navigation.reports')}</h1>
          <p className="text-gray-600 mt-1">{t('reports.subtitle')}</p>
        </div>
        {(activeTab === 'ai-assistant' || activeTab === 'builder') && (
          <Button onClick={handleNewReport}>
            {getButtonIcon()}
            {getButtonText()}
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ai-assistant" className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4" />
            <span>{t('reports.aiAssistant')}</span>
          </TabsTrigger>
          <TabsTrigger value="builder" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>{t('reports.reportBuilder')}</span>
          </TabsTrigger>
          <TabsTrigger value="predefined" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>{t('reports.predefinedReports')}</span>
          </TabsTrigger>
          <TabsTrigger value="saved" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>{t('reports.savedReports')}</span>
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
