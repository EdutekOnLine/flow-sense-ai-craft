
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Settings, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Info,
  Package
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Module {
  name: string;
  displayName: string;
  isActive: boolean;
  isAvailable: boolean;
  isRestricted: boolean;
  statusMessage?: string;
}

interface ModuleCardProps {
  module: Module;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  onToggle: (moduleId: string, isActive: boolean) => Promise<void>;
  isLoading: boolean;
}

export function ModuleCard({ module, isSelected, onSelect, onToggle, isLoading }: ModuleCardProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingAction, setPendingAction] = useState<boolean | null>(null);

  const handleToggleClick = (newState: boolean) => {
    if (module.name === 'neura-core') {
      return; // Core module cannot be toggled
    }
    
    setPendingAction(newState);
    setShowConfirmation(true);
  };

  const confirmToggle = async () => {
    if (pendingAction !== null) {
      await onToggle(module.name, pendingAction);
      setPendingAction(null);
    }
    setShowConfirmation(false);
  };

  const getStatusIcon = () => {
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
      <Card className={`transition-all duration-200 hover:shadow-md ${isSelected ? 'ring-2 ring-primary' : ''}`}>
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
          
          {module.statusMessage && (
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{module.statusMessage}</span>
            </div>
          )}
          
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-xs text-muted-foreground">Module ID: {module.name}</span>
            <Button variant="ghost" size="sm" className="h-8">
              <Settings className="h-3 w-3 mr-1" />
              Configure
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction ? 'Enable' : 'Disable'} {module.displayName}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction 
                ? `Are you sure you want to enable ${module.displayName}? This will make its features available to users with appropriate permissions.`
                : `Are you sure you want to disable ${module.displayName}? This will immediately restrict access to its features for all users.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingAction(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmToggle}>
              {pendingAction ? 'Enable' : 'Disable'} Module
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
