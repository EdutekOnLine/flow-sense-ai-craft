
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useModulePermissions } from '@/hooks/useModulePermissions';
import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Lock, Crown, Loader2 } from 'lucide-react';
import { NavigationItem } from './navigationItems';

interface SidebarNavigationItemProps {
  item: NavigationItem;
  isActive: boolean;
  onTabChange: (tabId: string) => void;
}

export function SidebarNavigationItem({ item, isActive, onTabChange }: SidebarNavigationItemProps) {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const { getModuleStatus, canAccessModule, loading } = useModulePermissions();
  
  const Icon = item.icon;
  const moduleStatus = getModuleStatus(item.module);
  const hasAccess = canAccessModule(item.module);
  const isRootUser = profile?.role === 'root';
  
  const getModuleBadge = (moduleName: string) => {
    if (moduleName === 'neura-core') return null;
    
    // Show loading state while data is being fetched
    if (loading && !isRootUser) {
      return (
        <div className="flex items-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
          <Badge variant="secondary" className="text-xs">Loading...</Badge>
        </div>
      );
    }
    
    // Root users get a special badge
    if (isRootUser) {
      return (
        <div className="flex items-center gap-1">
          <Crown className="h-3 w-3 text-yellow-500" />
          <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">Root</Badge>
        </div>
      );
    }
    
    if (!hasAccess) {
      return (
        <div className="flex items-center gap-1">
          <Lock className="h-3 w-3 text-muted-foreground" />
          <Badge variant="secondary" className="text-xs">Locked</Badge>
        </div>
      );
    }

    if (!moduleStatus?.isActive) {
      return <Badge variant="outline" className="text-xs">Inactive</Badge>;
    }
    
    return null;
  };

  const handleClick = () => {
    // Root users always have access
    if (isRootUser || hasAccess) {
      onTabChange(item.id);
    } else {
      // Could show a toast or modal explaining why access is denied
      console.log(`Access denied to ${item.label}: Module not active`);
    }
  };

  const moduleBadge = getModuleBadge(item.module);
  const label = item.label.startsWith('navigation.') ? t(item.label) : item.label;

  // Show skeleton while loading profile data
  if (!profile && loading) {
    return (
      <SidebarMenuItem>
        <div className="flex items-center space-x-2 p-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 flex-1" />
        </div>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        onClick={handleClick}
        isActive={isActive && (isRootUser || hasAccess)}
        className={`w-full justify-start ${
          !isRootUser && !hasAccess ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
        }`}
        disabled={!isRootUser && !hasAccess}
      >
        <Icon className="h-4 w-4" />
        <span className="flex-1">{label}</span>
        {moduleBadge}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
