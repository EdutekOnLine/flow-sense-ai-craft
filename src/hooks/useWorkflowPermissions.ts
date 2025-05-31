
import { useAuth } from '@/hooks/useAuth';

export function useWorkflowPermissions() {
  const { profile } = useAuth();

  const canCreateWorkflows = () => {
    if (!profile) return false;
    return ['admin', 'manager'].includes(profile.role);
  };

  const canEditWorkflows = () => {
    if (!profile) return false;
    return ['admin', 'manager'].includes(profile.role);
  };

  const canDeleteWorkflows = () => {
    if (!profile) return false;
    return ['admin', 'manager'].includes(profile.role);
  };

  const canViewWorkflows = () => {
    if (!profile) return false;
    // All authenticated users can view workflows, but they'll only see their own or those they have permission to see
    return true;
  };

  return {
    canCreateWorkflows: canCreateWorkflows(),
    canEditWorkflows: canEditWorkflows(),
    canDeleteWorkflows: canDeleteWorkflows(),
    canViewWorkflows: canViewWorkflows(),
    hasWorkflowPermissions: canCreateWorkflows() || canEditWorkflows() || canDeleteWorkflows(),
    userRole: profile?.role
  };
}
