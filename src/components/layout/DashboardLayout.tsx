
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useWorkflowPermissions } from '@/hooks/useWorkflowPermissions';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut, 
  FileText,
  BarChart3,
  Workflow,
  Inbox
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';
import UserManagement from '@/components/admin/UserManagement';
import DashboardContent from '@/components/dashboard/DashboardContent';
import WorkflowBuilder from '@/components/workflow-builder/WorkflowBuilder';
import { WorkflowInbox } from '@/components/workflow/WorkflowInbox';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { ReportsPage } from '@/components/reports/ReportsPage';
import { ThemeSettings } from '@/components/theme/ThemeSettings';

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { profile, signOut } = useAuth();
  const { canEditWorkflows } = useWorkflowPermissions();
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

  const navigationItems = [
    { id: 'dashboard', label: t('navigation.dashboard'), icon: LayoutDashboard, roles: ['admin', 'manager', 'employee', 'root'] },
    { id: 'workflow-inbox', label: t('navigation.myTasks'), icon: Inbox, roles: ['admin', 'manager', 'employee', 'root'] },
    { id: 'workflow-builder', label: t('navigation.workflowBuilder'), icon: Workflow, roles: ['admin', 'manager', 'root'] },
    { id: 'users', label: t('navigation.users'), icon: Users, roles: ['admin', 'manager', 'root'] },
    { id: 'reports', label: t('navigation.reports'), icon: BarChart3, roles: ['admin', 'manager', 'root'] },
    { id: 'templates', label: t('navigation.templates'), icon: FileText, roles: ['admin', 'manager', 'employee', 'root'] },
    { id: 'settings', label: t('navigation.settings'), icon: Settings, roles: ['admin', 'root'] },
  ];

  const visibleNavItems = navigationItems.filter(item => 
    item.roles.includes(profile?.role || 'employee')
  );

  const handleOpenWorkflow = (workflowId: string) => {
    console.log('DashboardLayout handleOpenWorkflow called with workflowId:', workflowId);
    console.log('canEditWorkflows:', canEditWorkflows);
    console.log('profile?.role:', profile?.role);
    
    console.log('Setting workflow ID in URL and switching to workflow builder');
    
    // First, update the URL with the workflow ID
    const url = new URL(window.location.href);
    url.searchParams.set('workflowId', workflowId);
    window.history.replaceState({}, '', url.toString());
    
    console.log('Updated URL:', url.toString());
    
    // Then switch to workflow builder tab
    setActiveTab('workflow-builder');
    window.location.hash = 'workflow-builder';
    
    console.log('Switched to workflow-builder tab');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'workflow-inbox':
        return <WorkflowInbox />;
      case 'users':
        return ['admin', 'manager', 'root'].includes(profile?.role || '') ? <UserManagement /> : <DashboardContent onOpenWorkflow={handleOpenWorkflow} />;
      case 'workflow-builder':
        // Allow all users to access workflow builder - it will handle permissions internally
        return <WorkflowBuilder />;
      case 'reports':
        return <ReportsPage />;
      case 'templates':
        return (
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('navigation.templates')}</h2>
            <p className="text-muted-foreground">Workflow templates functionality coming soon...</p>
          </div>
        );
      case 'settings':
        return <ThemeSettings />;
      default:
        return children ? React.cloneElement(children as React.ReactElement, { onOpenWorkflow: handleOpenWorkflow }) : <DashboardContent onOpenWorkflow={handleOpenWorkflow} />;
    }
  };

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="bg-gradient-theme-primary shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex justify-between items-center h-16 ${isRTL ? 'rtl-space-reverse' : ''}`}>
            <a 
              href="https://neuraflowai.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className={`flex items-center hover:opacity-80 transition-opacity cursor-pointer ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <img 
                src="/lovable-uploads/ad638155-e549-4473-9b1c-09e58275fae6.png" 
                alt="NeuraFlow Logo" 
                className={`h-8 w-auto ${isRTL ? 'ml-2' : 'mr-2'}`}
              />
            </a>
            <div className={`flex items-center space-x-4 ${isRTL ? 'space-x-reverse' : ''}`}>
              <LanguageSwitcher />
              <NotificationCenter />
              <span className="text-sm text-muted-foreground">
                {t('header.welcome', { name: profile?.first_name || profile?.email })}
              </span>
              <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                {profile?.role?.toUpperCase()}
              </span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t('header.signOut')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Show Navigation Tabs only on the main dashboard */}
        {isMainDashboard && (
          <div className={`flex space-x-1 mb-8 bg-muted p-1 rounded-lg ${isRTL ? 'space-x-reverse' : ''}`}>
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${isRTL ? 'flex-row-reverse' : ''} ${
                    activeTab === item.id
                      ? 'bg-background text-primary shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {item.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Content */}
        {renderContent()}
      </div>
    </div>
  );
}
