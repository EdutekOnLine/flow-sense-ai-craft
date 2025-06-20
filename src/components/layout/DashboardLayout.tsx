
import React, { useState } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { DynamicSidebar } from './DynamicSidebar';
import { DashboardHeader } from './DashboardHeader';
import { DashboardContentRenderer } from './DashboardContentRenderer';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { ModuleStatusNotifier } from '@/components/modules/ModuleStatusNotifier';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DynamicSidebar 
          activeTab={activeTab} 
          onTabChange={handleTabChange} 
          onSignOut={handleSignOut} 
        />
        
        <main className="flex-1 flex flex-col">
          <DashboardHeader isMainDashboard={true} isRTL={false} />
          <div className="flex-1 p-6">
            <DashboardContentRenderer activeTab={activeTab} onOpenWorkflow={() => {}} />
          </div>
        </main>
      </div>
      
      {/* Add the module status notifier */}
      <ModuleStatusNotifier />
    </SidebarProvider>
  );
}
