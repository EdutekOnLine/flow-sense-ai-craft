
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useEnhancedWorkflowPermissions } from '@/hooks/useEnhancedWorkflowPermissions';
import { useToast } from '@/hooks/use-toast';

interface TeamAwareWorkflowFilters {
  includeTeamMembers?: boolean;
  includeOwnWorkflows?: boolean;
  includeAssignedWorkflows?: boolean;
  includeReusableWorkflows?: boolean;
}

export function useTeamAwareWorkflows() {
  const { user, profile } = useAuth();
  const { dashboardScope, userRole } = useEnhancedWorkflowPermissions();
  const { toast } = useToast();
  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch team members for managers
  const fetchTeamMembers = useCallback(async () => {
    if (!user || !profile || profile.role !== 'manager') {
      setTeamMembers([]);
      return;
    }

    try {
      setIsLoading(true);
      
      // Get teams where this user is the manager
      const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('id')
        .eq('manager_id', user.id)
        .eq('workspace_id', profile.workspace_id);

      if (teamsError) throw teamsError;

      if (!teams || teams.length === 0) {
        setTeamMembers([]);
        return;
      }

      // Get team members for all teams managed by this user
      const teamIds = teams.map(t => t.id);
      const { data: members, error: membersError } = await supabase
        .from('team_members')
        .select('user_id')
        .in('team_id', teamIds);

      if (membersError) throw membersError;

      const memberIds = members?.map(m => m.user_id) || [];
      setTeamMembers(memberIds);
      
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast({
        title: "Error",
        description: "Failed to load team information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, profile, toast]);

  // Build workspace-aware query filters
  const buildWorkflowFilters = useCallback((filters: TeamAwareWorkflowFilters = {}) => {
    if (!profile) return null;

    const baseFilters: any = {
      workspace_id: profile.workspace_id
    };

    switch (userRole) {
      case 'root':
        // Root users see everything - remove workspace filter
        return {};
        
      case 'admin':
        // Admins see all workflows in their workspace
        return baseFilters;
        
      case 'manager':
        // Managers see workflows involving their team
        const managerFilters: any[] = [];
        
        if (filters.includeOwnWorkflows !== false) {
          managerFilters.push({ created_by: user?.id });
        }
        
        if (filters.includeTeamMembers !== false && teamMembers.length > 0) {
          managerFilters.push({ created_by: { in: teamMembers } });
        }
        
        if (managerFilters.length === 0) {
          return { ...baseFilters, created_by: user?.id };
        }
        
        return {
          ...baseFilters,
          or: managerFilters
        };
        
      case 'employee':
        // Employees see limited workflows
        const employeeFilters: any[] = [];
        
        if (filters.includeOwnWorkflows !== false) {
          employeeFilters.push({ created_by: user?.id });
        }
        
        if (filters.includeReusableWorkflows !== false) {
          employeeFilters.push({ is_reusable: true });
        }
        
        // Note: includeAssignedWorkflows would require a more complex query
        // involving workflow_step_assignments table
        
        return {
          ...baseFilters,
          or: employeeFilters.length > 0 ? employeeFilters : [{ created_by: user?.id }]
        };
        
      default:
        return { ...baseFilters, created_by: user?.id };
    }
  }, [profile, userRole, user?.id, teamMembers]);

  // Get users available for assignment based on role
  const getAssignableUsers = useCallback(async () => {
    if (!profile) return [];

    try {
      let query = supabase
        .from('profiles')
        .select('id, first_name, last_name, email, role')
        .eq('workspace_id', profile.workspace_id);

      // Filter based on role permissions
      if (userRole === 'manager' && teamMembers.length > 0) {
        // Managers can only assign to their team members
        query = query.in('id', teamMembers);
      }
      // Admins and root users can assign to anyone in workspace (no additional filter)
      // Employees cannot assign (this shouldn't be called for employees)

      const { data, error } = await query.order('first_name');

      if (error) throw error;
      return data || [];
      
    } catch (error) {
      console.error('Error fetching assignable users:', error);
      toast({
        title: "Error",
        description: "Failed to load assignable users",
        variant: "destructive",
      });
      return [];
    }
  }, [profile, userRole, teamMembers, toast]);

  // Initialize team data
  useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);

  return {
    teamMembers,
    isLoading,
    dashboardScope,
    buildWorkflowFilters,
    getAssignableUsers,
    refetchTeamMembers: fetchTeamMembers,
  };
}
