
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Info,
  Package,
  AlertTriangle,
  Loader2,
  Lock
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useWorkspaceManagement } from '@/hooks/useWorkspaceManagement';
import { supabase } from '@/integrations/supabase/client';

interface Module {
  name: string;
  displayName: string;
  isActive: boolean;
  isAvailable: boolean;
  isRestricted: boolean;
  statusMessage?: string;
  hasDependencies?: boolean;
  missingDependencies?: string[];
}

interface ModuleCardProps {
  module: Module;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  onToggle: (moduleId: string, isActive: boolean) => Promise<void>;
  isLoading: boolean;
}

interface DependentModule {
  module_name: string;
  display_name: string;
  is_active: boolean;
}

export function ModuleCard({ module, isSelected, onSelect, onToggle, isLoading }: ModuleCardProps) {
  const { workspace, effectiveWorkspaceId } = useWorkspaceManagement();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingAction, setPendingAction] = useState<boolean | null>(null);
  const [dependentModules, setDependentModules] = useState<DependentModule[]>([]);
  const [loadingDependencies, setLoadingDependencies] = useState(false);

  const isNeuraCoreModule = module.name === 'neura-core';
  const canToggle = !isNeuraCoreModule && !isLoading;

  const handleToggleClick = async (newState: boolean) => {
    if (!canToggle) {
      return;
    }
    
    setPendingAction(newState);
    
    // If deactivating, check for dependent modules
    if (!newState && effectiveWorkspaceId) {
      setLoadingDependencies(true);
      try {
        const { data, error } = await supabase
          .rpc('get_dependent_modules', {
            p_workspace_id: effectiveWorkspaceId,
            p_module_name: module.name
          });
        
        if (!error && data) {
          const activeDependents = data.filter(dep => dep.is_active);
          setDependentModules(activeDependents);
        }
      } catch (error) {
        console.error('Failed to fetch dependent modules:', error);
      } finally {
        setLoadingDependencies(false);
      }
    }
    
    setShowConfirmation(true);
  };

  const confirmToggle = async () => {
    if (pendingAction !== null) {
      await onToggle(module.name, pendingAction);
      setPendingAction(null);
      setDependentModules([]);
    }
    setShowConfirmation(false);
  };

  const cancelToggle = () => {
    setPendingAction(null);
    setDependentModules([]);
    setShowConfirmation(false);
  };

  const getStatusIcon = () => {
    if (isLoading) return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    if (isNeuraCoreModule) return <Lock className="h-4 w-4 text-blue-500" />;
    if (module.isActive) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (module.isRestricted) return <XCircle className="h-4 w-4 text-red-500" />;
    return <AlertCircle className="h-4 w-4 text-yellow-500" />;
  };

  const getStatusBadge = () => {
    if (isNeuraCoreModule) {
      return <Badge variant="default" className="bg-blue-100 text-blue-800">Core System</Badge>;
    }
    if (module.isActive) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
    }
    if (module.isRestricted) {
      return <Badge variant="destructive">Inactive</Badge>;
    }
    return <Badge variant="secondary">Available</Badge>;
  };

  const getModuleDescription = () => {
    const descriptions: Record<string, string> = {
      'neura-core': 'Essential platform functionality including user management and core features. This module is required and cannot be disabled.',
      'neura-flow': 'Advanced workflow automation and process management capabilities',
      'neura-crm': 'Customer relationship management and sales tracking tools',
      'neura-forms': 'Dynamic form builder with data collection and validation',
      'neura-edu': 'Educational content management and learning tracking system'
    };
    return descriptions[module.name] || 'Module functionality and features';
  };

  return (
    <>
      <Card className={`transition-all duration-200 hover:shadow-md ${isSelected ? 'ring-2 ring-primary' : ''} ${isLoading ? 'opacity-75' : ''} ${isNeuraCoreModule ? 'border-blue-200 bg-blue-50/30' : ''}`}>
        <CardHeader className="space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <CardTitle className="text-lg">{module.displayName}</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={isSelected}
                onCheckedChange={onSelect}
                disabled={isLoading || isNeuraCoreModule}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              {getStatusBadge()}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {getModuleDescription()}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Module Status</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {module.isActive ? 'Enabled' : 'Disabled'}
              </span>
              <Switch
                checked={module.isActive}
                onCheckedChange={handleToggleClick}
                disabled={!canToggle}
              />
            </div>
          </div>

          {isNeuraCoreModule && (
            <Alert className="border-blue-200 bg-blue-50">
              <Lock className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                This is a core system module that is required for platform functionality and cannot be disabled.
              </AlertDescription>
            </Alert>
          )}
          
          {module.statusMessage && !isNeuraCoreModule && (
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{module.statusMessage}</span>
            </div>
          )}

          {module.missingDependencies && module.missingDependencies.length > 0 && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                Missing dependencies: {module.missingDependencies.join(', ')}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-xs text-muted-foreground">Module ID: {module.name}</span>
            <Button variant="ghost" size="sm" className="h-8" disabled={isLoading}>
              <Settings className="h-3 w-3 mr-1" />
              Configure
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction ? 'Enable' : 'Disable'} {module.displayName}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  {pendingAction 
                    ? `Are you sure you want to enable ${module.displayName} for ${workspace?.name || 'this workspace'}? This will make its features available to users with appropriate permissions.`
                    : `Are you sure you want to disable ${module.displayName} for ${workspace?.name || 'this workspace'}? This will immediately restrict access to its features for all users in this workspace.`
                  }
                </p>
                
                {!pendingAction && dependentModules.length > 0 && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      <div className="space-y-2">
                        <p className="font-medium">Warning: Other modules depend on this module!</p>
                        <p>The following active modules will be affected:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {dependentModules.map(dep => (
                            <li key={dep.module_name} className="text-sm">
                              {dep.display_name}
                            </li>
                          ))}
                        </ul>
                        <p className="text-sm">Consider deactivating these modules first.</p>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {loadingDependencies && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Checking dependencies...
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelToggle}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmToggle}
              className={!pendingAction && dependentModules.length > 0 ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              {pendingAction ? 'Enable' : 'Disable'} Module
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
