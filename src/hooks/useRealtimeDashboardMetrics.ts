
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface DashboardMetrics {
  pendingTasks: number;
  inProgressTasks: number;
  completedTasksToday: number;
  activeWorkflows: number;
  myReusableWorkflows: number;
  totalSavedWorkflows: number;
}

export function useRealtimeDashboardMetrics() {
  const { profile } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    pendingTasks: 0,
    inProgressTasks: 0,
    completedTasksToday: 0,
    activeWorkflows: 0,
    myReusableWorkflows: 0,
    totalSavedWorkflows: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchMetrics = async () => {
    if (!profile) return;

    try {
      // Fetch task assignments metrics
      const { data: assignments } = await supabase
        .from('workflow_step_assignments')
        .select('status, created_at')
        .eq('assigned_to', profile.id);

      // Fetch workflow instances - ONLY include those with valid saved_workflows
      const { data: instances } = await supabase
        .from('workflow_instances')
        .select(`
          status,
          saved_workflows!inner(id)
        `)
        .eq('started_by', profile.id);

      // Fetch saved workflows based on role
      let workflowQuery = supabase.from('saved_workflows').select('id, is_reusable, created_by');
      
      if (profile.role === 'employee') {
        workflowQuery = workflowQuery.eq('created_by', profile.id);
      }

      const { data: workflows } = await workflowQuery;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const newMetrics: DashboardMetrics = {
        pendingTasks: assignments?.filter(a => a.status === 'pending').length || 0,
        inProgressTasks: assignments?.filter(a => a.status === 'in_progress').length || 0,
        completedTasksToday: assignments?.filter(a => 
          a.status === 'completed' && 
          new Date(a.created_at) >= today
        ).length || 0,
        // Only count workflow instances that have valid saved workflows
        activeWorkflows: instances?.filter(i => i.status === 'active').length || 0,
        myReusableWorkflows: workflows?.filter(w => w.is_reusable).length || 0,
        totalSavedWorkflows: workflows?.length || 0,
      };

      setMetrics(newMetrics);
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!profile) return;

    // Initial fetch
    fetchMetrics();

    // Set up real-time subscriptions
    const assignmentsChannel = supabase
      .channel('dashboard-assignments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workflow_step_assignments',
          filter: `assigned_to=eq.${profile.id}`
        },
        () => {
          fetchMetrics();
        }
      )
      .subscribe();

    const instancesChannel = supabase
      .channel('dashboard-instances')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workflow_instances',
          filter: `started_by=eq.${profile.id}`
        },
        () => {
          fetchMetrics();
        }
      )
      .subscribe();

    const workflowsChannel = supabase
      .channel('dashboard-workflows')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'saved_workflows'
        },
        () => {
          fetchMetrics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(assignmentsChannel);
      supabase.removeChannel(instancesChannel);
      supabase.removeChannel(workflowsChannel);
    };
  }, [profile?.id, profile?.role]);

  return { metrics, isLoading, refresh: fetchMetrics };
}
