
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useWorkflowPermissions } from '@/hooks/useWorkflowPermissions';
import { useModulePermissions } from '@/hooks/useModulePermissions';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { DynamicSidebar } from './DynamicSidebar';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';
import { ModuleGuard } from '@/components/modules/ModuleGuard';

// Component imports
import UserManagement from '@/components/admin/UserManagement';
import DashboardContent from '@/components/dashboard/DashboardContent';
import WorkflowBuilder from '@/modules/neura-flow/components/WorkflowBuilder';
import { WorkflowInbox } from '@/components/workflow/WorkflowInbox';
import { ReportsPage } from '@/components/reports/ReportsPage';
import { ThemeSettings } from '@/components/theme/ThemeSettings';
import { CRMDashboard } from '@/modules/neura-crm';
import { FormBuilder } from '@/modules/neura-forms';
import { LearningManagementSystem } from '@/modules/neura-edu';

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { profile, signOut } = useAuth();
  const { canEditWorkflows } = useWorkflowPermissions();
  const { canAccessModule } = useModulePermissions();
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const location = useLocation();

  // Check if we're on the main dashboard
  const isMainDashboard = location.pathname === '/';
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    // Only set active tab from hash if we're on the main dashboard
    if (isMainDashboard) {
      const hash = window.location.hash.slice(1);
      if (hash) {
        setActiveTab(hash);
      } else {
        setActiveTab('dashboard');
      }
    }
  }, [isMainDashboard, location.pathname]);

  // Add hash change listener to handle programmatic navigation
  useEffect(() => {
    const handleHashChange = () => {
      if (isMainDashboard) {
        const hash = window.location.hash.slice(1);
        if (hash) {
          setActiveTab(hash);
        } else {
          setActiveTab('dashboard');
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isMainDashboard]);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    window.location.hash = tabId;
  };

  const handleOpenWorkflow = (workflowId: string) => {
    console.log('DashboardLayout handleOpenWorkflow called with workflowId:', workflowId);
    
    // First, update the URL with the workflow ID
    const url = new URL(window.location.href);
    url.searchParams.set('workflowId', workflowId);
    window.history.replaceState({}, '', url.toString());
    
    // Then switch to workflow builder tab
    setActiveTab('workflow-builder');
    window.location.hash = 'workflow-builder';
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'workflow-inbox':
        return (
          <ModuleGuard moduleName="neura-flow">
            <WorkflowInbox />
          </ModuleGuard>
        );
      case 'users':
        return ['admin', 'manager', 'root'].includes(profile?.role || '') ? <UserManagement /> : <DashboardContent onOpenWorkflow={handleOpenWorkflow} />;
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
        return children ? React.cloneElement(children as React.ReactElement, { onOpenWorkflow: handleOpenWorkflow }) : <DashboardContent onOpenWorkflow={handleOpenWorkflow} />;
    }
  };

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          {/* Show Sidebar only on the main dashboard */}
          {isMainDashboard && (
            <DynamicSidebar
              activeTab={activeTab}
              onTabChange={handleTabChange}
              onSignOut={handleSignOut}
            />
          )}
          
          <SidebarInset className="flex-1">
            {/* Header */}
            <header className="bg-gradient-theme-primary shadow-sm border-b border-border">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className={`flex justify-between items-center h-16 ${isRTL ? 'rtl-space-reverse' : ''}`}>
                  <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                    {isMainDashboard && <SidebarTrigger className="mr-4" />}
                    <a 
                      href="https://neuracore.app" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`flex items-center hover:opacity-80 transition-opacity cursor-pointer ${isRTL ? 'flex-row-reverse' : ''}`}
                    >
                      <img 
                        src="/lovable-uploads/ad638155-e549-4473-9b1c-09e58275fae6.png" 
                        alt="NeuraCore Logo" 
                        className={`h-8 w-auto ${isRTL ? 'ml-2' : 'mr-2'}`}
                      />
                    </a>
                  </div>
                  <div className={`flex items-center space-x-4 ${isRTL ? 'space-x-reverse' : ''}`}>
                    <LanguageSwitcher />
                    <NotificationCenter />
                  </div>
                </div>
              </div>
            </header>

            {/* Content */}
            <main className="flex-1 p-6">
              {renderContent()}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
