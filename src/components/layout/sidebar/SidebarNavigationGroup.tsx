
import React from 'react';
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu } from '@/components/ui/sidebar';
import { SidebarNavigationItem } from './SidebarNavigationItem';
import { NavigationItem, getGroupTitle } from './navigationItems';
import { useModulePermissions } from '@/hooks/useModulePermissions';
import { Loader2 } from 'lucide-react';

interface SidebarNavigationGroupProps {
  groupKey: string;
  items: NavigationItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  customContent?: React.ReactNode;
}

export function SidebarNavigationGroup({ 
  groupKey, 
  items, 
  activeTab, 
  onTabChange, 
  customContent 
}: SidebarNavigationGroupProps) {
  const { isLoading } = useModulePermissions();
  
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="flex items-center gap-2">
        {getGroupTitle(groupKey)}
        {isLoading && groupKey === 'modules' && (
          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
        )}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        {customContent ? (
          customContent
        ) : (
          <SidebarMenu>
            {items.map((item) => (
              <SidebarNavigationItem
                key={item.id}
                item={item}
                isActive={activeTab === item.id}
                onTabChange={onTabChange}
              />
            ))}
          </SidebarMenu>
        )}
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
