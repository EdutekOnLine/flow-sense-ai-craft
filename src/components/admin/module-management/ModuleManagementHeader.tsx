
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Package, CheckCircle, Shield } from 'lucide-react';

interface ModuleManagementHeaderProps {
  activeModulesCount: number;
  totalModulesCount: number;
}

export function ModuleManagementHeader({ 
  activeModulesCount, 
  totalModulesCount 
}: ModuleManagementHeaderProps) {
  return (
    <div className="relative bg-gradient-theme-primary border border-border rounded-xl p-8">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Module Management</h1>
              <p className="text-muted-foreground">Manage and configure workspace modules</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              <CheckCircle className="h-3 w-3 mr-1" />
              {activeModulesCount} Active
            </Badge>
            <Badge variant="outline" className="bg-muted/10 text-muted-foreground border-muted/20">
              <Package className="h-3 w-3 mr-1" />
              {totalModulesCount} Total
            </Badge>
          </div>
        </div>
        <Badge variant="secondary" className="bg-secondary/10 text-secondary">
          <Shield className="h-3 w-3 mr-1" />
          Root Access
        </Badge>
      </div>
    </div>
  );
}
