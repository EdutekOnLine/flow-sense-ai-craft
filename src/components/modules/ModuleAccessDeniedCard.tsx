
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lock, AlertCircle, Settings, ArrowLeft, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import type { ModuleStatus } from '@/hooks/useModulePermissions';

interface ModuleAccessDeniedCardProps {
  displayName: string;
  moduleStatus: ModuleStatus;
  isOnline: boolean;
  showDetailedStatus: boolean;
  canManageModules: boolean;
  onGoBack: () => void;
  onRetry: () => void;
  onManageModules: () => void;
}

export function ModuleAccessDeniedCard({
  displayName,
  moduleStatus,
  isOnline,
  showDetailedStatus,
  canManageModules,
  onGoBack,
  onRetry,
  onManageModules
}: ModuleAccessDeniedCardProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-muted/10 rounded-full flex items-center justify-center">
              {!isOnline ? (
                <WifiOff className="h-8 w-8 text-red-500" />
              ) : moduleStatus.isRestricted ? (
                <Lock className="h-8 w-8 text-muted-foreground" />
              ) : (
                <AlertCircle className="h-8 w-8 text-yellow-500" />
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <AlertTitle className="text-xl">
              {!isOnline ? 'Connection Lost' : `${displayName} Not Available`}
            </AlertTitle>
            <div className="flex items-center justify-center gap-2">
              <Badge 
                variant={moduleStatus.isActive ? "default" : "secondary"}
                className="mx-auto"
              >
                {!isOnline ? 'Offline' : moduleStatus.statusMessage}
              </Badge>
              {!isOnline && <WifiOff className="h-4 w-4 text-red-500" />}
              {isOnline && <Wifi className="h-4 w-4 text-green-500" />}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {!isOnline ? (
            <Alert className="border-red-200 bg-red-50">
              <WifiOff className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                You appear to be offline. Please check your internet connection and try again.
              </AlertDescription>
            </Alert>
          ) : showDetailedStatus && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                {moduleStatus.isRestricted ? (
                  <>
                    This module is not activated in your current workspace. 
                    {canManageModules ? (
                      <span> You can enable it in the module management settings.</span>
                    ) : (
                      <span> Contact your workspace administrator to enable access.</span>
                    )}
                  </>
                ) : (
                  'This module is currently unavailable. Please try again later or contact support.'
                )}
              </AlertDescription>
            </Alert>
          )}

          {moduleStatus.missingDependencies && moduleStatus.missingDependencies.length > 0 && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <div className="space-y-1">
                  <p className="font-medium">Missing required modules:</p>
                  <ul className="list-disc list-inside text-sm">
                    {moduleStatus.missingDependencies.map(dep => (
                      <li key={dep}>{dep}</li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={onGoBack}
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>

            <Button 
              variant="outline" 
              size="sm"
              onClick={onRetry}
              className="flex-1"
              disabled={!isOnline}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>

            {canManageModules && (
              <Button 
                variant="default" 
                size="sm"
                onClick={onManageModules}
                className="flex-1"
                disabled={!isOnline}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
