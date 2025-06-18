
import { ReactNode } from 'react';
import { useModulePermissions } from '@/hooks/useModulePermissions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock } from 'lucide-react';

interface ModuleGuardProps {
  moduleName: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function ModuleGuard({ moduleName, children, fallback }: ModuleGuardProps) {
  const { canAccessModule } = useModulePermissions();

  if (!canAccessModule(moduleName)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert className="max-w-md">
          <Lock className="h-4 w-4" />
          <AlertDescription>
            This module is not available in your current workspace. Contact your administrator to enable access.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}
