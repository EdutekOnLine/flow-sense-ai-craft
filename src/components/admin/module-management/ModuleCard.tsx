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
  GitBranch
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
import { useWorkspace } from '@/hooks/useWorkspace';
import { useDependencyGraph } from '@/hooks/useDependencyGraph';
import { CascadingDeactivationDialog } from './CascadingDeactivationDialog';

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
  const { workspace } = useWorkspace();
  const { getModuleDependents, canSafelyDeactivate } = useDependencyGraph();
  const [showCascadingDialog, setShowCascadingDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<boolean | null>(null);

  const dependents = getModuleDependents(module.name);
  const canSafelyDeact = canSafelyDeactivate([module.name]);

  const handleToggleClick = async (newState: boolean) => {
    if (module.name === 'neura-core') {
      return;
    }
    
    setPendingAction(newState);
    
    // For deactivation, check if we need the cascading dialog
    if (!newState && (!canSafelyDeact || dependents.length > 0)) {
      setShowCascadingDialog(true);
    } else {
      // Safe to proceed directly
      await onToggle(module.name, newState);
      setPendingAction(null);
    }
  };

  const handleCascadingConfirm = async () => {
    if (pendingAction !== null) {
      await onToggle(module.name, pendingAction);
      setPendingAction(null);
    }
  };

  const handleCascadingCancel = () => {
    setPendingAction(null);
  };

  const getStatusIcon = () => {
    if (isLoading) return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    if (module.name === 'neura-core') return <Package className="h-4 w-4 text-blue-500" />;
    if (module.isActive) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (module.isRestricted) return <XCircle className="h-4 w-4 text-red-500" />;
    return <AlertCircle className="h-4 w-4 text-yellow-500" />;
  };

  const getStatusBadge = () => {
    if (module.name === 'neura-core') {
      return <Badge variant="default" className="bg-blue-100 text-blue-800">Core</Badge>;
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
      'neura-core': 'Essential platform functionality including user management and core features',
      'neura-flow': 'Advanced workflow automation and process management capabilities',
      'neura-crm': 'Customer relationship management and sales tracking tools',
      'neura-forms': 'Dynamic form builder with data collection and validation',
      'neura-edu': 'Educational content management and learning tracking system'
    };
    return descriptions[module.name] || 'Module functionality and features';
  };

  return (
    <>
      <Card className={`transition-all duration-200 hover:shadow-md ${isSelected ? 'ring-2 ring-primary' : ''} ${isLoading ? 'opacity-75' : ''}`}>
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
                disabled={isLoading}
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
                disabled={module.name === 'neura-core' || isLoading}
              />
            </div>
          </div>
          
          {/* Dependency information */}
          {dependents.length > 0 && (
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-md">
              <GitBranch className="h-4 w-4 text-blue-600" />
              <span className="text-xs text-blue-800">
                {dependents.length} module{dependents.length !== 1 ? 's' : ''} depend{dependents.length === 1 ? 's' : ''} on this
              </span>
            </div>
          )}
          
          {module.statusMessage && (
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

      <CascadingDeactivationDialog
        open={showCascadingDialog}
        onOpenChange={setShowCascadingDialog}
        modulesToDeactivate={[module.name]}
        moduleDisplayNames={{ [module.name]: module.displayName }}
        onConfirm={handleCascadingConfirm}
        onCancel={handleCascadingCancel}
      />
    </>
  );
}
