
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Users, Brain, RefreshCw } from 'lucide-react';
import { useWorkflowPermissions } from '@/hooks/useWorkflowPermissions';
import { WorkflowPerformanceChart } from './WorkflowPerformanceChart';
import { UserPerformanceTable } from './UserPerformanceTable';
import { DepartmentAnalyticsChart } from './DepartmentAnalyticsChart';
import { AIInsightsPanel } from './AIInsightsPanel';
import { WorkflowTrendsChart } from './WorkflowTrendsChart';
import { useAIInsights, useGenerateAIInsights } from '@/hooks/useAnalytics';
import { toast } from 'sonner';

export default function ReportsDashboard() {
  const { t } = useTranslation();
  const { canViewUsers, isAdmin } = useWorkflowPermissions();
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  
  const { data: insights, refetch: refetchInsights } = useAIInsights();
  const generateInsights = useGenerateAIInsights();

  const handleGenerateInsights = async () => {
    setIsGeneratingInsights(true);
    try {
      const result = await generateInsights();
      toast.success(`Generated ${result.insights_generated} new insights`);
      refetchInsights();
    } catch (error) {
      console.error('Error generating insights:', error);
      toast.error('Failed to generate insights');
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('reports.title')}</h1>
          <p className="text-gray-600 mt-2">{t('reports.description')}</p>
        </div>
        <Button 
          onClick={handleGenerateInsights}
          disabled={isGeneratingInsights}
          className="flex items-center gap-2"
        >
          <Brain className={`h-4 w-4 ${isGeneratingInsights ? 'animate-spin' : ''}`} />
          {isGeneratingInsights ? 'Generating...' : 'Generate AI Insights'}
        </Button>
      </div>

      {/* AI Insights Panel */}
      {insights && insights.length > 0 && (
        <AIInsightsPanel insights={insights} />
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            {t('reports.tabs.overview')}
          </TabsTrigger>
          <TabsTrigger value="workflows" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            {t('reports.tabs.workflows')}
          </TabsTrigger>
          {canViewUsers && (
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {t('reports.tabs.users')}
            </TabsTrigger>
          )}
          {isAdmin && (
            <TabsTrigger value="departments" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {t('reports.tabs.departments')}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  {t('reports.overview.trends')}
                </CardTitle>
                <CardDescription>
                  {t('reports.overview.trendsDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WorkflowTrendsChart />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  {t('reports.overview.performance')}
                </CardTitle>
                <CardDescription>
                  {t('reports.overview.performanceDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WorkflowPerformanceChart />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('reports.workflows.performance')}</CardTitle>
              <CardDescription>
                {t('reports.workflows.performanceDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WorkflowPerformanceChart detailed />
            </CardContent>
          </Card>
        </TabsContent>

        {canViewUsers && (
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('reports.users.performance')}</CardTitle>
                <CardDescription>
                  {t('reports.users.performanceDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserPerformanceTable />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="departments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('reports.departments.analytics')}</CardTitle>
                <CardDescription>
                  {t('reports.departments.analyticsDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DepartmentAnalyticsChart />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
