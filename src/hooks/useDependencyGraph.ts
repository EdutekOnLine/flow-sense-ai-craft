
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface DependencyNode {
  module_name: string;
  display_name: string;
  level: number;
  is_active: boolean;
  depends_on: string[];
  dependents: string[];
  path: string[];
}

interface ActivationStep {
  activation_order: number;
  module_name: string;
  display_name: string;
  reason: string;
  is_required: boolean;
}

interface DependencyConflict {
  affected_module: string;
  display_name: string;
  conflict_type: string;
  impact_level: number;
  suggested_action: string;
}

export function useDependencyGraph() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get full dependency tree
  const { data: dependencyTree, isLoading: treeLoading } = useQuery({
    queryKey: ['dependency-tree', profile?.workspace_id],
    queryFn: async () => {
      if (!profile?.workspace_id) return [];
      
      const { data, error } = await supabase.rpc('get_module_dependency_tree', {
        p_workspace_id: profile.workspace_id
      });

      if (error) throw error;
      return data as DependencyNode[];
    },
    enabled: !!profile?.workspace_id,
  });

  // Resolve activation order for modules
  const resolveActivationOrder = async (modulesToActivate: string[]): Promise<ActivationStep[]> => {
    if (!profile?.workspace_id) return [];
    
    const { data, error } = await supabase.rpc('resolve_activation_order', {
      p_workspace_id: profile.workspace_id,
      p_modules_to_activate: modulesToActivate
    });

    if (error) {
      console.error('Failed to resolve activation order:', error);
      return [];
    }

    return data as ActivationStep[];
  };

  // Get dependency conflicts for deactivation
  const getDependencyConflicts = async (modulesToDeactivate: string[]): Promise<DependencyConflict[]> => {
    if (!profile?.workspace_id) return [];
    
    const { data, error } = await supabase.rpc('get_dependency_conflicts', {
      p_workspace_id: profile.workspace_id,
      p_modules_to_deactivate: modulesToDeactivate
    });

    if (error) {
      console.error('Failed to get dependency conflicts:', error);
      return [];
    }

    return data as DependencyConflict[];
  };

  // Get dependency path for a specific module
  const getModuleDependencyPath = (moduleName: string): DependencyNode[] => {
    if (!dependencyTree) return [];
    
    return dependencyTree.filter(node => 
      node.module_name === moduleName || node.path.includes(moduleName)
    ).sort((a, b) => a.level - b.level);
  };

  // Get all dependents for a module (modules that depend on it)
  const getModuleDependents = (moduleName: string): string[] => {
    if (!dependencyTree) return [];
    
    const dependents = new Set<string>();
    dependencyTree.forEach(node => {
      if (node.depends_on.includes(moduleName)) {
        dependents.add(node.module_name);
      }
    });
    
    return Array.from(dependents);
  };

  // Check if modules can be safely deactivated
  const canSafelyDeactivate = (moduleNames: string[]): boolean => {
    if (!dependencyTree) return true;
    
    for (const moduleName of moduleNames) {
      const dependents = getModuleDependents(moduleName);
      const activeDependents = dependents.filter(dep => {
        const depNode = dependencyTree.find(node => node.module_name === dep);
        return depNode?.is_active && !moduleNames.includes(dep);
      });
      
      if (activeDependents.length > 0) {
        return false;
      }
    }
    
    return true;
  };

  return {
    dependencyTree,
    treeLoading,
    resolveActivationOrder,
    getDependencyConflicts,
    getModuleDependencyPath,
    getModuleDependents,
    canSafelyDeactivate,
  };
}
