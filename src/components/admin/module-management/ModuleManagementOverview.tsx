
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Package } from 'lucide-react';
import { ModuleCard } from './ModuleCard';

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

interface ModuleManagementOverviewProps {
  modules: Module[];
  selectedModules: string[];
  onModuleSelect: (moduleId: string, selected: boolean) => void;
  onModuleToggle: (moduleId: string, isActive: boolean) => Promise<void>;
  isLoading: boolean;
  searchTerm: string;
}

export function ModuleManagementOverview({
  modules,
  selectedModules,
  onModuleSelect,
  onModuleToggle,
  isLoading,
  searchTerm
}: ModuleManagementOverviewProps) {
  if (modules.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No modules found</h3>
          <p className="text-muted-foreground text-center">
            {searchTerm ? 'Try adjusting your search criteria.' : 'No modules are available.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {modules.map(module => (
        <ModuleCard
          key={module.name}
          module={module}
          isSelected={selectedModules.includes(module.name)}
          onSelect={(selected) => onModuleSelect(module.name, selected)}
          onToggle={onModuleToggle}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}
