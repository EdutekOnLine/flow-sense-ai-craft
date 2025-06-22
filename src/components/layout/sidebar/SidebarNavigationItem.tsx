
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useInstantUserCache } from '@/hooks/useInstantUserCache';
import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { Crown } from 'lucide-react';
import { NavigationItem } from './navigationItems';

interface SidebarNavigationItemProps {
  item: NavigationItem;
  isActive: boolean;
  onTabChange: (tabId: string) => void;
}

export function SidebarNavigationItem({ item, isActive, onTabChange }: SidebarNavigationItemProps) {
  const { t } = useTranslation();
  const { userData } = useInstantUserCache();
  
  const Icon = item.icon;
  const isRootUser = userData?.role === 'root';
  
  // Phase 5: Optimistic rendering - always show items as clickable for better UX
  // Access control happens at the content level, not navigation level
  const hasAccess = isRootUser || userData?.role ? item.roles.includes(userData.role) : true;
  
  const getModuleBadge = (moduleName: string) => {
    // For core features, no badges needed
    if (moduleName === 'neura-core') return null;
    
    // Root users get a special badge for modules
    if (isRootUser) {
      return (
        <div className="flex items-center gap-1">
          <Crown className="h-3 w-3 text-yellow-500" />
          <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">Root</Badge>
        </div>
      );
    }
    
    // For regular users, show clean UI without loading indicators
    return null;
  };

  const handleClick = () => {
    // Optimistic navigation - allow access for role-appropriate items
    if (hasAccess) {
      onTabChange(item.id);
    } else {
      console.log(`Access denied to ${item.label}: Role mismatch`);
    }
  };

  const moduleBadge = getModuleBadge(item.module);
  const label = item.label.startsWith('navigation.') ? t(item.label) : item.label;

  // Optimistic rendering - show items unless role explicitly doesn't match
  const shouldDisable = !hasAccess;
  const itemOpacity = shouldDisable ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer';

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        onClick={handleClick}
        isActive={isActive && !shouldDisable}
        className={`w-full justify-start transition-all duration-200 ${itemOpacity}`}
        disabled={shouldDisable}
      >
        <Icon className="h-4 w-4" />
        <span className="flex-1">{label}</span>
        {moduleBadge}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
