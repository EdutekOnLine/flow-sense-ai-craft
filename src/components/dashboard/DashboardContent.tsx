
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
      {/* Header with theme-aware gradient */}
      <div className="relative overflow-hidden bg-gradient-theme-primary rounded-2xl p-8 text-foreground border border-border">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-primary to-accent rounded-xl border border-border shadow-card">
                <Activity className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold text-foreground">{t('dashboard.title')}</h1>
                  <Badge className="bg-gradient-to-r from-accent to-accent/80 text-accent-foreground animate-pulse">
                    LIVE
                  </Badge>
                </div>
                <p className="text-muted-foreground text-lg">{t('dashboard.subtitle')}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-primary/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-24 h-24 bg-secondary/10 rounded-full blur-lg"></div>
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
              <div className="p-3 bg-gradient-to-br from-primary to-primary/70 rounded-xl shadow-card">
                <Inbox className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">{t('dashboard.myAssignedTasks')}</h2>
                <p className="text-muted-foreground">{t('dashboard.myAssignedTasksDescription')}</p>
              </div>
            </div>
            <div className="bg-gradient-theme-primary p-6 rounded-xl border border-border">
              <DashboardTasks onViewAllTasks={handleViewAllTasks} />
            </div>
          </div>

          {/* My Reusable Workflows Section - Show for ALL users */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-secondary to-secondary/70 rounded-xl shadow-card">
                <Repeat className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">{t('dashboard.myReusableWorkflows')}</h2>
                <p className="text-muted-foreground">{t('dashboard.myReusableWorkflowsDescription')}</p>
              </div>
            </div>
            <div className="bg-gradient-theme-secondary p-6 rounded-xl border border-border">
              <MyReusableWorkflows onStartWorkflow={handleStartWorkflow} />
            </div>
          </div>

          {/* Saved Workflows Section - Only show for users who can edit workflows */}
          {canEditWorkflows && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-accent to-accent/70 rounded-xl shadow-card">
                  <Workflow className="h-6 w-6 text-accent-foreground" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{getSavedWorkflowsContent().title}</h2>
                  <p className="text-muted-foreground">{getSavedWorkflowsContent().description}</p>
                </div>
              </div>
              <div className="bg-gradient-theme-accent p-6 rounded-xl border border-border">
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
              <Card className="border-2 border-primary/20 bg-gradient-theme-primary">
                <CardHeader className="text-center">
                  <div className="mx-auto p-3 bg-gradient-to-br from-primary to-accent rounded-xl w-fit mb-4 shadow-card">
                    <Sparkles className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-2xl text-foreground">{t('dashboard.welcomeTitle')}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground text-lg">
                    {t('dashboard.welcomeMessage')}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Activity feed sidebar - 1/3 width */}
        <div className="lg:col-span-1">
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-muted-foreground to-muted-foreground/70 rounded-xl shadow-card">
                <Activity className="h-6 w-6 text-muted" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">{t('dashboard.recentActivity')}</h2>
                <p className="text-muted-foreground">{t('dashboard.recentActivityDescription')}</p>
              </div>
            </div>
            <div className="bg-gradient-theme-secondary p-6 rounded-xl border border-border">
              <RealtimeActivityFeed />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
