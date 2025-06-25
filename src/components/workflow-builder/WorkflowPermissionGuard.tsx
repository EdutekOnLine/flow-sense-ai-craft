
import React from 'react';
import { useEnhancedWorkflowPermissions } from '@/hooks/useEnhancedWorkflowPermissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Crown, Zap, Users, User } from 'lucide-react';

interface WorkflowPermissionGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requiredPermission?: 'view' | 'create' | 'edit' | 'delete' | 'assign';
  workflowData?: {
    createdBy?: string;
    isReusable?: boolean;
    hasAssignment?: boolean;
  };
}

export function WorkflowPermissionGuard({ 
  children, 
  fallback,
  requiredPermission = 'view',
  workflowData
}: WorkflowPermissionGuardProps) {
  const { 
    canAccessWorkflowBuilder,
    canCreateWorkflows,
    canEditWorkflows,
    canDeleteSpecificWorkflow,
    canManageAssignments,
    canViewWorkflow,
    userRole, 
    isRootUser,
    workspaceId,
    dashboardScope
  } = useEnhancedWorkflowPermissions();

  // Check specific permission based on requirement
  const hasPermission = () => {
    switch (requiredPermission) {
      case 'view':
        if (workflowData) {
          return canViewWorkflow(workflowData);
        }
        return canAccessWorkflowBuilder;
      case 'create':
        return canCreateWorkflows;
      case 'edit':
        return canEditWorkflows;
      case 'delete':
        return workflowData?.createdBy ? canDeleteSpecificWorkflow(workflowData.createdBy) : false;
      case 'assign':
        return canManageAssignments;
      default:
        return canAccessWorkflowBuilder;
    }
  };

  // Allow access if user has required permission
  if (hasPermission()) {
    return <>{children}</>;
  }

  // Show custom fallback if provided
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default permission denied UI
  const getPermissionIcon = () => {
    if (isRootUser) return <Crown className="h-6 w-6 text-amber-600" />;
    if (userRole === 'admin') return <Zap className="h-6 w-6 text-blue-600" />;
    if (userRole === 'manager') return <Users className="h-6 w-6 text-green-600" />;
    if (userRole === 'employee') return <User className="h-6 w-6 text-purple-600" />;
    return <Lock className="h-6 w-6 text-red-600" />;
  };

  const getPermissionMessage = () => {
    const baseMessage = `You need ${requiredPermission} permissions for this workflow action.`;
    
    switch (userRole) {
      case 'root':
        return "Welcome! You have full system access.";
      case 'admin':
        return `${baseMessage} As an admin, you have full workspace control.`;
      case 'manager':
        return `${baseMessage} As a manager, you can work with workflows involving your team.`;
      case 'employee':
        return `${baseMessage} As an employee, you can only access assigned workflows.`;
      default:
        return baseMessage;
    }
  };

  const getScopeInfo = () => {
    switch (dashboardScope) {
      case 'global': return 'Full system access across all workspaces';
      case 'workspace': return `Full access within your workspace`;
      case 'team': return 'Access to workflows involving your team';
      case 'personal': return 'Access to your assigned and created workflows';
      default: return 'Limited access';
    }
  };

  return (
    <div className="h-[600px] w-full flex items-center justify-center bg-gray-50">
      <Card className="w-96">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
            {getPermissionIcon()}
          </div>
          <CardTitle className="text-xl text-gray-900">
            Access Control
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 mb-4">
            {getPermissionMessage()}
          </p>
          
          <div className="space-y-2 text-sm text-gray-500">
            <p>Current role: <span className="font-medium capitalize">{userRole}</span></p>
            <p>Access scope: <span className="font-medium">{getScopeInfo()}</span></p>
            {workspaceId && (
              <p>Workspace: <span className="font-medium font-mono text-xs">{workspaceId}</span></p>
            )}
          </div>
          
          {!hasPermission() && (
            <p className="text-amber-600 mt-4 text-sm">
              {requiredPermission === 'create' || requiredPermission === 'edit' 
                ? "Contact your administrator for workflow builder access."
                : "You don't have permission for this specific workflow action."
              }
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
