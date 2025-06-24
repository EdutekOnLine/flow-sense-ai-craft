
import React from 'react';
import DashboardContent from '@/components/dashboard/DashboardContent';
import { WorkflowInbox } from '@/components/workflow/WorkflowInbox';
import WorkflowBuilder from '@/components/workflow-builder/WorkflowBuilder';
import { SavedWorkflows } from '@/components/dashboard/SavedWorkflows';
import UserManagement from '@/components/admin/UserManagement';
import WorkspaceManagement from '@/components/admin/WorkspaceManagement';
import { ReportsPage } from '@/components/reports/ReportsPage';
import ModuleManagement from '@/components/admin/ModuleManagement';
import { ThemeSettings } from '@/components/theme/ThemeSettings';
import { CrmDashboard } from '@/components/crm/CrmDashboard';
import { useModulePermissions } from '@/hooks/useModulePermissions';

interface DashboardContentRendererProps {
  activeTab: string;
  onOpenWorkflow?: (workflowId: string) => void;
}

export function DashboardContentRenderer({ activeTab, onOpenWorkflow }: DashboardContentRendererProps) {
  const { canAccessModule } = useModulePermissions();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardContent onOpenWorkflow={onOpenWorkflow} />;
      case 'workflow-inbox':
        if (!canAccessModule('neura-flow')) return <div>Access denied</div>;
        return <WorkflowInbox />;
      case 'workflow-builder':
        if (!canAccessModule('neura-flow')) return <div>Access denied</div>;
        return <WorkflowBuilder />;
      case 'templates':
        if (!canAccessModule('neura-flow')) return <div>Access denied</div>;
        return <SavedWorkflows />;
      case 'crm':
        if (!canAccessModule('neura-crm')) return <div>Access denied</div>;
        return <CrmDashboard />;
      case 'forms':
        if (!canAccessModule('neura-forms')) return <div>Access denied</div>;
        return <div>Forms module coming soon...</div>;
      case 'education':
        if (!canAccessModule('neura-edu')) return <div>Access denied</div>;
        return <div>Education module coming soon...</div>;
      case 'users':
        return <UserManagement />;
      case 'workspace-management':
        return <WorkspaceManagement />;
      case 'reports':
        return <ReportsPage />;
      case 'module-management':
        return <ModuleManagement />;
      case 'settings':
        return <ThemeSettings />;
      default:
        return <DashboardContent onOpenWorkflow={onOpenWorkflow} />;
    }
  };

  return <div className="w-full">{renderContent()}</div>;
}
