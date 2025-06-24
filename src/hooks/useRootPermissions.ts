
import { useAuth } from './useAuth';

/**
 * Centralized hook for root user permissions
 * Root users (role = 'root', workspace_id = null) bypass all restrictions
 */
export function useRootPermissions() {
  const { profile } = useAuth();

  const isRootUser = profile?.role === 'root';

  return {
    isRootUser,
    // Root users can do everything
    canAccessAllWorkspaces: isRootUser,
    canAccessAllTeams: isRootUser,
    canAccessAllCrmData: isRootUser,
    canAccessAllWorkflows: isRootUser,
    canAccessAllUsers: isRootUser,
    canManageAllModules: isRootUser,
    canViewSystemWideMetrics: isRootUser,
    canBypassWorkspaceRestrictions: isRootUser,
    canBypassTeamRestrictions: isRootUser,
    canCreateAcrossWorkspaces: isRootUser,
    canEditAcrossWorkspaces: isRootUser,
    canDeleteAcrossWorkspaces: isRootUser,
  };
}
