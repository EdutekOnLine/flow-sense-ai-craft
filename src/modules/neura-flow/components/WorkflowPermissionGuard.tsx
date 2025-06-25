
import { ReactNode } from 'react';
import { useEnhancedWorkflowPermissions } from '@/hooks/useEnhancedWorkflowPermissions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Crown, Zap, Users, User, AlertCircle } from 'lucide-react';

interface WorkflowPermissionGuardProps {
  children: ReactNode;
  requiredPermission?: 'view' | 'create' | 'edit' | 'delete' | 'assign';
  workflowData?: {
    createdBy?: string;
    isReusable?: boolean;
    hasAssignment?: boolean;
  };
}

export function WorkflowPermissionGuard({ 
  children, 
  requiredPermission = 'view',
  workflowData
}: WorkflowPermissionGuardProps) {
  const { 
    canViewWorkflows,
    canCreateWorkflows,
    canEditWorkflows,
    canDeleteSpecificWorkflow,
    canManageAssignments,
    canViewWorkflow,
    userRole,
    isRootUser,
    dashboardScope
  } = useEnhancedWorkflowPermissions();

  // Check specific permission based on requirement
  const hasPermission = () => {
    switch (requiredPermission) {
      case 'view':
        if (workflowData) {
          return canViewWorkflow(workflowData);
        }
        return canViewWorkflows;
      case 'create':
        return canCreateWorkflows;
      case 'edit':
        return canEditWorkflows;
      case 'delete':
        return workflowData?.createdBy ? canDeleteSpecificWorkflow(workflowData.createdBy) : false;
      case 'assign':
        return canManageAssignments;
      default:
        return canViewWorkflows;
    }
  };

  if (hasPermission()) {
    return <>{children}</>;
  }

  const getIcon = () => {
    if (isRootUser) return <Crown className="h-4 w-4 text-amber-600" />;
    if (userRole === 'admin') return <Zap className="h-4 w-4 text-blue-600" />;
    if (userRole === 'manager') return <Users className="h-4 w-4 text-green-600" />;
    if (userRole === 'employee') return <User className="h-4 w-4 text-purple-600" />;
    return <Lock className="h-4 w-4 text-red-600" />;
  };

  const getDetailedMessage = () => {
    const baseMessage = `You need ${requiredPermission} permissions for workflow operations.`;
    
    switch (userRole) {
      case 'root':
        return "You have full system access. If you're seeing this, there may be a system issue.";
      case 'admin':
        return `${baseMessage} As an admin, you have full workspace control but may be missing specific workflow access.`;
      case 'manager':
        if (requiredPermission === 'delete' && workflowData?.createdBy) {
          return "As a manager, you can only delete workflows you created. This workflow was created by someone else.";
        }
        return `${baseMessage} As a manager, you can work with workflows involving your team members only.`;
      case 'employee':
        if (requiredPermission === 'view' && workflowData) {
          return "As an employee, you can only view workflows assigned to you or reusable workflows where you're assigned to the first step.";
        }
        if (requiredPermission === 'create') {
          return "As an employee, you cannot create new workflows. Contact your manager or admin.";
        }
        return `${baseMessage} As an employee, you have limited workflow access.`;
      default:
        return baseMessage;
    }
  };

  const getScopeInfo = () => {
    switch (dashboardScope) {
      case 'global': return 'System-wide access';
      case 'workspace': return 'Full workspace access';
      case 'team': return 'Team-based access';
      case 'personal': return 'Personal assignments only';
      default: return 'Limited access';
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Alert className="max-w-lg border-amber-200 bg-amber-50">
        <div className="flex items-center gap-2 mb-2">
          {getIcon()}
          <AlertCircle className="h-4 w-4 text-amber-600" />
        </div>
        <AlertDescription className="space-y-3">
          <div className="font-medium text-amber-800">
            Access Restricted
          </div>
          
          <div className="text-sm text-amber-700">
            {getDetailedMessage()}
          </div>
          
          <div className="text-xs text-amber-600 border-t border-amber-200 pt-2">
            <div>Current role: <span className="font-medium capitalize">{userRole}</span></div>
            <div>Access scope: <span className="font-medium">{getScopeInfo()}</span></div>
            {requiredPermission === 'assign' && userRole === 'manager' && (
              <div className="mt-1 text-amber-700">
                Tip: You can only assign workflows to your team members.
              </div>
            )}
          </div>
          
          {(requiredPermission === 'create' || requiredPermission === 'edit') && userRole === 'employee' && (
            <div className="text-xs text-amber-700 bg-amber-100 p-2 rounded">
              💡 Contact your manager or administrator for workflow builder access.
            </div>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}
