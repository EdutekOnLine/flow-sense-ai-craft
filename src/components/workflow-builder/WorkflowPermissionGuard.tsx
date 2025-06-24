
import React from 'react';
import { useEnhancedWorkflowPermissions } from '@/hooks/useEnhancedWorkflowPermissions';
import { useRootPermissions } from '@/hooks/useRootPermissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Crown } from 'lucide-react';

interface WorkflowPermissionGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function WorkflowPermissionGuard({ children, fallback }: WorkflowPermissionGuardProps) {
  const { hasWorkflowPermissions, userRole } = useEnhancedWorkflowPermissions();
  const { isRootUser } = useRootPermissions();

  // Root users always have access
  if (isRootUser || hasWorkflowPermissions) {
    return <>{children}</>;
  }

  return fallback || (
    <div className="h-[800px] w-full flex items-center justify-center bg-gray-50">
      <Card className="w-96">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            {isRootUser ? (
              <Crown className="h-6 w-6 text-amber-600" />
            ) : (
              <Lock className="h-6 w-6 text-red-600" />
            )}
          </div>
          <CardTitle className="text-xl text-gray-900">
            {isRootUser ? 'Root Access' : 'Access Restricted'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 mb-4">
            {isRootUser 
              ? 'You have full system access to the Workflow Builder.'
              : "You don't have permission to access the Workflow Builder."
            }
          </p>
          <p className="text-sm text-gray-500">
            Current role: <span className="font-medium capitalize">{userRole}</span>
          </p>
          {!isRootUser && (
            <p className="text-sm text-gray-500 mt-2">
              Contact your administrator to request access.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
