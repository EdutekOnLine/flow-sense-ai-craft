
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useModulePermissions } from '@/hooks/useModulePermissions';
import { useOptimisticPermissions } from '@/hooks/useOptimisticPermissions';
import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
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
  const { getModuleStatus, canAccessModule } = useModulePermissions();
  const optimisticPermissions = useOptimisticPermissions();
  
  const Icon = item.icon;
  const isRootUser = profile?.role === 'root';
  const isProfileLoading = !profile;
  
  // Determine if this is a core feature vs module feature
  const isCoreFeature = ['dashboard', 'users', 'reports', 'settings', 'module-management', 'workspace-management'].includes(item.id);
  
  // For core features, use optimistic permissions
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

  // For modules, use the existing module permission system
  const hasAccess = isCoreFeature ? getCoreFeatureAccess() : canAccessModule(item.module);
  const isLoading = isCoreFeature ? (isProfileLoading || optimisticPermissions.isLoading) : (isProfileLoading || !profile);
  
  const getModuleBadge = (moduleName: string) => {
    if (isCoreFeature) {
      // For core features, only show loading if we're actually loading
      if (isLoading && !profile) {
        return (
          <div className="flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
          </div>
        );
      }
      return null;
    }
    
    // For modules, use the existing badge system
    if (moduleName === 'neura-core') return null;
    
    // Show loading state for modules
    if (isLoading) {
      return (
        <div className="flex items-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
          <Badge variant="outline" className="text-xs">Loading...</Badge>
        </div>
      );
    }
    
    // Root users get a special badge for modules
    if (isRootUser) {
      return (
        <div className="flex items-center gap-1">
          <Crown className="h-3 w-3 text-yellow-500" />
          <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">Root</Badge>
        </div>
      );
    }
    
    if (!hasAccess) {
      const moduleStatus = getModuleStatus(moduleName);
      return (
        <div className="flex items-center gap-1">
          <Lock className="h-3 w-3 text-muted-foreground" />
          <Badge variant="secondary" className="text-xs">
            {moduleStatus.statusMessage === 'Checking permissions...' ? 'Loading...' : 'Locked'}
          </Badge>
        </div>
      );
    }

    const moduleStatus = getModuleStatus(moduleName);
    if (!moduleStatus.isActive) {
      return <Badge variant="outline" className="text-xs">Inactive</Badge>;
    }
    
    return null;
  };

  const handleClick = () => {
    // For core features, allow navigation even while loading (optimistic)
    if (isCoreFeature) {
      // Root users always have access
      if (isRootUser || hasAccess) {
        onTabChange(item.id);
      } else if (!isLoading) {
        console.log(`Access denied to ${item.label}: Insufficient permissions`);
      }
      return;
    }
    
    // For modules, show loading state but don't prevent navigation for better UX
    if (isLoading) {
      console.log('Still loading permissions...');
      return;
    }
    
    // Root users always have access to modules
    if (isRootUser || hasAccess) {
      onTabChange(item.id);
    } else {
      console.log(`Access denied to ${item.label}: Module not active`);
    }
  };

  const moduleBadge = getModuleBadge(item.module);
  const label = item.label.startsWith('navigation.') ? t(item.label) : item.label;

  // For core features, be more optimistic about loading states
  const getItemOpacity = () => {
    if (isCoreFeature) {
      // Core features are always visible, just slightly dimmed while loading
      return isLoading ? 'opacity-80' : '';
    }
    
    // Modules use the existing logic
    return isLoading ? 'opacity-70' : 
           !isRootUser && !hasAccess ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer';
  };

  const shouldDisable = () => {
    if (isCoreFeature) {
      // Core features are rarely disabled, only if explicitly no access and not loading
      return !isLoading && !isRootUser && !hasAccess;
    }
    
    // Modules use existing logic
    return isLoading || (!isRootUser && !hasAccess);
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        onClick={handleClick}
        isActive={isActive && !shouldDisable()}
        className={`w-full justify-start transition-all duration-200 ${getItemOpacity()}`}
        disabled={shouldDisable()}
      >
        <Icon className={`h-4 w-4 ${isLoading ? 'opacity-70' : ''}`} />
        <span className="flex-1">{label}</span>
        {moduleBadge}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
