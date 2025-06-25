
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
  const { dashboardScope, userRole, isRootUser } = useEnhancedWorkflowPermissions();
  const { toast } = useToast();
  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch team members for managers using new database function
  const fetchTeamMembers = useCallback(async () => {
    if (!user || !profile) {
      setTeamMembers([]);
      return;
    }

    // Root users and admins don't need team member restrictions
    if (profile.role === 'root' || profile.role === 'admin') {
      setTeamMembers([]);
      return;
    }

    // Only managers need to fetch team members
    if (profile.role !== 'manager') {
      setTeamMembers([]);
      return;
    }

    try {
      setIsLoading(true);
      
      // Use the new database function to get team members
      const { data, error } = await supabase.rpc('get_user_team_members', {
        manager_id: user.id
      });

      if (error) throw error;

      setTeamMembers(data || []);
      
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast({
        title: "Error",
        description: "Failed to load team information",
        variant: "destructive",
      });
      setTeamMembers([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, profile, toast]);

  // Build workspace-aware query filters - simplified since RLS handles most filtering
  const buildWorkflowFilters = useCallback((filters: TeamAwareWorkflowFilters = {}) => {
    if (!profile) return null;

    // For root users, return empty filter to see everything
    if (userRole === 'root') {
      return {};
    }

    // For other roles, basic workspace filtering is sufficient since RLS handles the rest
    const baseFilters: any = {
      workspace_id: profile.workspace_id
    };

    // Additional client-side filters can be added here if needed
    // But most filtering is now handled by RLS policies
    
    return baseFilters;
  }, [profile, userRole]);

  // Get users available for assignment based on role and team membership
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

  // Check if user can be assigned to by current user
  const canAssignToUser = useCallback((targetUserId: string) => {
    if (!profile) return false;
    
    // Root users can assign to anyone
    if (userRole === 'root') return true;
    
    // Admins can assign to anyone in their workspace
    if (userRole === 'admin') return true;
    
    // Managers can only assign to their team members
    if (userRole === 'manager') {
      return teamMembers.includes(targetUserId);
    }
    
    // Employees cannot assign
    return false;
  }, [profile, userRole, teamMembers]);

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
    canAssignToUser,
    refetchTeamMembers: fetchTeamMembers,
  };
}
