
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Package } from 'lucide-react';

interface ModuleManagementTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export function ModuleManagementTabs({ activeTab, onTabChange }: ModuleManagementTabsProps) {
  return (
    <TabsList className="grid w-full grid-cols-3">
      <TabsTrigger value="overview" className="flex items-center gap-2">
        <Package className="h-4 w-4" />
        Overview
      </TabsTrigger>
      <TabsTrigger value="settings" className="flex items-center gap-2">
        <Settings className="h-4 w-4" />
        Settings
      </TabsTrigger>
      <TabsTrigger value="marketplace" className="flex items-center gap-2">
        <Package className="h-4 w-4" />
        Marketplace
      </TabsTrigger>
    </TabsList>
  );
}
