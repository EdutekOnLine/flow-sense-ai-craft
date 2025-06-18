
import { ReactNode } from 'react';
import { useWorkflowPermissions } from '@/hooks/useWorkflowPermissions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock } from 'lucide-react';

interface WorkflowPermissionGuardProps {
  children: ReactNode;
}

export function WorkflowPermissionGuard({ children }: WorkflowPermissionGuardProps) {
  const { canViewWorkflows } = useWorkflowPermissions();

  if (!canViewWorkflows) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert className="max-w-md">
          <Lock className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access workflow functionality. Contact your administrator for access.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}
