
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
  const { profile, isRootUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current workspace - root users don't have a workspace
  const { data: workspace, isLoading: workspaceLoading } = useQuery({
    queryKey: ['workspace', profile?.workspace_id],
    queryFn: async () => {
      if (!profile?.workspace_id || isRootUser()) return null;
      
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .eq('id', profile.workspace_id)
        .single();

      if (error) throw error;
      return data as Workspace;
    },
    enabled: !!profile && !isRootUser(),
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
    enabled: !!profile,
  });

  // Get active modules for current workspace - root users get all modules
  const { data: workspaceModules, isLoading: workspaceModulesLoading } = useQuery({
    queryKey: ['workspace-modules', profile?.workspace_id],
    queryFn: async () => {
      if (isRootUser()) {
        // Root users get all modules as active
        if (!allModules) return [];
        return allModules.map(module => ({
          id: `root-${module.id}`,
          workspace_id: 'root',
          module_id: module.id,
          is_active: true,
          settings: {},
          module: module,
        })) as WorkspaceModule[];
      }

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
    enabled: !!profile && (!!profile.workspace_id || isRootUser()) && !!allModules,
  });

  // Get comprehensive module access information - root users get all modules
  const { data: moduleAccessInfo, isLoading: moduleAccessLoading } = useQuery({
    queryKey: ['module-access-info', profile?.workspace_id, profile?.id],
    queryFn: async () => {
      if (isRootUser()) {
        // Root users get all modules as active
        if (!allModules) return [];
        return allModules.map(module => ({
          module_name: module.name,
          display_name: module.display_name,
          is_active: true,
          is_available: true,
          has_dependencies: true,
          missing_dependencies: [],
          version: module.version,
          settings: {},
        })) as ModuleAccessInfo[];
      }

      if (!profile?.workspace_id || !profile?.id) return [];
      
      const { data, error } = await supabase
        .rpc('get_module_access_info', {
          p_workspace_id: profile.workspace_id,
          p_user_id: profile.id
        });

      if (error) throw error;
      return data as ModuleAccessInfo[];
    },
    enabled: !!profile && (!!profile.workspace_id || isRootUser()) && !!allModules,
  });

  // Get dependent modules for a specific module
  const getDependentModules = async (moduleName: string) => {
    if (isRootUser()) {
      // Root users can see all module dependencies
      return allModules?.filter(m => m.required_modules?.includes(moduleName)) || [];
    }

    if (!profile?.workspace_id) return [];
    
    const { data, error } = await supabase
      .rpc('get_dependent_modules', {
        p_workspace_id: profile.workspace_id,
        p_module_name: moduleName
      });

    if (error) {
      console.error('Error fetching dependent modules:', error);
      return [];
    }

    return data || [];
  };

  // Enhanced toggle module with dependency and audit logging
  const toggleModule = useMutation({
    mutationFn: async ({ moduleId, isActive }: { moduleId: string; isActive: boolean }) => {
      if (isRootUser()) {
        // Root users can't toggle modules - they have access to all
        throw new Error('Root users have access to all modules by default');
      }

      if (!profile?.workspace_id) throw new Error('No workspace found');

      // If activating a module, check dependencies first
      if (isActive && moduleAccessInfo) {
        const moduleInfo = moduleAccessInfo.find(m => m.module_name === moduleId);
        if (moduleInfo && !moduleInfo.has_dependencies && moduleInfo.missing_dependencies.length > 0) {
          throw new Error(`Missing required modules: ${moduleInfo.missing_dependencies.join(', ')}`);
        }
      }

      // If deactivating, check for dependent modules
      if (!isActive) {
        const dependentModules = await getDependentModules(moduleId);
        const activeDependents = dependentModules.filter(dep => dep.is_active);
        
        if (activeDependents.length > 0) {
          const dependentNames = activeDependents.map(dep => dep.display_name).join(', ');
          console.warn(`Warning: Deactivating ${moduleId} while dependent modules are active: ${dependentNames}`);
        }
      }

      // Get the module ID from the name
      const module = allModules?.find(m => m.name === moduleId);
      if (!module) throw new Error('Module not found');

      const { data, error } = await supabase
        .from('workspace_modules')
        .upsert({
          workspace_id: profile.workspace_id,
          module_id: module.id,
          is_active: isActive,
          activated_by: profile.id,
          activated_at: isActive ? new Date().toISOString() : null,
        }, {
          onConflict: 'workspace_id,module_id'
        })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workspace-modules'] });
      queryClient.invalidateQueries({ queryKey: ['module-access-info'] });
      
      const action = variables.isActive ? 'enabled' : 'disabled';
      const moduleName = allModules?.find(m => m.name === variables.moduleId)?.display_name || variables.moduleId;
      
      toast({
        title: 'Module Updated',
        description: `${moduleName} has been ${action} successfully.`,
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
      if (isRootUser()) {
        // Root users can update global module settings
        const { data, error } = await supabase
          .from('modules')
          .update({ settings_schema: settings })
          .eq('name', moduleId);

        if (error) throw error;
        return data;
      }

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

  // Enhanced module access check with root user support
  const isModuleActive = (moduleName: string) => {
    if (isRootUser()) {
      // Root users have access to all modules
      return true;
    }

    if (moduleAccessInfo) {
      const moduleInfo = moduleAccessInfo.find(m => m.module_name === moduleName);
      return moduleInfo?.is_active || false;
    }
    return workspaceModules?.some(wm => wm.module.name === moduleName && wm.is_active) || false;
  };

  // Get active module names
  const activeModules = isRootUser() 
    ? allModules?.map(m => m.name) || []
    : moduleAccessInfo 
      ? moduleAccessInfo.filter(m => m.is_active).map(m => m.module_name)
      : workspaceModules?.map(wm => wm.module.name) || [];

  // Check if module dependencies are satisfied
  const checkModuleDependencies = async (moduleName: string): Promise<boolean> => {
    if (isRootUser()) {
      // Root users bypass dependency checks
      return true;
    }

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
    getDependentModules,
    isWorkspaceOwner: workspace?.owner_id === profile?.id,
  };
}
