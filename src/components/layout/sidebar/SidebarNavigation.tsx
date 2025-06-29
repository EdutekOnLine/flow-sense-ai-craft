
import React from 'react';
import { SidebarContent } from '@/components/ui/sidebar';
import { SidebarNavigationGroup } from './SidebarNavigationGroup';
import { ModuleCollapsibleGroup } from './ModuleCollapsibleGroup';
import { useNavigationItems } from '@/hooks/useNavigationItems';
import { useInstantUserCache } from '@/hooks/useInstantUserCache';

interface SidebarNavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function SidebarNavigation({ activeTab, onTabChange }: SidebarNavigationProps) {
  const { getVisibleItems, groupItems, groupItemsByModule, getModuleDisplayName } = useNavigationItems();
  const { userData, isInstantLoading } = useInstantUserCache();
  
  // Phase 4: Show navigation immediately without waiting for module data
  // Use cached user data if available for instant rendering
  const visibleItems = getVisibleItems();
  const groupedItems = groupItems(visibleItems);

  // Show loading only if we don't have any user data at all
  if (isInstantLoading && !userData) {
    return (
      <SidebarContent>
        <div className="flex items-center justify-center h-32">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      </SidebarContent>
    );
  }

  return (
    <SidebarContent>
      {Object.entries(groupedItems).map(([groupKey, items]) => {
        // Handle the modules group specially with collapsible module sections
        if (groupKey === 'modules') {
          const moduleGroups = groupItemsByModule(items);
          
          return (
            <SidebarNavigationGroup
              key={groupKey}
              groupKey={groupKey}
              items={[]} // Empty items since we'll render module groups instead
              activeTab={activeTab}
              onTabChange={onTabChange}
              customContent={
                <div className="space-y-1">
                  {Object.entries(moduleGroups).map(([moduleName, moduleItems]) => (
                    <ModuleCollapsibleGroup
                      key={moduleName}
                      moduleName={moduleName}
                      moduleDisplayName={getModuleDisplayName(moduleName)}
                      items={moduleItems}
                      activeTab={activeTab}
                      onTabChange={onTabChange}
                    />
                  ))}
                </div>
              }
            />
          );
        }
        
        // Render other groups normally
        return (
          <SidebarNavigationGroup
            key={groupKey}
            groupKey={groupKey}
            items={items}
            activeTab={activeTab}
            onTabChange={onTabChange}
          />
        );
      })}
    </SidebarContent>
  );
}
