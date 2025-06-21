
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface BulkActionsProps {
  selectedModules: string[];
  onBulkToggle: (moduleIds: string[], isActive: boolean) => Promise<void>;
  isLoading: boolean;
}

export function BulkActions({ selectedModules, onBulkToggle, isLoading }: BulkActionsProps) {
  // Filter out NeuraCore from bulk actions since it cannot be disabled
  const selectableModules = selectedModules.filter(moduleId => moduleId !== 'neura-core');
  const hasSelectableModules = selectableModules.length > 0;

  if (!hasSelectableModules) {
    return null;
  }

  const handleBulkEnable = async () => {
    await onBulkToggle(selectableModules, true);
  };

  const handleBulkDisable = async () => {
    await onBulkToggle(selectableModules, false);
  };

  return (
    <div className="flex items-center gap-3">
      <Badge variant="outline" className="text-sm">
        {selectableModules.length} selected
      </Badge>
      
      <div className="flex gap-2">
        <Button
          onClick={handleBulkEnable}
          disabled={isLoading}
          size="sm"
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <CheckCircle className="h-3 w-3" />
          )}
          Enable Selected
        </Button>
        
        <Button
          onClick={handleBulkDisable}
          disabled={isLoading}
          size="sm"
          variant="outline"
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <XCircle className="h-3 w-3" />
          )}
          Disable Selected
        </Button>
      </div>
    </div>
  );
}
