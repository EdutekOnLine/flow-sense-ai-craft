
import React from 'react';
import { ModuleMetricsCards } from './ModuleMetricsCards';
import { ModuleQuickActions } from './ModuleQuickActions';
import { ModuleIntegrationOverview } from './ModuleIntegrationOverview';
import { PersonalWelcomeSection } from './personalized/PersonalWelcomeSection';
import { MyRecentActivityTimeline } from './personalized/MyRecentActivityTimeline';
import { useModulePermissions } from '@/hooks/useModulePermissions';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';

interface DashboardContentProps {
  onOpenWorkflow?: (workflowId: string) => void;
}

export default function DashboardContent({ onOpenWorkflow }: DashboardContentProps) {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const { canAccessModule, getAccessibleModules } = useModulePermissions();

  const accessibleModules = getAccessibleModules();
  const hasWorkflowAccess = canAccessModule('neura-flow');
  const hasMultipleModules = accessibleModules.length > 1;

  return (
    <div className="space-y-8">
      {/* Personal Welcome Section */}
      <PersonalWelcomeSection />

      {/* Dynamic Module Metrics */}
      <ModuleMetricsCards />

      {/* Main content layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Actions */}
          <ModuleQuickActions />

          {/* Module Integration Overview */}
          <ModuleIntegrationOverview />
        </div>
        
        {/* Right column - Recent Activity */}
        <div className="space-y-8">
          <MyRecentActivityTimeline />
        </div>
      </div>
    </div>
  );
}
