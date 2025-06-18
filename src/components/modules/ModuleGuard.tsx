
import { ReactNode } from 'react';
import { useModulePermissions } from '@/hooks/useModulePermissions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lock, AlertCircle, Settings } from 'lucide-react';

interface ModuleGuardProps {
  moduleName: string;
  children: ReactNode;
  fallback?: ReactNode;
  showDetailedStatus?: boolean;
}

export function ModuleGuard({ 
  moduleName, 
  children, 
  fallback, 
  showDetailedStatus = true 
}: ModuleGuardProps) {
  const { 
    canAccessModule, 
    getModuleStatus, 
    getModuleDisplayName,
    canManageModules 
  } = useModulePermissions();

  const moduleStatus = getModuleStatus(moduleName);
  const displayName = getModuleDisplayName(moduleName);

  if (canAccessModule(moduleName)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <div className="max-w-md w-full">
        <Alert className="text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-2">
              {moduleStatus.isRestricted ? (
                <Lock className="h-5 w-5 text-muted-foreground" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              )}
              <AlertTitle className="text-lg">{displayName} Not Available</AlertTitle>
            </div>
            
            {showDetailedStatus && (
              <div className="space-y-2">
                <Badge 
                  variant={moduleStatus.isActive ? "default" : "secondary"}
                  className="mb-2"
                >
                  {moduleStatus.statusMessage}
                </Badge>
                
                <AlertDescription className="text-sm text-muted-foreground">
                  {moduleStatus.isRestricted ? (
                    <>
                      This module is not available in your current workspace. 
                      {canManageModules() ? (
                        <span> You can enable it in the module settings.</span>
                      ) : (
                        <span> Contact your administrator to enable access.</span>
                      )}
                    </>
                  ) : (
                    'This module is currently inactive. Please try again later or contact support.'
                  )}
                </AlertDescription>
              </div>
            )}

            {canManageModules() && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  // Navigate to module management
                  window.location.hash = 'settings';
                }}
              >
                <Settings className="h-4 w-4 mr-2" />
                Manage Modules
              </Button>
            )}
          </div>
        </Alert>
      </div>
    </div>
  );
}
