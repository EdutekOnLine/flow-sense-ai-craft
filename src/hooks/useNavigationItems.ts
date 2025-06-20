
import { useAuth } from './useAuth';
import { useModulePermissions } from './useModulePermissions';
import { navigationItems, NavigationItem } from '@/components/layout/sidebar/navigationItems';
import { MODULE_REGISTRY } from '@/modules';

export function useNavigationItems() {
  const { profile } = useAuth();
  const { canAccessModule } = useModulePermissions();

  const getVisibleItems = (): NavigationItem[] => {
    if (!profile) return [];

    // Root users see ALL navigation items for their role without module filtering
    if (profile.role === 'root') {
      return navigationItems.filter(item => 
        item.roles.includes(profile.role)
      );
    }

    // Non-root users see items filtered by role AND module access
    return navigationItems.filter(item => 
      item.roles.includes(profile.role) && canAccessModule(item.module)
    );
  };

  const groupItems = (items: NavigationItem[]) => {
    const groups = items.reduce((acc, item) => {
      const group = item.group;
      if (!acc[group]) acc[group] = [];
      acc[group].push(item);
      return acc;
    }, {} as Record<string, NavigationItem[]>);

    return groups;
  };

  const groupItemsByModule = (items: NavigationItem[]) => {
    const moduleGroups = items.reduce((acc, item) => {
      const module = item.module;
      if (!acc[module]) acc[module] = [];
      acc[module].push(item);
      return acc;
    }, {} as Record<string, NavigationItem[]>);

    return moduleGroups;
  };

  const getModuleDisplayName = (moduleName: string): string => {
    return MODULE_REGISTRY[moduleName]?.name || moduleName;
  };

  return {
    getVisibleItems,
    groupItems,
    groupItemsByModule,
    getModuleDisplayName,
  };
}
