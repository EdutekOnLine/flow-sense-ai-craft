
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible';
import { 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem 
} from '@/components/ui/sidebar';
import { SidebarNavigationItem } from './SidebarNavigationItem';
import { NavigationItem } from './navigationItems';

interface ModuleCollapsibleGroupProps {
  moduleName: string;
  moduleDisplayName: string;
  items: NavigationItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function ModuleCollapsibleGroup({ 
  moduleName, 
  moduleDisplayName, 
  items, 
  activeTab, 
  onTabChange 
}: ModuleCollapsibleGroupProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <SidebarMenuItem>
          <SidebarMenuButton className="w-full justify-between hover:bg-sidebar-accent">
            <span className="font-medium text-sidebar-foreground/90">{moduleDisplayName}</span>
            <ChevronDown 
              className={`h-4 w-4 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`} 
            />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        <div className="ml-4 border-l border-sidebar-border pl-2">
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
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
