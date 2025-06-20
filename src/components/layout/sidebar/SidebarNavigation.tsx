
import React from 'react';
import { SidebarContent } from '@/components/ui/sidebar';
import { SidebarNavigationGroup } from './SidebarNavigationGroup';
import { ModuleCollapsibleGroup } from './ModuleCollapsibleGroup';
import { useNavigationItems } from '@/hooks/useNavigationItems';

interface SidebarNavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function SidebarNavigation({ activeTab, onTabChange }: SidebarNavigationProps) {
  const { getVisibleItems, groupItems, groupItemsByModule, getModuleDisplayName } = useNavigationItems();
  
  const visibleItems = getVisibleItems();
  const groupedItems = groupItems(visibleItems);

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
