
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
        if (aiInputRef.current) {
          aiInputRef.current.focusInput();
        }
        break;
      case 'builder':
        if (reportBuilderRef.current) {
          reportBuilderRef.current.resetBuilder();
        }
        break;
      case 'predefined':
        setActiveTab('builder');
        setTimeout(() => {
          if (reportBuilderRef.current) {
            reportBuilderRef.current.resetBuilder();
          }
        }, 100);
        break;
      case 'saved':
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
    <div className="space-y-8">
      {/* Gradient Header */}
      <div className="relative bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 border border-purple-200 rounded-xl p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/80 via-pink-50/80 to-purple-50/80 rounded-xl"></div>
        <div className="relative">
          <div className={`flex items-start justify-between gap-4`}>
            <div className={`flex items-start gap-4 ${getRTLAwareTextAlign('start')}`}>
              <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-gray-900">{t('navigation.reports')}</h1>
                <p className="text-lg text-gray-600">{t('reports.subtitle')}</p>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
                    Analytics Hub
                  </span>
                </div>
              </div>
            </div>
            {(activeTab === 'ai-assistant' || activeTab === 'builder') && (
              <div className="flex-shrink-0">
                <Button 
                  onClick={handleNewReport} 
                  className={`bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg flex items-center gap-2 rtl:flex-row-reverse`}
                >
                  {getButtonIcon()}
                  <span>{getButtonText()}</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Card */}
      <Card className="bg-gradient-to-br from-purple-50/30 to-pink-50/30 border-purple-200/50">
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6" dir="ltr">
            <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm">
              <TabsTrigger value="ai-assistant" className={`flex items-center gap-2 rtl:flex-row-reverse ${getRTLAwareTextAlign('center')} data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700`}>
                <Sparkles className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{t('reports.aiAssistant')}</span>
              </TabsTrigger>
              <TabsTrigger value="builder" className={`flex items-center gap-2 rtl:flex-row-reverse ${getRTLAwareTextAlign('center')} data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700`}>
                <FileBarChart className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{t('reports.reportBuilder')}</span>
              </TabsTrigger>
              <TabsTrigger value="predefined" className={`flex items-center gap-2 rtl:flex-row-reverse ${getRTLAwareTextAlign('center')} data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700`}>
                <BarChart3 className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{t('reports.predefinedReports')}</span>
              </TabsTrigger>
              <TabsTrigger value="saved" className={`flex items-center gap-2 rtl:flex-row-reverse ${getRTLAwareTextAlign('center')} data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700`}>
                <FileText className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{t('reports.savedReports')}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ai-assistant" className="mt-6">
              <AIReportBuilder ref={aiInputRef} />
            </TabsContent>

            <TabsContent value="builder" className="mt-6">
              <ReportBuilder ref={reportBuilderRef} />
            </TabsContent>

            <TabsContent value="predefined" className="mt-6">
              <PredefinedReports />
            </TabsContent>

            <TabsContent value="saved" className="mt-6">
              <SavedReports />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
