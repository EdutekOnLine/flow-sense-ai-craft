
import React from 'react';
import { Loader2 } from 'lucide-react';

export function ModuleGuardLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Checking module access...</span>
      </div>
    </div>
  );
}
