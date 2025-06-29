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
import { CrmContactsPage } from '@/components/crm/pages/CrmContactsPage';
import { CrmCompaniesPage } from '@/components/crm/pages/CrmCompaniesPage';
import { CrmTasksPage } from '@/components/crm/pages/CrmTasksPage';
import { CrmPipelinePage } from '@/components/crm/pages/CrmPipelinePage';
import { CrmAnalyticsPage } from '@/components/crm/pages/CrmAnalyticsPage';
import { WorkflowDashboard } from '@/components/workflow/WorkflowDashboard';
import { WorkflowAnalyticsPage } from '@/components/workflow/pages/WorkflowAnalyticsPage';
import { CrmCommunicationsPage } from '@/components/crm/pages/CrmCommunicationsPage';
import { useModulePermissions } from '@/hooks/useModulePermissions';
import { TeamManagement } from '@/components/admin/TeamManagement';

interface DashboardContentRendererProps {
  activeTab: string;
  onOpenWorkflow?: (workflowId: string) => void;
  currentPath: string;
}

export function DashboardContentRenderer({ activeTab, onOpenWorkflow, currentPath }: DashboardContentRendererProps) {
  const { canAccessModule } = useModulePermissions();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardContent onOpenWorkflow={onOpenWorkflow} />;
      case 'workflow-dashboard':
        if (!canAccessModule('neura-flow')) return <div>Access denied</div>;
        return <WorkflowDashboard />;
      case 'workflow-inbox':
        if (!canAccessModule('neura-flow')) return <div>Access denied</div>;
        return <WorkflowInbox />;
      case 'workflow-builder':
        if (!canAccessModule('neura-flow')) return <div>Access denied</div>;
        return <WorkflowBuilder />;
      case 'templates':
        if (!canAccessModule('neura-flow')) return <div>Access denied</div>;
        return <SavedWorkflows />;
      case 'workflow-analytics':
        if (!canAccessModule('neura-flow')) return <div>Access denied</div>;
        return <WorkflowAnalyticsPage />;
      case 'crm-dashboard':
        if (!canAccessModule('neura-crm')) return <div>Access denied</div>;
        return <CrmDashboard />;
      case 'crm-contacts':
        if (!canAccessModule('neura-crm')) return <div>Access denied</div>;
        return <CrmContactsPage />;
      case 'crm-companies':
        if (!canAccessModule('neura-crm')) return <div>Access denied</div>;
        return <CrmCompaniesPage />;
      case 'crm-tasks':
        if (!canAccessModule('neura-crm')) return <div>Access denied</div>;
        return <CrmTasksPage />;
      case 'crm-pipeline':
        if (!canAccessModule('neura-crm')) return <div>Access denied</div>;
        return <CrmPipelinePage />;
      case 'crm-analytics':
        if (!canAccessModule('neura-crm')) return <div>Access denied</div>;
        return <CrmAnalyticsPage />;
      case 'crm-communications':
        if (!canAccessModule('neura-crm')) return <div>Access denied</div>;
        return <CrmCommunicationsPage />;
      case 'forms':
        if (!canAccessModule('neura-forms')) return <div>Access denied</div>;
        return <div>Forms module coming soon...</div>;
      case 'education':
        if (!canAccessModule('neura-edu')) return <div>Access denied</div>;
        return <div>Education module coming soon...</div>;
      case 'users':
        return <UserManagement />;
      case 'teams':
        return <TeamManagement />;
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

  // Admin routes
  if (currentPath === '/admin/users') {
    return <UserManagement />;
  }
  
  if (currentPath === '/admin/teams') {
    return <TeamManagement />;
  }
  
  if (currentPath === '/admin/workspaces') {
    return <WorkspaceManagement />;
  }
  
  if (currentPath === '/admin/modules') {
    return <ModuleManagement />;
  }

  return <div className="w-full">{renderContent()}</div>;
}
