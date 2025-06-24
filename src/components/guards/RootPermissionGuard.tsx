
import React from 'react';
import { useRootPermissions } from '@/hooks/useRootPermissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Lock } from 'lucide-react';

interface RootPermissionGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireRoot?: boolean;
}

export function RootPermissionGuard({ 
  children, 
  fallback, 
  requireRoot = false 
}: RootPermissionGuardProps) {
  const { isRootUser } = useRootPermissions();

  if (requireRoot && !isRootUser) {
    return fallback || (
      <div className="h-[600px] w-full flex items-center justify-center bg-gray-50">
        <Card className="w-96">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <Crown className="h-6 w-6 text-amber-600" />
            </div>
            <CardTitle className="text-xl text-gray-900">Root Access Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              This feature requires root-level permissions to access system-wide data.
            </p>
            <p className="text-sm text-gray-500">
              Only root users can manage data across all workspaces and view system-wide metrics.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
