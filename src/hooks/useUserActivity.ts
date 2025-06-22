
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface UserActivityLog {
  id: string;
  module_name: string;
  action: string;
  created_at: string;
  reason?: string;
}

interface UserWorkspaceInfo {
  id: string;
  name: string;
  created_at: string;
}

interface UserPresenceInfo {
  is_online: boolean;
  last_seen: string;
}

export function useUserActivity() {
  const { profile } = useAuth();

  // Fetch user's recent activity from module audit logs
  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['user-activity', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      const { data, error } = await supabase
        .from('module_audit_logs')
        .select('id, module_name, action, created_at, reason')
        .eq('performed_by', profile.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as UserActivityLog[];
    },
    enabled: !!profile?.id,
  });

  // Fetch workspace information
  const { data: workspaceInfo, isLoading: workspaceLoading } = useQuery({
    queryKey: ['user-workspace', profile?.workspace_id],
    queryFn: async () => {
      if (!profile?.workspace_id) return null;
      
      const { data, error } = await supabase
        .from('workspaces')
        .select('id, name, created_at')
        .eq('id', profile.workspace_id)
        .single();

      if (error) throw error;
      return data as UserWorkspaceInfo;
    },
    enabled: !!profile?.workspace_id,
  });

  // Fetch user presence status
  const { data: presenceInfo, isLoading: presenceLoading } = useQuery({
    queryKey: ['user-presence', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;
      
      const { data, error } = await supabase
        .from('user_presence')
        .select('is_online, last_seen')
        .eq('user_id', profile.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as UserPresenceInfo | null;
    },
    enabled: !!profile?.id,
  });

  return {
    recentActivity: recentActivity || [],
    workspaceInfo,
    presenceInfo,
    isLoading: activityLoading || workspaceLoading || presenceLoading,
  };
}
