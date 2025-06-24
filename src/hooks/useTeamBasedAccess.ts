
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface TeamAccessInfo {
  isTeamManager: boolean;
  managedTeamIds: string[];
  teamMemberIds: string[];
  canAccessUser: (userId: string) => boolean;
  canManageUser: (userId: string) => boolean;
}

export function useTeamBasedAccess(): TeamAccessInfo {
  const { profile } = useAuth();

  const { data: teamAccess } = useQuery({
    queryKey: ['team-access', profile?.id, profile?.workspace_id],
    queryFn: async (): Promise<TeamAccessInfo> => {
      if (!profile?.workspace_id || !profile?.id) {
        return {
          isTeamManager: false,
          managedTeamIds: [],
          teamMemberIds: [],
          canAccessUser: () => false,
          canManageUser: () => false,
        };
      }

      const isAdmin = profile.role === 'admin' || profile.role === 'root';
      
      // If admin, they can access everyone
      if (isAdmin) {
        // Get all users in workspace for admin access
        const { data: allUsers } = await supabase
          .from('profiles')
          .select('id')
          .eq('workspace_id', profile.workspace_id);
        
        const allUserIds = allUsers?.map(u => u.id) || [];
        
        return {
          isTeamManager: true, // Admins are considered team managers
          managedTeamIds: [], // Not relevant for admins
          teamMemberIds: allUserIds,
          canAccessUser: () => true,
          canManageUser: () => true,
        };
      }

      // Get teams managed by current user
      const { data: managedTeams } = await supabase
        .from('teams')
        .select('id')
        .eq('manager_id', profile.id)
        .eq('workspace_id', profile.workspace_id);

      const managedTeamIds = managedTeams?.map(team => team.id) || [];
      const isTeamManager = managedTeamIds.length > 0;

      // Get all team members for managed teams
      let teamMemberIds: string[] = [profile.id]; // Always include self
      
      if (managedTeamIds.length > 0) {
        const { data: teamMembers } = await supabase
          .from('team_members')
          .select('user_id')
          .in('team_id', managedTeamIds);
        
        const memberIds = teamMembers?.map(member => member.user_id) || [];
        teamMemberIds = [...new Set([...teamMemberIds, ...memberIds])];
      }

      return {
        isTeamManager,
        managedTeamIds,
        teamMemberIds,
        canAccessUser: (userId: string) => {
          // Can access self or team members if manager
          return userId === profile.id || (isTeamManager && teamMemberIds.includes(userId));
        },
        canManageUser: (userId: string) => {
          // Can manage team members if manager (but not self for some operations)
          return isTeamManager && teamMemberIds.includes(userId);
        },
      };
    },
    enabled: !!profile?.workspace_id && !!profile?.id,
  });

  return teamAccess || {
    isTeamManager: false,
    managedTeamIds: [],
    teamMemberIds: [],
    canAccessUser: () => false,
    canManageUser: () => false,
  };
}
