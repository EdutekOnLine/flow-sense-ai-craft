
import { ReactNode } from 'react';
import { useEnhancedWorkflowPermissions } from '@/hooks/useEnhancedWorkflowPermissions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Crown, Zap, Users, User } from 'lucide-react';

interface WorkflowPermissionGuardProps {
  children: ReactNode;
}

export function WorkflowPermissionGuard({ children }: WorkflowPermissionGuardProps) {
  const { 
    canViewWorkflows,
    userRole,
    isRootUser,
    dashboardScope
  } = useEnhancedWorkflowPermissions();

  if (!canViewWorkflows) {
    const getIcon = () => {
      if (isRootUser) return <Crown className="h-4 w-4" />;
      if (userRole === 'admin') return <Zap className="h-4 w-4" />;
      if (userRole === 'manager') return <Users className="h-4 w-4" />;
      if (userRole === 'employee') return <User className="h-4 w-4" />;
      return <Lock className="h-4 w-4" />;
    };

    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert className="max-w-md">
          {getIcon()}
          <AlertDescription>
            You don't have permission to access workflow functionality. 
            Your current role ({userRole}) with {dashboardScope} scope limits workflow access.
            Contact your administrator for access.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}
