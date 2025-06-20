
import React from 'react';
import DashboardContent from '@/components/dashboard/DashboardContent';
import UserManagement from '@/components/admin/UserManagement';
import ModuleManagement from '@/components/admin/ModuleManagement';
import WorkspaceAssignment from '@/components/admin/WorkspaceAssignment';
import ReportsPage from '@/components/reports/ReportsPage';
import WorkflowInbox from '@/components/workflow/WorkflowInbox';
import WorkflowBuilder from '@/components/workflow-builder/WorkflowBuilder';
import { ModuleGuard } from '@/components/modules/ModuleGuard';

interface DashboardContentRendererProps {
  activeTab: string;
  onOpenWorkflow: () => void;
}

export function DashboardContentRenderer({ activeTab, onOpenWorkflow }: DashboardContentRendererProps) {
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardContent />;
      
      case 'workflow-inbox':
        return (
          <ModuleGuard moduleName="neura-flow">
            <WorkflowInbox />
          </ModuleGuard>
        );
      
      case 'workflow-builder':
        return (
          <ModuleGuard moduleName="neura-flow">
            <WorkflowBuilder />
          </ModuleGuard>
        );
      
      case 'templates':
        return (
          <ModuleGuard moduleName="neura-flow">
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">Workflow Templates</h1>
              <p className="text-muted-foreground">Workflow templates coming soon...</p>
            </div>
          </ModuleGuard>
        );
      
      case 'crm':
        return (
          <ModuleGuard moduleName="neura-crm">
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">CRM</h1>
              <p className="text-muted-foreground">CRM module coming soon...</p>
            </div>
          </ModuleGuard>
        );
      
      case 'forms':
        return (
          <ModuleGuard moduleName="neura-forms">
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">Forms</h1>
              <p className="text-muted-foreground">Forms module coming soon...</p>
            </div>
          </ModuleGuard>
        );
      
      case 'education':
        return (
          <ModuleGuard moduleName="neura-edu">
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">Education</h1>
              <p className="text-muted-foreground">Education module coming soon...</p>
            </div>
          </ModuleGuard>
        );
      
      case 'users':
        return <UserManagement />;
      
      case 'workspace-assignment':
        return <WorkspaceAssignment />;
      
      case 'reports':
        return <ReportsPage />;
      
      case 'module-management':
        return <ModuleManagement />;
      
      case 'settings':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Settings</h1>
            <p className="text-muted-foreground">Settings page coming soon...</p>
          </div>
        );
      
      default:
        return <DashboardContent />;
    }
  };

  return <>{renderContent()}</>;
}
