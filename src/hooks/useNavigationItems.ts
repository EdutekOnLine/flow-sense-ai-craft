
import { useAuth } from './useAuth';
import { useModulePermissions } from './useModulePermissions';
import { navigationItems, NavigationItem } from '@/components/layout/sidebar/navigationItems';

export function useNavigationItems() {
  const { profile } = useAuth();
  const { canAccessModule } = useModulePermissions();

  const getVisibleItems = (): NavigationItem[] => {
    console.log('getVisibleItems called', { 
      profileRole: profile?.role,
      navigationItemsCount: navigationItems.length 
    });

    if (!profile) {
      console.log('No profile, returning empty navigation items');
      return [];
    }

    // For root users, provide core navigation items immediately
    if (profile.role === 'root') {
      const rootItems = navigationItems.filter(item => 
        item.roles.includes('root')
      );
      console.log('Root user navigation items:', rootItems.map(item => item.id));
      return rootItems;
    }

    // For other users, filter by role and module access
    const visibleItems = navigationItems.filter(item => {
      const hasRole = item.roles.includes(profile.role || 'employee');
      const hasModuleAccess = canAccessModule(item.module);
      
      console.log(`Navigation item ${item.id}:`, {
        hasRole,
        hasModuleAccess,
        userRole: profile.role,
        requiredRoles: item.roles,
        module: item.module
      });
      
      return hasRole && hasModuleAccess;
    });

    console.log('Filtered navigation items:', visibleItems.map(item => item.id));
    return visibleItems;
  };

  const groupItems = (items: NavigationItem[]) => {
    const groups = items.reduce((acc, item) => {
      const group = item.group;
      if (!acc[group]) acc[group] = [];
      acc[group].push(item);
      return acc;
    }, {} as Record<string, NavigationItem[]>);

    console.log('Grouped navigation items:', Object.keys(groups));
    return groups;
  };

  return {
    getVisibleItems,
    groupItems,
  };
}
