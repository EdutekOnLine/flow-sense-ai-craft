
import React from 'react';
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu } from '@/components/ui/sidebar';
import { SidebarNavigationItem } from './SidebarNavigationItem';
import { NavigationItem, getGroupTitle } from './navigationItems';

interface SidebarNavigationGroupProps {
  groupKey: string;
  items: NavigationItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function SidebarNavigationGroup({ groupKey, items, activeTab, onTabChange }: SidebarNavigationGroupProps) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{getGroupTitle(groupKey)}</SidebarGroupLabel>
      <SidebarGroupContent>
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
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
