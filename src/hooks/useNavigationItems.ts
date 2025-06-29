
import { useAuth } from './useAuth';
import { navigationItems, NavigationItem } from '@/components/layout/sidebar/navigationItems';
import { MODULE_REGISTRY } from '@/modules';

export function useNavigationItems() {
  const { profile, loading } = useAuth();

  // Show navigation items optimistically during loading, then filter by role
  const getVisibleItems = (): NavigationItem[] => {
    // If still loading auth state, show basic navigation for all users
    if (loading || !profile) {
      // Show core items that are available to all authenticated users
      return navigationItems.filter(item => 
        item.group === 'core' || 
        (item.group === 'modules' && item.roles.includes('user'))
      );
    }

    // Once profile is loaded, filter by actual user role
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
    isLoading: loading,
  };
}
