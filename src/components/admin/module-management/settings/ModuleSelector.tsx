
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Package } from 'lucide-react';

interface Module {
  name: string;
  displayName: string;
  isActive: boolean;
  isAvailable: boolean;
  isRestricted: boolean;
  statusMessage?: string;
}

interface ModuleSelectorProps {
  modules: Module[];
  selectedModule: string;
  onModuleSelect: (moduleName: string) => void;
}

export function ModuleSelector({ modules, selectedModule, onModuleSelect }: ModuleSelectorProps) {
  const activeModules = modules.filter(m => m.isActive);

  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Modules
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {activeModules.map(module => (
          <Button
            key={module.name}
            variant={selectedModule === module.name ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => onModuleSelect(module.name)}
          >
            <Package className="h-4 w-4 mr-2" />
            {module.displayName}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
