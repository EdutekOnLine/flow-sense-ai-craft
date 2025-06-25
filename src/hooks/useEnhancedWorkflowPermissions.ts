
import { useAuth } from '@/hooks/useAuth';
import { useRootPermissions } from '@/hooks/useRootPermissions';

export function useEnhancedWorkflowPermissions() {
  const { profile } = useAuth();
  const { isRootUser } = useRootPermissions();

  const canCreateWorkflows = () => {
    if (!profile) return false;
    return ['admin', 'manager', 'root'].includes(profile.role);
  };

  const canEditWorkflows = () => {
    if (!profile) return false;
    return ['admin', 'manager', 'root'].includes(profile.role);
  };

  const canDeleteWorkflows = () => {
    if (!profile) return false;
    return ['admin', 'manager', 'root'].includes(profile.role);
  };

  const canViewWorkflows = () => {
    if (!profile) return false;
    // All authenticated users can view workflows, but RLS will filter by workspace
    return true;
  };

  const canManageAssignments = () => {
    if (!profile) return false;
    return ['admin', 'manager', 'root'].includes(profile.role);
  };

  const canAccessWorkflowBuilder = () => {
    if (!profile) return false;
    return ['admin', 'manager', 'root'].includes(profile.role);
  };

  const hasWorkflowPermissions = () => {
    return canCreateWorkflows() || canEditWorkflows() || canDeleteWorkflows();
  };

  const canAccessCrossWorkspace = () => {
    return isRootUser;
  };

  return {
    canCreateWorkflows: canCreateWorkflows(),
    canEditWorkflows: canEditWorkflows(),
    canDeleteWorkflows: canDeleteWorkflows(),
    canViewWorkflows: canViewWorkflows(),
    canManageAssignments: canManageAssignments(),
    canAccessWorkflowBuilder: canAccessWorkflowBuilder(),
    hasWorkflowPermissions: hasWorkflowPermissions(),
    canAccessCrossWorkspace: canAccessCrossWorkspace(),
    isRootUser,
    isAdmin: profile?.role === 'admin',
    isManager: profile?.role === 'manager',
    isEmployee: profile?.role === 'employee',
    userRole: profile?.role,
    workspaceId: profile?.workspace_id
  };
}
