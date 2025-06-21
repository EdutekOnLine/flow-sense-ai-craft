
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

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

export function useWorkspaceManagement(targetWorkspaceId?: string | null) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Use target workspace if provided (for root users), otherwise use user's workspace
  const effectiveWorkspaceId = targetWorkspaceId || profile?.workspace_id;

  // Get all available modules
  const { data: allModules, isLoading: modulesLoading } = useQuery({
    queryKey: ['modules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .order('display_name');

      if (error) throw error;
      return data;
    },
  });

  // Get module access information for the target workspace
  const { data: moduleAccessInfo, isLoading: moduleAccessLoading } = useQuery({
    queryKey: ['module-access-info', effectiveWorkspaceId, profile?.id],
    queryFn: async () => {
      if (!effectiveWorkspaceId || !profile?.id) return [];
      
      const { data, error } = await supabase
        .rpc('get_module_access_info', {
          p_workspace_id: effectiveWorkspaceId,
          p_user_id: profile.id
        });

      if (error) throw error;
      return data as ModuleAccessInfo[];
    },
    enabled: !!effectiveWorkspaceId && !!profile?.id,
  });

  // Get workspace information
  const { data: workspace, isLoading: workspaceLoading } = useQuery({
    queryKey: ['workspace', effectiveWorkspaceId],
    queryFn: async () => {
      if (!effectiveWorkspaceId) return null;
      
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .eq('id', effectiveWorkspaceId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!effectiveWorkspaceId,
  });

  // Enhanced toggle module for any workspace (root users only)
  const toggleModule = useMutation({
    mutationFn: async ({ moduleId, isActive, workspaceId }: { 
      moduleId: string; 
      isActive: boolean; 
      workspaceId?: string;
    }) => {
      const targetWorkspace = workspaceId || effectiveWorkspaceId;
      
      if (!targetWorkspace) throw new Error('No workspace specified');
      
      // Only root users can manage modules for other workspaces
      if (workspaceId && workspaceId !== profile?.workspace_id && profile?.role !== 'root') {
        throw new Error('Insufficient permissions to manage modules for other workspaces');
      }

      // If activating a module, check dependencies first
      if (isActive && moduleAccessInfo) {
        const moduleInfo = moduleAccessInfo.find(m => m.module_name === moduleId);
        if (moduleInfo && !moduleInfo.has_dependencies && moduleInfo.missing_dependencies.length > 0) {
          throw new Error(`Missing required modules: ${moduleInfo.missing_dependencies.join(', ')}`);
        }
      }

      // Get the module ID from the name
      const module = allModules?.find(m => m.name === moduleId);
      if (!module) throw new Error('Module not found');

      const { data, error } = await supabase
        .from('workspace_modules')
        .upsert({
          workspace_id: targetWorkspace,
          module_id: module.id,
          is_active: isActive,
          activated_by: profile!.id,
          activated_at: isActive ? new Date().toISOString() : null,
        }, {
          onConflict: 'workspace_id,module_id'
        })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      const targetWorkspace = variables.workspaceId || effectiveWorkspaceId;
      
      // Invalidate queries for the target workspace
      queryClient.invalidateQueries({ queryKey: ['workspace-modules', targetWorkspace] });
      queryClient.invalidateQueries({ queryKey: ['module-access-info', targetWorkspace] });
      queryClient.invalidateQueries({ queryKey: ['workspaces-for-module-management'] });
      
      const action = variables.isActive ? 'enabled' : 'disabled';
      const moduleName = allModules?.find(m => m.name === variables.moduleId)?.display_name || variables.moduleId;
      const workspaceName = workspace?.name || 'workspace';
      
      toast({
        title: 'Module Updated',
        description: `${moduleName} has been ${action} for ${workspaceName}.`,
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

  // Check if user can manage modules for the target workspace
  const canManageTargetWorkspace = () => {
    if (!profile) return false;
    
    // Root users can manage any workspace
    if (profile.role === 'root') return true;
    
    // Regular users can only manage their own workspace
    return !targetWorkspaceId || targetWorkspaceId === profile.workspace_id;
  };

  // Enhanced module access check
  const isModuleActive = (moduleName: string) => {
    if (moduleAccessInfo) {
      const moduleInfo = moduleAccessInfo.find(m => m.module_name === moduleName);
      return moduleInfo?.is_active || false;
    }
    return false;
  };

  // Get modules with their status information
  const getModulesWithStatus = () => {
    if (moduleAccessInfo && moduleAccessInfo.length > 0) {
      return moduleAccessInfo.map(accessInfo => ({
        name: accessInfo.module_name,
        displayName: accessInfo.display_name,
        isActive: accessInfo.is_active,
        isAvailable: accessInfo.is_available,
        isRestricted: !accessInfo.is_active,
        statusMessage: accessInfo.is_active ? 'Active' : 
          accessInfo.missing_dependencies.length > 0 ? 
          `Missing: ${accessInfo.missing_dependencies.join(', ')}` :
          'Inactive',
        hasDependencies: accessInfo.has_dependencies,
        missingDependencies: accessInfo.missing_dependencies,
        version: accessInfo.version,
        settings: accessInfo.settings
      }));
    }

    // Fallback to basic module list
    const modules = ['neura-core', 'neura-flow', 'neura-crm', 'neura-forms', 'neura-edu'];
    return modules.map(moduleName => ({
      name: moduleName,
      displayName: getModuleDisplayName(moduleName),
      isActive: false,
      isAvailable: true,
      isRestricted: true,
      statusMessage: 'Inactive',
      hasDependencies: false,
      missingDependencies: [],
      version: '1.0.0',
      settings: {}
    }));
  };

  const getModuleDisplayName = (moduleName: string) => {
    const displayNames: Record<string, string> = {
      'neura-core': 'NeuraCore',
      'neura-flow': 'NeuraFlow',
      'neura-crm': 'NeuraCRM',
      'neura-forms': 'NeuraForms',
      'neura-edu': 'NeuraEdu'
    };
    return displayNames[moduleName] || moduleName;
  };

  return {
    workspace,
    workspaceLoading,
    allModules,
    modulesLoading,
    moduleAccessInfo,
    moduleAccessLoading,
    toggleModule,
    isModuleActive,
    getModulesWithStatus,
    canManageTargetWorkspace,
    effectiveWorkspaceId,
    isManagingOtherWorkspace: !!targetWorkspaceId && targetWorkspaceId !== profile?.workspace_id,
  };
}
