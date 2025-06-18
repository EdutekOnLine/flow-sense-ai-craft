
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { DynamicSidebar } from './DynamicSidebar';
import { DashboardHeader } from './DashboardHeader';
import { DashboardContentRenderer } from './DashboardContentRenderer';
import { useDashboardRouter } from './DashboardRouter';

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { signOut } = useAuth();
  const { i18n } = useTranslation();
  const location = useLocation();

  // Check if we're on the main dashboard
  const isMainDashboard = location.pathname === '/';
  const isRTL = i18n.language === 'ar';

  const { activeTab, handleTabChange, handleOpenWorkflow } = useDashboardRouter({
    isMainDashboard,
    onTabChange: () => {}, // No additional logic needed
    onOpenWorkflow: () => {} // No additional logic needed
  });

  const handleSignOut = async () => {
    await signOut();
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
            <DashboardHeader 
              isMainDashboard={isMainDashboard}
              isRTL={isRTL}
            />

            {/* Content */}
            <main className="flex-1 p-6">
              <DashboardContentRenderer
                activeTab={activeTab}
                children={children}
                onOpenWorkflow={handleOpenWorkflow}
              />
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
