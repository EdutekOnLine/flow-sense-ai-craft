
import { useAuth } from './useAuth';
import { useModulePermissions } from './useModulePermissions';
import { navigationItems, NavigationItem } from '@/components/layout/sidebar/navigationItems';

export function useNavigationItems() {
  const { profile, isRootUser } = useAuth();
  const { canAccessModule } = useModulePermissions();

  const getVisibleItems = (): NavigationItem[] => {
    if (isRootUser()) {
      // Root users see all navigation items
      return navigationItems;
    }

    return navigationItems.filter(item => 
      item.roles.includes(profile?.role || 'employee') && canAccessModule(item.module)
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

  return {
    getVisibleItems,
    groupItems,
  };
}
