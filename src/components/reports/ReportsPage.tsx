
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReportBuilder } from './ReportBuilder';
import { PredefinedReports } from './PredefinedReports';
import { SavedReports } from './SavedReports';
import { BarChart3, Settings, FileText, Plus } from 'lucide-react';

export function ReportsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('builder');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('navigation.reports')}</h1>
          <p className="text-gray-600 mt-1">{t('reports.subtitle')}</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          {t('reports.newReport')}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
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

        <TabsContent value="builder">
          <ReportBuilder />
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
