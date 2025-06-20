
import React from 'react';
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
  Package
} from 'lucide-react';

interface BulkActionsProps {
  selectedModules: string[];
  onBulkToggle: (moduleIds: string[], isActive: boolean) => Promise<void>;
  isLoading: boolean;
}

export function BulkActions({ selectedModules, onBulkToggle, isLoading }: BulkActionsProps) {
  const selectedCount = selectedModules.length;
  
  if (selectedCount === 0) {
    return null;
  }

  const handleBulkEnable = () => {
    const modulesToEnable = selectedModules.filter(id => id !== 'neura-core');
    if (modulesToEnable.length > 0) {
      onBulkToggle(modulesToEnable, true);
    }
  };

  const handleBulkDisable = () => {
    const modulesToDisable = selectedModules.filter(id => id !== 'neura-core');
    if (modulesToDisable.length > 0) {
      onBulkToggle(modulesToDisable, false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="bg-primary/10 text-primary">
        <Package className="h-3 w-3 mr-1" />
        {selectedCount} selected
      </Badge>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isLoading}>
            Bulk Actions
            <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleBulkEnable} disabled={isLoading}>
            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
            Enable Selected
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleBulkDisable} disabled={isLoading}>
            <XCircle className="h-4 w-4 mr-2 text-red-500" />
            Disable Selected
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>
            <Package className="h-4 w-4 mr-2 text-muted-foreground" />
            Export Configuration
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
