
import React from 'react';
import { useEnhancedWorkflowPermissions } from '@/hooks/useEnhancedWorkflowPermissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Crown, Zap } from 'lucide-react';

interface WorkflowPermissionGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function WorkflowPermissionGuard({ children, fallback }: WorkflowPermissionGuardProps) {
  const { 
    canAccessWorkflowBuilder, 
    userRole, 
    isRootUser,
    workspaceId 
  } = useEnhancedWorkflowPermissions();

  // Allow access if user has workflow builder permissions
  if (canAccessWorkflowBuilder) {
    return <>{children}</>;
  }

  return fallback || (
    <div className="h-[800px] w-full flex items-center justify-center bg-gray-50">
      <Card className="w-96">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
            {isRootUser ? (
              <Crown className="h-6 w-6 text-amber-600" />
            ) : userRole === 'admin' ? (
              <Zap className="h-6 w-6 text-blue-600" />
            ) : (
              <Lock className="h-6 w-6 text-red-600" />
            )}
          </div>
          <CardTitle className="text-xl text-gray-900">
            Workflow Builder Access
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 mb-4">
            {isRootUser 
              ? 'Welcome! You have full system access to the Workflow Builder.'
              : userRole === 'admin'
              ? 'As an admin, you have access to the Workflow Builder.'
              : userRole === 'manager'
              ? 'As a manager, you have access to the Workflow Builder.'
              : "The Workflow Builder requires admin or manager permissions."
            }
          </p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>Current role: <span className="font-medium capitalize">{userRole}</span></p>
            {workspaceId && (
              <p>Workspace: <span className="font-medium">{workspaceId}</span></p>
            )}
            {!canAccessWorkflowBuilder && (
              <p className="text-amber-600 mt-3">
                Contact your administrator to request workflow builder access.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
