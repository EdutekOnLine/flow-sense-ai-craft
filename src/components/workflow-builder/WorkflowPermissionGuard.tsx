
import React from 'react';
import { useWorkflowPermissions } from '@/hooks/useWorkflowPermissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, UserX } from 'lucide-react';

interface WorkflowPermissionGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function WorkflowPermissionGuard({ children, fallback }: WorkflowPermissionGuardProps) {
  const { hasWorkflowPermissions, userRole } = useWorkflowPermissions();

  if (!hasWorkflowPermissions) {
    return fallback || (
      <div className="h-[800px] w-full flex items-center justify-center bg-gray-50">
        <Card className="w-96">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-xl text-gray-900">Access Restricted</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              You don't have permission to access the Workflow Builder.
            </p>
            <p className="text-sm text-gray-500">
              Current role: <span className="font-medium capitalize">{userRole}</span>
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Contact your administrator to request access.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
