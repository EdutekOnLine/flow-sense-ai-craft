
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { BulkActions } from './BulkActions';

interface ModuleManagementSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedModules: string[];
  moduleDisplayNames: Record<string, string>;
  onBulkToggle: (moduleIds: string[], isActive: boolean) => Promise<void>;
  isLoading: boolean;
}

export function ModuleManagementSearch({
  searchTerm,
  onSearchChange,
  selectedModules,
  moduleDisplayNames,
  onBulkToggle,
  isLoading
}: ModuleManagementSearchProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search modules..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <BulkActions
        selectedModules={selectedModules}
        moduleDisplayNames={moduleDisplayNames}
        onBulkToggle={onBulkToggle}
        isLoading={isLoading}
      />
    </div>
  );
}
