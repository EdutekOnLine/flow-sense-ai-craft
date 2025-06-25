
import { useAuth } from '@/hooks/useAuth';
import { useRootPermissions } from '@/hooks/useRootPermissions';
import { useCallback, useMemo } from 'react';

export function useEnhancedWorkflowPermissions() {
  const { profile } = useAuth();
  const { isRootUser } = useRootPermissions();

  // Root users bypass all restrictions
  const canCreateWorkflows = useCallback(() => {
    if (!profile) return false;
    // Root: Global access, Admin: Workspace control, Manager: Team workflows
    return ['admin', 'manager', 'root'].includes(profile.role);
  }, [profile]);

  const canEditWorkflows = useCallback(() => {
    if (!profile) return false;
    // Root: All workflows, Admin: Workspace workflows, Manager: Team workflows only
    return ['admin', 'manager', 'root'].includes(profile.role);
  }, [profile]);

  const canDeleteWorkflows = useCallback(() => {
    if (!profile) return false;
    // Root: All workflows, Admin: All in workspace, Manager: Only own workflows
    return ['admin', 'manager', 'root'].includes(profile.role);
  }, [profile]);

  const canViewWorkflows = useCallback(() => {
    if (!profile) return false;
    // All authenticated users can view workflows based on their role restrictions
    return true;
  }, [profile]);

  const canManageAssignments = useCallback(() => {
    if (!profile) return false;
    // Root: All assignments, Admin: Workspace assignments, Manager: Team assignments only
    return ['admin', 'manager', 'root'].includes(profile.role);
  }, [profile]);

  const canAccessWorkflowBuilder = useCallback(() => {
    if (!profile) return false;
    // Only admin and manager roles can access the workflow builder
    return ['admin', 'manager', 'root'].includes(profile.role);
  }, [profile]);

  const canDeleteSpecificWorkflow = useCallback((workflowCreatedBy: string) => {
    if (!profile) return false;
    
    // Root can delete any workflow
    if (profile.role === 'root') return true;
    
    // Admin can delete any workflow in their workspace
    if (profile.role === 'admin') return true;
    
    // Manager can only delete workflows they created (strict rule per requirements)
    if (profile.role === 'manager') return workflowCreatedBy === profile.id;
    
    // Employees cannot delete workflows
    return false;
  }, [profile]);

  const canAssignToUser = useCallback((targetUserId: string) => {
    if (!profile) return false;
    
    // Root can assign to anyone
    if (profile.role === 'root') return true;
    
    // Admin can assign to anyone in their workspace
    if (profile.role === 'admin') return true;
    
    // Manager can only assign to their team members - this is now enforced by RLS
    if (profile.role === 'manager') {
      return true; // RLS policies will enforce team restrictions
    }
    
    // Employees cannot assign workflows
    return false;
  }, [profile]);

  const canViewWorkflow = useCallback((workflowData: {
    createdBy?: string;
    isReusable?: boolean;
    hasAssignment?: boolean;
  }) => {
    if (!profile) return false;
    
    // Root can view all workflows
    if (profile.role === 'root') return true;
    
    // Admin can view all workflows in their workspace
    if (profile.role === 'admin') return true;
    
    // Manager can view workflows involving their team - enforced by RLS
    if (profile.role === 'manager') {
      return workflowData.createdBy === profile.id || workflowData.hasAssignment;
    }
    
    // Employee can view only if assigned to it, or if it's reusable
    if (profile.role === 'employee') {
      return workflowData.hasAssignment || workflowData.isReusable || workflowData.createdBy === profile.id;
    }
    
    return false;
  }, [profile]);

  const hasWorkflowPermissions = useCallback(() => {
    return canCreateWorkflows() || canEditWorkflows() || canDeleteWorkflows();
  }, [canCreateWorkflows, canEditWorkflows, canDeleteWorkflows]);

  const canAccessCrossWorkspace = useCallback(() => {
    return isRootUser;
  }, [isRootUser]);

  const getDashboardScope = useCallback(() => {
    if (!profile) return 'none';
    
    if (profile.role === 'root') return 'global';
    if (profile.role === 'admin') return 'workspace';
    if (profile.role === 'manager') return 'team';
    if (profile.role === 'employee') return 'personal';
    
    return 'none';
  }, [profile]);

  // Memoize the return object to prevent unnecessary re-renders
  const permissions = useMemo(() => ({
    // Basic permissions
    canCreateWorkflows: canCreateWorkflows(),
    canEditWorkflows: canEditWorkflows(),
    canDeleteWorkflows: canDeleteWorkflows(),
    canViewWorkflows: canViewWorkflows(),
    canManageAssignments: canManageAssignments(),
    canAccessWorkflowBuilder: canAccessWorkflowBuilder(),
    hasWorkflowPermissions: hasWorkflowPermissions(),
    canAccessCrossWorkspace: canAccessCrossWorkspace(),

    // Advanced permission functions
    canDeleteSpecificWorkflow,
    canAssignToUser,
    canViewWorkflow,

    // User info
    isRootUser,
    isAdmin: profile?.role === 'admin',
    isManager: profile?.role === 'manager',
    isEmployee: profile?.role === 'employee',
    userRole: profile?.role,
    workspaceId: profile?.workspace_id,
    dashboardScope: getDashboardScope(),
  }), [
    canCreateWorkflows, canEditWorkflows, canDeleteWorkflows, canViewWorkflows,
    canManageAssignments, canAccessWorkflowBuilder, hasWorkflowPermissions,
    canAccessCrossWorkspace, canDeleteSpecificWorkflow, canAssignToUser,
    canViewWorkflow, isRootUser, profile, getDashboardScope
  ]);

  return permissions;
}
