
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useModulePermissions } from '@/hooks/useModulePermissions';
import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { Lock } from 'lucide-react';
import { NavigationItem } from './navigationItems';

interface SidebarNavigationItemProps {
  item: NavigationItem;
  isActive: boolean;
  onTabChange: (tabId: string) => void;
}

export function SidebarNavigationItem({ item, isActive, onTabChange }: SidebarNavigationItemProps) {
  const { t } = useTranslation();
  const { getModuleStatus, canAccessModule } = useModulePermissions();
  
  const Icon = item.icon;
  const moduleStatus = getModuleStatus(item.module);
  const hasAccess = canAccessModule(item.module);
  
  const getModuleBadge = (moduleName: string) => {
    if (moduleName === 'neura-core') return null;
    
    if (!hasAccess) {
      return (
        <div className="flex items-center gap-1">
          <Lock className="h-3 w-3 text-muted-foreground" />
          <Badge variant="secondary" className="text-xs">Locked</Badge>
        </div>
      );
    }

    if (!moduleStatus.isActive) {
      return <Badge variant="outline" className="text-xs">Inactive</Badge>;
    }
    
    return null;
  };

  const handleClick = () => {
    if (hasAccess) {
      onTabChange(item.id);
    } else {
      // Could show a toast or modal explaining why access is denied
      console.log(`Access denied to ${item.label}: Module not active`);
    }
  };

  const moduleBadge = getModuleBadge(item.module);
  const label = item.label.startsWith('navigation.') ? t(item.label) : item.label;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        onClick={handleClick}
        isActive={isActive && hasAccess}
        className={`w-full justify-start ${
          !hasAccess ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
        }`}
        disabled={!hasAccess}
      >
        <Icon className="h-4 w-4" />
        <span className="flex-1">{label}</span>
        {moduleBadge}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
