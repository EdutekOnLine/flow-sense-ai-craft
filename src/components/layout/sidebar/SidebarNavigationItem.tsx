
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useModulePermissions } from '@/hooks/useModulePermissions';
import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { NavigationItem } from './navigationItems';

interface SidebarNavigationItemProps {
  item: NavigationItem;
  isActive: boolean;
  onTabChange: (tabId: string) => void;
}

export function SidebarNavigationItem({ item, isActive, onTabChange }: SidebarNavigationItemProps) {
  const { t } = useTranslation();
  const { getModuleStatus } = useModulePermissions();
  
  const Icon = item.icon;
  
  const getModuleBadge = (moduleName: string) => {
    if (moduleName === 'neura-core') return null;
    
    const status = getModuleStatus(moduleName);
    if (!status.isActive) {
      return <Badge variant="secondary" className="text-xs">Inactive</Badge>;
    }
    return null;
  };

  const moduleBadge = getModuleBadge(item.module);
  const label = item.label.startsWith('navigation.') ? t(item.label) : item.label;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        onClick={() => onTabChange(item.id)}
        isActive={isActive}
        className="w-full justify-start"
      >
        <Icon className="h-4 w-4" />
        <span className="flex-1">{label}</span>
        {moduleBadge}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
