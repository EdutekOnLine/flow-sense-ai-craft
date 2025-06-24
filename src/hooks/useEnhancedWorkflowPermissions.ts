
import { useAuth } from './useAuth';
import { useRootPermissions } from './useRootPermissions';

/**
 * Enhanced workflow permissions with comprehensive root user bypass
 */
export function useEnhancedWorkflowPermissions() {
  const { profile } = useAuth();
  const { isRootUser } = useRootPermissions();

  // Root users have all workflow permissions across all workspaces
  if (isRootUser) {
    return {
      hasWorkflowPermissions: true,
      canCreateWorkflows: true,
      canEditAllWorkflows: true,
      canDeleteAllWorkflows: true,
      canAssignAcrossWorkspaces: true,
      canViewAllWorkflowMetrics: true,
      canManageAllAssignments: true,
      userRole: 'root' as const,
      isLoading: false,
    };
  }

  // For non-root users, check traditional permissions
  const hasWorkflowPermissions = profile?.role === 'admin' || profile?.role === 'manager';

  return {
    hasWorkflowPermissions,
    canCreateWorkflows: hasWorkflowPermissions,
    canEditAllWorkflows: profile?.role === 'admin',
    canDeleteAllWorkflows: profile?.role === 'admin',
    canAssignAcrossWorkspaces: false,
    canViewAllWorkflowMetrics: profile?.role === 'admin',
    canManageAllAssignments: profile?.role === 'admin',
    userRole: profile?.role || 'employee',
    isLoading: false,
  };
}
