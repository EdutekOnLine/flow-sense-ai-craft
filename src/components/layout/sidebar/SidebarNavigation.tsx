
import React from 'react';
import { SidebarContent } from '@/components/ui/sidebar';
import { SidebarNavigationGroup } from './SidebarNavigationGroup';
import { useNavigationItems } from '@/hooks/useNavigationItems';

interface SidebarNavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function SidebarNavigation({ activeTab, onTabChange }: SidebarNavigationProps) {
  const { getVisibleItems, groupItems } = useNavigationItems();
  
  const visibleItems = getVisibleItems();
  const groupedItems = groupItems(visibleItems);

  console.log('SidebarNavigation render:', {
    activeTab,
    visibleItemsCount: visibleItems.length,
    visibleItemIds: visibleItems.map(item => item.id),
    groupedItemsKeys: Object.keys(groupedItems)
  });

  // If no visible items, show a fallback message for debugging
  if (visibleItems.length === 0) {
    console.warn('No visible navigation items found');
    return (
      <SidebarContent>
        <div className="p-4 text-sm text-muted-foreground">
          Loading navigation...
        </div>
      </SidebarContent>
    );
  }

  return (
    <SidebarContent>
      {Object.entries(groupedItems).map(([groupKey, items]) => (
        <SidebarNavigationGroup
          key={groupKey}
          groupKey={groupKey}
          items={items}
          activeTab={activeTab}
          onTabChange={onTabChange}
        />
      ))}
    </SidebarContent>
  );
}
