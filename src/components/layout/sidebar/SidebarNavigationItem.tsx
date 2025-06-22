
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useModulePermissions } from '@/hooks/useModulePermissions';
import { useOptimisticPermissions } from '@/hooks/useOptimisticPermissions';
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
  const { profile } = useAuth();
  const { canAccessModule } = useModulePermissions();
  const optimisticPermissions = useOptimisticPermissions();
  
  const Icon = item.icon;
  const isRootUser = profile?.role === 'root';
  
  // Determine if this is a core feature vs module feature
  const isCoreFeature = ['dashboard', 'users', 'reports', 'settings', 'module-management', 'workspace-management'].includes(item.id);
  
  // For core features, use optimistic permissions (instant access)
  const getCoreFeatureAccess = () => {
    if (isRootUser) return true;
    
    switch (item.id) {
      case 'dashboard':
      case 'reports':
      case 'settings':
        return true; // Always accessible
      case 'users':
        return optimisticPermissions.canAccessUsers;
      case 'module-management':
        return optimisticPermissions.canManageModules;
      case 'workspace-management':
        return optimisticPermissions.canManageWorkspace;
      default:
        return true;
    }
  };

  // For modules, use optimistic module access
  const hasAccess = isCoreFeature ? getCoreFeatureAccess() : (isRootUser || canAccessModule(item.module));
  
  const getModuleBadge = (moduleName: string) => {
    // For core features, no badges needed for loading
    if (isCoreFeature) {
      return null;
    }
    
    // For modules, show root badge if applicable
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
    
    // For regular users, no loading badges - just show clean UI
    return null;
  };

  const handleClick = () => {
    // Optimistic navigation - allow access unless explicitly denied
    if (isRootUser || hasAccess) {
      onTabChange(item.id);
    } else {
      console.log(`Access denied to ${item.label}: Insufficient permissions`);
    }
  };

  const moduleBadge = getModuleBadge(item.module);
  const label = item.label.startsWith('navigation.') ? t(item.label) : item.label;

  // Optimistic rendering - always show items as clickable unless explicitly restricted
  const shouldDisable = () => {
    // Only disable if we're certain the user doesn't have access
    return !isRootUser && !hasAccess && !isCoreFeature;
  };

  const getItemOpacity = () => {
    return shouldDisable() ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer';
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        onClick={handleClick}
        isActive={isActive && !shouldDisable()}
        className={`w-full justify-start transition-all duration-200 ${getItemOpacity()}`}
        disabled={shouldDisable()}
      >
        <Icon className="h-4 w-4" />
        <span className="flex-1">{label}</span>
        {moduleBadge}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
