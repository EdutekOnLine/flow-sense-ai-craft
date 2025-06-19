
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  CheckCircle, 
  XCircle, 
  ChevronDown,
  Package,
  Wand2
} from 'lucide-react';
import { BulkOperationWizard } from './BulkOperationWizard';

interface BulkActionsProps {
  selectedModules: string[];
  moduleDisplayNames: Record<string, string>;
  onBulkToggle: (moduleIds: string[], isActive: boolean) => Promise<void>;
  isLoading: boolean;
}

export function BulkActions({ 
  selectedModules, 
  moduleDisplayNames,
  onBulkToggle, 
  isLoading 
}: BulkActionsProps) {
  const [showWizard, setShowWizard] = useState(false);
  const [wizardOperation, setWizardOperation] = useState<'activate' | 'deactivate'>('activate');
  
  const selectedCount = selectedModules.length;
  
  if (selectedCount === 0) {
    return null;
  }

  const handleBulkAction = (operation: 'activate' | 'deactivate') => {
    const modulesToProcess = selectedModules.filter(id => id !== 'neura-core');
    if (modulesToProcess.length > 0) {
      setWizardOperation(operation);
      setShowWizard(true);
    }
  };

  const executeOperation = async (modules: string[], operation: 'activate' | 'deactivate') => {
    await onBulkToggle(modules, operation === 'activate');
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="bg-primary/10 text-primary">
          <Package className="h-3 w-3 mr-1" />
          {selectedCount} selected
        </Badge>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={isLoading}>
              <Wand2 className="h-4 w-4 mr-1" />
              Smart Actions
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => handleBulkAction('activate')} disabled={isLoading}>
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              Smart Activation
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleBulkAction('deactivate')} disabled={isLoading}>
              <XCircle className="h-4 w-4 mr-2 text-red-500" />
              Smart Deactivation
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <Package className="h-4 w-4 mr-2 text-muted-foreground" />
              Export Configuration
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <BulkOperationWizard
        open={showWizard}
        onOpenChange={setShowWizard}
        selectedModules={selectedModules.filter(id => id !== 'neura-core')}
        operation={wizardOperation}
        moduleDisplayNames={moduleDisplayNames}
        onExecute={executeOperation}
      />
    </>
  );
}
