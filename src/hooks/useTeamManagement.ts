
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/components/ui/use-toast';

export interface Team {
  id: string;
  name: string;
  description?: string;
  workspace_id: string;
  manager_id: string;
  created_at: string;
  updated_at: string;
  manager?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  member_count?: number;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role_in_team: string;
  created_at: string;
  user?: {
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    department?: string;
  };
}

export function useTeamManagement() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  // Fetch teams for current workspace
  const { data: teams = [], isLoading: teamsLoading } = useQuery({
    queryKey: ['teams', profile?.workspace_id],
    queryFn: async () => {
      if (!profile?.workspace_id) return [];
      
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          manager:manager_id (
            first_name,
            last_name,
            email
          )
        `)
        .eq('workspace_id', profile.workspace_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Get member counts for each team
      const teamIds = data?.map(team => team.id) || [];
      if (teamIds.length > 0) {
        const { data: memberCounts } = await supabase
          .from('team_members')
          .select('team_id')
          .in('team_id', teamIds);
        
        const countsByTeam = memberCounts?.reduce((acc, member) => {
          acc[member.team_id] = (acc[member.team_id] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {};
        
        return (data || []).map(team => ({
          ...team,
          member_count: countsByTeam[team.id] || 0,
        })) as Team[];
      }
      
      return (data || []).map(team => ({
        ...team,
        member_count: 0,
      })) as Team[];
    },
    enabled: !!profile?.workspace_id,
  });

  // Fetch team members
  const { data: teamMembers = [] } = useQuery({
    queryKey: ['team-members', profile?.workspace_id],
    queryFn: async () => {
      if (!profile?.workspace_id) return [];
      
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          *,
          user:user_id (
            first_name,
            last_name,
            email,
            role,
            department
          ),
          teams!inner (
            workspace_id
          )
        `)
        .eq('teams.workspace_id', profile.workspace_id);

      if (error) throw error;
      return (data || []) as TeamMember[];
    },
    enabled: !!profile?.workspace_id,
  });

  // Function to get workspace-specific managers
  const getWorkspaceManagers = (workspaceId: string) => {
    const { data: managers = [] } = useQuery({
      queryKey: ['workspace-managers', workspaceId],
      queryFn: async () => {
        if (!workspaceId) return [];
        
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email')
          .eq('workspace_id', workspaceId)
          .eq('role', 'manager')
          .order('first_name');

        if (error) throw error;
        return data || [];
      },
      enabled: !!workspaceId,
    });
    
    return managers;
  };

  // Fetch available managers (users with manager role) for current workspace
  const { data: availableManagers = [] } = useQuery({
    queryKey: ['available-managers', profile?.workspace_id],
    queryFn: async () => {
      if (!profile?.workspace_id) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .eq('workspace_id', profile.workspace_id)
        .eq('role', 'manager')
        .order('first_name');

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.workspace_id,
  });

  // Fetch all workspace users for team assignment
  const { data: workspaceUsers = [] } = useQuery({
    queryKey: ['workspace-users', profile?.workspace_id],
    queryFn: async () => {
      if (!profile?.workspace_id) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, role, department')
        .eq('workspace_id', profile.workspace_id)
        .order('first_name');

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.workspace_id,
  });

  // Create team mutation
  const createTeamMutation = useMutation({
    mutationFn: async (teamData: { 
      name: string; 
      description?: string; 
      manager_id: string; 
      workspace_id: string; 
    }) => {
      const { data, error } = await supabase
        .from('teams')
        .insert({
          name: teamData.name,
          description: teamData.description,
          manager_id: teamData.manager_id,
          workspace_id: teamData.workspace_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast({ title: 'Team created successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error creating team', description: error.message, variant: 'destructive' });
    },
  });

  // Update team mutation
  const updateTeamMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Team> & { id: string }) => {
      const { data, error } = await supabase
        .from('teams')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast({ title: 'Team updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error updating team', description: error.message, variant: 'destructive' });
    },
  });

  // Delete team mutation
  const deleteTeamMutation = useMutation({
    mutationFn: async (teamId: string) => {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast({ title: 'Team deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error deleting team', description: error.message, variant: 'destructive' });
    },
  });

  // Add team member mutation
  const addTeamMemberMutation = useMutation({
    mutationFn: async ({ team_id, user_id, role_in_team = 'member' }: { team_id: string; user_id: string; role_in_team?: string }) => {
      const { data, error } = await supabase
        .from('team_members')
        .insert({
          team_id,
          user_id,
          role_in_team,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast({ title: 'Team member added successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error adding team member', description: error.message, variant: 'destructive' });
    },
  });

  // Remove team member mutation
  const removeTeamMemberMutation = useMutation({
    mutationFn: async ({ team_id, user_id }: { team_id: string; user_id: string }) => {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', team_id)
        .eq('user_id', user_id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast({ title: 'Team member removed successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error removing team member', description: error.message, variant: 'destructive' });
    },
  });

  // Get teams managed by current user
  const managedTeams = teams.filter(team => team.manager_id === profile?.id);

  // Get team members for a specific team
  const getTeamMembers = (teamId: string) => {
    return teamMembers.filter(member => member.team_id === teamId);
  };

  // Check if user can manage a specific team
  const canManageTeam = (teamId: string) => {
    if (profile?.role === 'admin' || profile?.role === 'root') return true;
    return teams.some(team => team.id === teamId && team.manager_id === profile?.id);
  };

  return {
    teams,
    teamMembers,
    availableManagers,
    workspaceUsers,
    managedTeams,
    isLoading: teamsLoading,
    createTeam: createTeamMutation.mutate,
    updateTeam: updateTeamMutation.mutate,
    deleteTeam: deleteTeamMutation.mutate,
    addTeamMember: addTeamMemberMutation.mutate,
    removeTeamMember: removeTeamMemberMutation.mutate,
    getTeamMembers,
    canManageTeam,
    getWorkspaceManagers,
    isCreating: createTeamMutation.isPending,
    isUpdating: updateTeamMutation.isPending,
    isDeleting: deleteTeamMutation.isPending,
  };
}
