
import React from 'react';
import { Sidebar } from '@/components/ui/sidebar';
import { DynamicSidebarHeader } from './sidebar/SidebarHeader';
import { SidebarNavigation } from './sidebar/SidebarNavigation';
import { DynamicSidebarFooter } from './sidebar/SidebarFooter';

interface DynamicSidebarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onSignOut: () => void;
}

export function DynamicSidebar({ activeTab, onTabChange, onSignOut }: DynamicSidebarProps) {
  return (
    <Sidebar>
      <DynamicSidebarHeader />
      <SidebarNavigation 
        activeTab={activeTab} 
        onTabChange={onTabChange} 
      />
      <DynamicSidebarFooter onSignOut={onSignOut} />
    </Sidebar>
  );
}
