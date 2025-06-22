
import React, { useState } from 'react';
import { ChevronDown, Workflow, Building2, FileText, GraduationCap, Loader2 } from 'lucide-react';
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
import { Skeleton } from '@/components/ui/skeleton';
import { SidebarNavigationItem } from './SidebarNavigationItem';
import { NavigationItem } from './navigationItems';
import { useModulePermissions } from '@/hooks/useModulePermissions';

interface ModuleCollapsibleGroupProps {
  moduleName: string;
  moduleDisplayName: string;
  items: NavigationItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

// Module icon mapping
const getModuleIcon = (moduleName: string) => {
  const iconMap: Record<string, React.ComponentType<any>> = {
    'neura-flow': Workflow,
    'neura-crm': Building2,
    'neura-forms': FileText,
    'neura-edu': GraduationCap,
  };
  return iconMap[moduleName] || FileText;
};

export function ModuleCollapsibleGroup({ 
  moduleName, 
  moduleDisplayName, 
  items, 
  activeTab, 
  onTabChange 
}: ModuleCollapsibleGroupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { isLoading } = useModulePermissions();
  const ModuleIcon = getModuleIcon(moduleName);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <SidebarMenuItem className="list-none before:hidden after:hidden">
          <SidebarMenuButton className="w-full justify-between hover:bg-sidebar-accent list-none before:hidden after:hidden">
            <div className="flex items-center gap-2">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ModuleIcon className="h-4 w-4" />
              )}
              {isLoading ? (
                <Skeleton className="h-4 w-24" />
              ) : (
                <span className="font-medium text-sidebar-foreground/90">{moduleDisplayName}</span>
              )}
            </div>
            <ChevronDown 
              className={`h-4 w-4 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`} 
            />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        <div className="ml-6 pl-2">
          <SidebarMenu className="list-none">
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
