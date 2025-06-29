
import { useAuth } from './useAuth';
import { navigationItems, NavigationItem } from '@/components/layout/sidebar/navigationItems';
import { MODULE_REGISTRY } from '@/modules';

export function useNavigationItems() {
  const { profile } = useAuth();

  // Show all navigation items for user role immediately (optimistic UI)
  const getVisibleItems = (): NavigationItem[] => {
    if (!profile) return [];

    // Show ALL navigation items that match the user's role
    return navigationItems.filter(item => 
      item.roles.includes(profile.role)
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
