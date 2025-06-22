
import React from 'react';
import { ModularTasksPanel } from './ModularTasksPanel';
import { ModularAssetsPanel } from './ModularAssetsPanel'; 
import { SavedWorkflows } from './SavedWorkflows';
import { ModuleMetricsCards } from './ModuleMetricsCards';
import { ModuleQuickActions } from './ModuleQuickActions';
import { ModuleIntegrationOverview } from './ModuleIntegrationOverview';
import { ModularActivityFeed } from './ModularActivityFeed';
import { useWorkflowInstances } from '@/hooks/useWorkflowInstances';
import { useWorkflowPermissions } from '@/hooks/useWorkflowPermissions';
import { useModulePermissions } from '@/hooks/useModulePermissions';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { 
  Activity,
  Sparkles,
  Inbox,
  Repeat,
  Workflow
} from 'lucide-react';

interface DashboardContentProps {
  onOpenWorkflow?: (workflowId: string) => void;
}

export default function DashboardContent({ onOpenWorkflow }: DashboardContentProps) {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const { startWorkflow } = useWorkflowInstances();
  const { canEditWorkflows } = useWorkflowPermissions();
  const { canAccessModule, getAccessibleModules } = useModulePermissions();

  const accessibleModules = getAccessibleModules();
  const hasWorkflowAccess = canAccessModule('neura-flow');
  const hasMultipleModules = accessibleModules.length > 1;

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
    if (hasWorkflowAccess) {
      window.location.hash = 'workflow-inbox';
    } else {
      // Navigate to appropriate module's task view
      if (canAccessModule('neura-crm')) {
        window.location.hash = 'crm';
      } else if (canAccessModule('neura-forms')) {
        window.location.hash = 'forms';
      } else if (canAccessModule('neura-edu')) {
        window.location.hash = 'education';
      }
    }
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
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
                <p className="text-muted-foreground text-lg">
                  {hasMultipleModules 
                    ? 'Multi-module business overview and management hub'
                    : t('dashboard.subtitle')
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-primary/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-24 h-24 bg-secondary/10 rounded-full blur-lg"></div>
      </div>

      {/* Dynamic Module Metrics */}
      <ModuleMetricsCards />

      {/* Two-column layout for main content and sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content - 2/3 width */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Actions */}
          <ModuleQuickActions />

          {/* Module Integration Overview */}
          <ModuleIntegrationOverview />

          {/* My Tasks Section - Now modular */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-primary to-primary/70 rounded-xl shadow-card">
                <Inbox className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {hasWorkflowAccess ? t('dashboard.myAssignedTasks') : 'My Tasks'}
                </h2>
                <p className="text-muted-foreground">
                  {hasWorkflowAccess ? t('dashboard.myAssignedTasksDescription') : 'Tasks and activities from your active modules'}
                </p>
              </div>
            </div>
            <div className="bg-gradient-theme-primary p-6 rounded-xl border border-border">
              <ModularTasksPanel onViewAllTasks={handleViewAllTasks} />
            </div>
          </div>

          {/* My Assets Section - Now modular */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-secondary to-secondary/70 rounded-xl shadow-card">
                <Repeat className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {hasWorkflowAccess ? t('dashboard.myReusableWorkflows') : 'My Assets & Templates'}
                </h2>
                <p className="text-muted-foreground">
                  {hasWorkflowAccess ? t('dashboard.myReusableWorkflowsDescription') : 'Reusable templates and assets from your active modules'}
                </p>
              </div>
            </div>
            <div className="bg-gradient-theme-secondary p-6 rounded-xl border border-border">
              <ModularAssetsPanel onStartWorkflow={handleStartWorkflow} />
            </div>
          </div>

          {/* Saved Workflows Section - Only show for workflow users who can edit */}
          {hasWorkflowAccess && canEditWorkflows && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-accent to-accent/70 rounded-xl shadow-card">
                  <Workflow className="h-6 w-6 text-accent-foreground" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {profile?.role === 'admin' ? t('dashboard.allSavedWorkflows') : t('dashboard.mySavedWorkflows')}
                  </h2>
                  <p className="text-muted-foreground">
                    {profile?.role === 'admin' ? t('dashboard.allSavedWorkflowsDescription') : t('dashboard.mySavedWorkflowsDescription')}
                  </p>
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

          {/* Welcome message for users without any active modules */}
          {accessibleModules.length <= 1 && (
            <div className="space-y-6">
              <Card className="border-2 border-primary/20 bg-gradient-theme-primary">
                <CardHeader className="text-center">
                  <div className="mx-auto p-3 bg-gradient-to-br from-primary to-accent rounded-xl w-fit mb-4 shadow-card">
                    <Sparkles className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-2xl text-foreground">Welcome to NeuraCore</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground text-lg">
                    Your business management platform. Contact your administrator to activate additional modules and unlock more features.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Activity feed sidebar - 1/3 width - Now modular */}
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
              <ModularActivityFeed />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
