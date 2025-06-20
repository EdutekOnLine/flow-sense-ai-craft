
import React from 'react';
import { useAppLoadingState } from '@/hooks/useAppLoadingState';
import { useTranslation } from 'react-i18next';
import { ModuleGuard } from '@/components/modules/ModuleGuard';
import { Loader2 } from 'lucide-react';

// Component imports
import UserManagement from '@/components/admin/UserManagement';
import ModuleManagement from '@/components/admin/ModuleManagement';
import DashboardContent from '@/components/dashboard/DashboardContent';
import WorkflowBuilder from '@/modules/neura-flow/components/WorkflowBuilder';
import { WorkflowInbox } from '@/components/workflow/WorkflowInbox';
import { ReportsPage } from '@/components/reports/ReportsPage';
import { ThemeSettings } from '@/components/theme/ThemeSettings';
import { CRMDashboard } from '@/modules/neura-crm';
import { FormBuilder } from '@/modules/neura-forms';
import { LearningManagementSystem } from '@/modules/neura-edu';

interface DashboardContentRendererProps {
  activeTab: string;
  children?: React.ReactNode;
  onOpenWorkflow: (workflowId: string) => void;
}

export function DashboardContentRenderer({ 
  activeTab, 
  children, 
  onOpenWorkflow 
}: DashboardContentRendererProps) {
  const { isCriticalLoading, hasMinimumData, profile, isRootUser } = useAppLoadingState();
  const { t } = useTranslation();

  // Show loading state only for critical loading
  if (isCriticalLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  // If we don't have minimum data, show error state
  if (!hasMinimumData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Unable to load application</h2>
          <p className="text-muted-foreground">Please refresh the page or try again later.</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'workflow-inbox':
        return (
          <ModuleGuard moduleName="neura-flow">
            <WorkflowInbox />
          </ModuleGuard>
        );
      case 'users':
        return ['admin', 'manager', 'root'].includes(profile?.role || '') ? <UserManagement /> : <DashboardContent onOpenWorkflow={onOpenWorkflow} />;
      case 'module-management':
        return <ModuleManagement />;
      case 'workflow-builder':
        return (
          <ModuleGuard moduleName="neura-flow">
            <WorkflowBuilder />
          </ModuleGuard>
        );
      case 'reports':
        return <ReportsPage />;
      case 'templates':
        return (
          <ModuleGuard moduleName="neura-flow">
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">{t('navigation.templates')}</h2>
              <p className="text-muted-foreground">Workflow templates functionality coming soon...</p>
            </div>
          </ModuleGuard>
        );
      case 'crm':
        return (
          <ModuleGuard moduleName="neura-crm">
            <CRMDashboard />
          </ModuleGuard>
        );
      case 'forms':
        return (
          <ModuleGuard moduleName="neura-forms">
            <FormBuilder />
          </ModuleGuard>
        );
      case 'education':
        return (
          <ModuleGuard moduleName="neura-edu">
            <LearningManagementSystem />
          </ModuleGuard>
        );
      case 'settings':
        return <ThemeSettings />;
      default:
        return children ? React.cloneElement(children as React.ReactElement, { onOpenWorkflow }) : <DashboardContent onOpenWorkflow={onOpenWorkflow} />;
    }
  };

  return <>{renderContent()}</>;
}
