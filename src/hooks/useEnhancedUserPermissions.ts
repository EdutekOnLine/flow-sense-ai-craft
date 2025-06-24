
import { useAuth } from './useAuth';
import { useRootPermissions } from './useRootPermissions';
import { useOptimisticPermissions } from './useOptimisticPermissions';

/**
 * Enhanced user permissions that include comprehensive root user bypass
 */
export function useEnhancedUserPermissions() {
  const { profile } = useAuth();
  const { isRootUser } = useRootPermissions();
  const optimisticPermissions = useOptimisticPermissions();

  // Root users bypass all restrictions
  if (isRootUser) {
    return {
      ...optimisticPermissions,
      canAccessUsers: true,
      canAccessReports: true,
      canAccessSettings: true,
      canManageModules: true,
      canManageWorkspace: true,
      canAccessAllWorkspaces: true,
      canAccessAllTeams: true,
      canAccessAllCrmData: true,
      canViewSystemWideMetrics: true,
      canBypassAllRestrictions: true,
      isLoading: false,
    };
  }

  // For non-root users, use existing logic
  return {
    ...optimisticPermissions,
    canAccessAllWorkspaces: false,
    canAccessAllTeams: false,
    canAccessAllCrmData: false,
    canViewSystemWideMetrics: false,
    canBypassAllRestrictions: false,
  };
}
