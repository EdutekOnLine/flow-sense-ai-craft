
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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

export function useSmartModuleCache(workspaceId?: string, userId?: string) {
  return useQuery({
    queryKey: ['module-access-smart-cache', workspaceId, userId],
    queryFn: async (): Promise<ModuleAccessInfo[]> => {
      if (!workspaceId || !userId) return [];
      
      const { data, error } = await supabase
        .rpc('get_module_access_info', {
          p_workspace_id: workspaceId,
          p_user_id: userId
        });

      if (error) throw error;
      return data as ModuleAccessInfo[];
    },
    enabled: !!workspaceId && !!userId,
    staleTime: 5 * 60 * 1000, // Increased to 5 minutes for better performance
    gcTime: 10 * 60 * 1000, // Increased to 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Prevent unnecessary refetches
    retry: 1, // Reduced retry attempts for faster failure feedback
  });
}
