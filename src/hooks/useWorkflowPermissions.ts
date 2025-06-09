
import { useAuth } from '@/hooks/useAuth';

export function useWorkflowPermissions() {
  const { profile } = useAuth();

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
    // All authenticated users can view workflows, but they'll only see their own or those they have permission to see
    return true;
  };

  const isRootUser = () => {
    if (!profile) return false;
    return profile.role === 'root';
  };

  const isAdmin = () => {
    if (!profile) return false;
    return ['admin', 'root'].includes(profile.role);
  };

  return {
    canCreateWorkflows: canCreateWorkflows(),
    canEditWorkflows: canEditWorkflows(),
    canDeleteWorkflows: canDeleteWorkflows(),
    canViewWorkflows: canViewWorkflows(),
    hasWorkflowPermissions: canCreateWorkflows() || canEditWorkflows() || canDeleteWorkflows(),
    isRootUser: isRootUser(),
    isAdmin: isAdmin(),
    userRole: profile?.role
  };
}
