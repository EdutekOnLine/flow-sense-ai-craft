
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  GitBranch, 
  CheckCircle, 
  XCircle, 
  ArrowRight,
  Package,
  Loader2
} from 'lucide-react';
import { useDependencyGraph } from '@/hooks/useDependencyGraph';

interface DependencyGraphVisualizerProps {
  selectedModule?: string;
  onModuleSelect?: (moduleName: string) => void;
}

export function DependencyGraphVisualizer({ 
  selectedModule, 
  onModuleSelect 
}: DependencyGraphVisualizerProps) {
  const { dependencyTree, treeLoading } = useDependencyGraph();

  const hierarchicalData = useMemo(() => {
    if (!dependencyTree) return {};
    
    const byLevel: Record<number, typeof dependencyTree> = {};
    dependencyTree.forEach(node => {
      if (!byLevel[node.level]) {
        byLevel[node.level] = [];
      }
      byLevel[node.level].push(node);
    });
    
    return byLevel;
  }, [dependencyTree]);

  const getStatusIcon = (isActive: boolean, moduleName: string) => {
    if (moduleName === 'neura-core') {
      return <Package className="h-3 w-3 text-blue-500" />;
    }
    return isActive ? 
      <CheckCircle className="h-3 w-3 text-green-500" /> : 
      <XCircle className="h-3 w-3 text-red-500" />;
  };

  const getModuleCard = (node: typeof dependencyTree[0], isSelected: boolean) => (
    <div
      key={node.module_name}
      className={`
        relative p-3 rounded-lg border cursor-pointer transition-all duration-200
        ${isSelected ? 'ring-2 ring-primary border-primary' : 'border-border hover:border-primary/50'}
        ${node.is_active ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}
      `}
      onClick={() => onModuleSelect?.(node.module_name)}
    >
      <div className="flex items-center gap-2 mb-2">
        {getStatusIcon(node.is_active, node.module_name)}
        <span className="text-sm font-medium">{node.display_name}</span>
      </div>
      
      <div className="flex items-center gap-1 mb-2">
        <Badge variant={node.is_active ? "default" : "secondary"} className="text-xs">
          {node.is_active ? 'Active' : 'Inactive'}
        </Badge>
        {node.level > 0 && (
          <Badge variant="outline" className="text-xs">
            L{node.level}
          </Badge>
        )}
      </div>

      {node.depends_on.length > 0 && (
        <div className="text-xs text-muted-foreground">
          Depends on: {node.depends_on.length} module{node.depends_on.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );

  if (treeLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Dependency Graph
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const levels = Object.keys(hierarchicalData).map(Number).sort((a, b) => a - b);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Module Dependency Graph
          </CardTitle>
          <Button variant="outline" size="sm">
            <Package className="h-4 w-4 mr-2" />
            Export Graph
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {levels.map((level, levelIndex) => (
            <div key={level} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-px bg-border flex-1" />
                <Badge variant="outline" className="text-xs">
                  {level === 0 ? 'Root Modules' : `Dependency Level ${level}`}
                </Badge>
                <div className="h-px bg-border flex-1" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {hierarchicalData[level].map(node => 
                  getModuleCard(node, selectedModule === node.module_name)
                )}
              </div>
              
              {levelIndex < levels.length - 1 && (
                <div className="flex justify-center">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
          
          {levels.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No modules found in your workspace.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
