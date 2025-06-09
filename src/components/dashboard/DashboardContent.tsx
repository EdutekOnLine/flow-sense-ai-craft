
import React, { useState, useEffect } from 'react';
import { SavedWorkflows } from './SavedWorkflows';
import { DashboardTasks } from './DashboardTasks';
import { MyReusableWorkflows } from './MyReusableWorkflows';
import { LiveMetricsCards } from './LiveMetricsCards';
import { RealtimeActivityFeed } from './RealtimeActivityFeed';
import { useWorkflowInstances } from '@/hooks/useWorkflowInstances';
import { useWorkflowPermissions } from '@/hooks/useWorkflowPermissions';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { 
  Workflow, 
  Activity,
  Sparkles,
  Inbox,
  Repeat
} from 'lucide-react';

interface DashboardContentProps {
  onOpenWorkflow?: (workflowId: string) => void;
}

export default function DashboardContent({ onOpenWorkflow }: DashboardContentProps) {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const { 
    startWorkflow
  } = useWorkflowInstances();
  
  const { canEditWorkflows } = useWorkflowPermissions();

  const handleStartWorkflow = async (workflowId: string, startData: any) => {
    try {
      await startWorkflow(workflowId, startData);
      toast.success(t('workflow.launchSuccess'));
    } catch (error) {
      console.error('Error launching workflow:', error);
      toast.error(t('workflow.launchError'));
    }
  };

  const handleViewAllTasks = () => {
    // Switch to the workflow-inbox tab
    window.location.hash = 'workflow-inbox';
    // Trigger a custom event to update the active tab
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  };

  // Dynamic content based on user role
  const getSavedWorkflowsContent = () => {
    if (profile?.role === 'admin') {
      return {
        title: t('dashboard.allSavedWorkflows'),
        description: t('dashboard.allSavedWorkflowsDescription')
      };
    }
    return {
      title: t('dashboard.mySavedWorkflows'),
      description: t('dashboard.mySavedWorkflowsDescription')
    };
  };

  return (
    <div className="space-y-8">
      {/* Header with colorful gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-blue-600 to-teal-500 rounded-2xl p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Activity className="h-8 w-8" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold">{t('dashboard.title')}</h1>
                  <Badge className="bg-green-500 text-white animate-pulse">
                    LIVE
                  </Badge>
                </div>
                <p className="text-purple-100 text-lg">{t('dashboard.subtitle')}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-24 h-24 bg-white/10 rounded-full blur-lg"></div>
      </div>

      {/* Live Metrics Cards */}
      <LiveMetricsCards />

      {/* Two-column layout for main content and activity feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content - 2/3 width */}
        <div className="lg:col-span-2 space-y-8">
          {/* My Assigned Tasks Section - Show for ALL users */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <Inbox className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{t('dashboard.myAssignedTasks')}</h2>
                <p className="text-gray-600">{t('dashboard.myAssignedTasksDescription')}</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
              <DashboardTasks onViewAllTasks={handleViewAllTasks} />
            </div>
          </div>

          {/* My Reusable Workflows Section - Show for ALL users */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                <Repeat className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{t('dashboard.myReusableWorkflows')}</h2>
                <p className="text-gray-600">{t('dashboard.myReusableWorkflowsDescription')}</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
              <MyReusableWorkflows onStartWorkflow={handleStartWorkflow} />
            </div>
          </div>

          {/* Saved Workflows Section - Only show for users who can edit workflows */}
          {canEditWorkflows && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                  <Workflow className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{getSavedWorkflowsContent().title}</h2>
                  <p className="text-gray-600">{getSavedWorkflowsContent().description}</p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                <SavedWorkflows 
                  onOpenWorkflow={onOpenWorkflow}
                  onStartWorkflow={handleStartWorkflow}
                />
              </div>
            </div>
          )}

          {/* Message for employees */}
          {!canEditWorkflows && (
            <div className="space-y-6">
              <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardHeader className="text-center">
                  <div className="mx-auto p-3 bg-blue-500 rounded-xl w-fit mb-4">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-blue-900">{t('dashboard.welcomeTitle')}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-blue-700 text-lg">
                    {t('dashboard.welcomeMessage')}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Activity feed sidebar - 1/3 width */}
        <div className="lg:col-span-1">
          <RealtimeActivityFeed />
        </div>
      </div>
    </div>
  );
}
