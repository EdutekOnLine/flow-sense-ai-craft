
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  owner_id: string;
  settings: any;
  created_at: string;
  updated_at: string;
}

interface Module {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  version: string;
  is_core: boolean;
  settings_schema: any;
  required_modules?: string[];
}

interface WorkspaceModule {
  id: string;
  workspace_id: string;
  module_id: string;
  is_active: boolean;
  settings: any;
  version?: string;
  activated_at?: string;
  activated_by?: string;
  module: Module;
}

interface ModuleAccessInfo {
  module_name: string;
  display_name: string;
  is_active: boolean;
  is_available: boolean;
  has_dependencies: boolean;
  missing_dependencies: string[];
  version: string;
  settings: any;
}

export function useWorkspace() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current workspace
  const { data: workspace, isLoading: workspaceLoading } = useQuery({
    queryKey: ['workspace', profile?.workspace_id],
    queryFn: async () => {
      if (!profile?.workspace_id) return null;
      
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .eq('id', profile.workspace_id)
        .single();

      if (error) throw error;
      return data as Workspace;
    },
    enabled: !!profile?.workspace_id,
  });

  // Get all available modules
  const { data: allModules, isLoading: modulesLoading } = useQuery({
    queryKey: ['modules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .order('display_name');

      if (error) throw error;
      return data as Module[];
    },
  });

  // Get active modules for current workspace
  const { data: workspaceModules, isLoading: workspaceModulesLoading } = useQuery({
    queryKey: ['workspace-modules', profile?.workspace_id],
    queryFn: async () => {
      if (!profile?.workspace_id) return [];
      
      const { data, error } = await supabase
        .from('workspace_modules')
        .select(`
          *,
          module:modules(*)
        `)
        .eq('workspace_id', profile.workspace_id)
        .eq('is_active', true);

      if (error) throw error;
      return data as WorkspaceModule[];
    },
    enabled: !!profile?.workspace_id,
  });

  // Get comprehensive module access information using the new database function
  const { data: moduleAccessInfo, isLoading: moduleAccessLoading } = useQuery({
    queryKey: ['module-access-info', profile?.workspace_id, profile?.id],
    queryFn: async () => {
      if (!profile?.workspace_id || !profile?.id) return [];
      
      const { data, error } = await supabase
        .rpc('get_module_access_info', {
          p_workspace_id: profile.workspace_id,
          p_user_id: profile.id
        });

      if (error) throw error;
      return data as ModuleAccessInfo[];
    },
    enabled: !!profile?.workspace_id && !!profile?.id,
  });

  // Toggle module activation with dependency checking
  const toggleModule = useMutation({
    mutationFn: async ({ moduleId, isActive }: { moduleId: string; isActive: boolean }) => {
      if (!profile?.workspace_id) throw new Error('No workspace found');

      // If activating a module, check dependencies first
      if (isActive && moduleAccessInfo) {
        const moduleInfo = moduleAccessInfo.find(m => m.module_name === moduleId);
        if (moduleInfo && !moduleInfo.has_dependencies && moduleInfo.missing_dependencies.length > 0) {
          throw new Error(`Missing required modules: ${moduleInfo.missing_dependencies.join(', ')}`);
        }
      }

      const { data, error } = await supabase
        .from('workspace_modules')
        .upsert({
          workspace_id: profile.workspace_id,
          module_id: moduleId,
          is_active: isActive,
          activated_by: profile.id,
        }, {
          onConflict: 'workspace_id,module_id'
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-modules'] });
      queryClient.invalidateQueries({ queryKey: ['module-access-info'] });
      toast({
        title: 'Module Updated',
        description: 'Module status has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update module status.',
        variant: 'destructive',
      });
      console.error('Module toggle error:', error);
    },
  });

  // Update module settings
  const updateModuleSettings = useMutation({
    mutationFn: async ({ moduleId, settings }: { moduleId: string; settings: any }) => {
      if (!profile?.workspace_id) throw new Error('No workspace found');

      const { data, error } = await supabase
        .from('workspace_modules')
        .upsert({
          workspace_id: profile.workspace_id,
          module_id: moduleId,
          settings: settings,
        }, {
          onConflict: 'workspace_id,module_id'
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-modules'] });
      queryClient.invalidateQueries({ queryKey: ['module-access-info'] });
      toast({
        title: 'Settings Updated',
        description: 'Module settings have been saved successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update module settings.',
        variant: 'destructive',
      });
      console.error('Module settings update error:', error);
    },
  });

  // Check if a specific module is active
  const isModuleActive = (moduleName: string) => {
    return workspaceModules?.some(wm => wm.module.name === moduleName && wm.is_active) || false;
  };

  // Get active module names
  const activeModules = workspaceModules?.map(wm => wm.module.name) || [];

  // Check if module dependencies are satisfied
  const checkModuleDependencies = async (moduleName: string): Promise<boolean> => {
    if (!profile?.workspace_id) return false;
    
    const { data, error } = await supabase
      .rpc('check_module_dependencies', {
        p_workspace_id: profile.workspace_id,
        p_module_name: moduleName
      });

    if (error) {
      console.error('Error checking module dependencies:', error);
      return false;
    }

    return data;
  };

  return {
    workspace,
    workspaceLoading,
    allModules,
    modulesLoading,
    workspaceModules,
    workspaceModulesLoading,
    moduleAccessInfo,
    moduleAccessLoading,
    toggleModule,
    updateModuleSettings,
    isModuleActive,
    activeModules,
    checkModuleDependencies,
    isWorkspaceOwner: workspace?.owner_id === profile?.id,
  };
}
