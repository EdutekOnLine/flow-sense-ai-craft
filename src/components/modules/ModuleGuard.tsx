
import { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useModulePermissions } from '@/hooks/useModulePermissions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Lock, ArrowLeft, Settings } from 'lucide-react';

interface ModuleGuardProps {
  moduleName: string;
  children: ReactNode;
  fallback?: ReactNode;
  showDetailedStatus?: boolean;
  redirectPath?: string;
}

export function ModuleGuard({ 
  moduleName, 
  children, 
  fallback, 
  showDetailedStatus = true,
  redirectPath = '/'
}: ModuleGuardProps) {
  const { profile } = useAuth();
  const { canAccessModule, canManageModules } = useModulePermissions();
  const [hasAccess, setHasAccess] = useState(true); // Start optimistically

  useEffect(() => {
    // Quick access check - don't block rendering
    if (!profile) {
      setHasAccess(false);
      return;
    }

    // Root users always have access
    if (profile.role === 'root') {
      setHasAccess(true);
      return;
    }

    // Core modules are always accessible
    if (moduleName === 'neura-core') {
      setHasAccess(true);
      return;
    }

    // Check module access without blocking
    const access = canAccessModule(moduleName);
    setHasAccess(access);
  }, [moduleName, canAccessModule, profile]);

  // Optimistic rendering - show content unless explicitly denied
  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-muted-foreground">Please sign in to continue</div>
      </div>
    );
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  const handleGoBack = () => {
    window.history.length > 1 ? window.history.back() : window.location.replace(redirectPath);
  };

  const handleManageModules = () => {
    window.location.hash = 'module-management';
  };

  // Lightweight access denied UI
  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-muted/10 rounded-full flex items-center justify-center">
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          
          <div className="space-y-2">
            <AlertTitle className="text-xl">Module Not Available</AlertTitle>
            <Badge variant="secondary" className="mx-auto">
              Access Restricted
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {showDetailedStatus && (
            <Alert>
              <AlertDescription className="text-sm">
                This module is not activated in your current workspace.
                {canManageModules() ? (
                  <span> You can enable it in the module management settings.</span>
                ) : (
                  <span> Contact your workspace administrator to enable access.</span>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleGoBack}
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>

            {canManageModules() && (
              <Button 
                variant="default" 
                size="sm"
                onClick={handleManageModules}
                className="flex-1"
              >
                <Settings className="h-4 w-4 mr-2" />
                Manage Modules
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
