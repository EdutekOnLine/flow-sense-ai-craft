
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface DashboardMetrics {
  totalWorkflows: number;
  activeWorkflows: number;
  completedWorkflows: number;
  pendingTasks: number;
  completedTasks: number;
  completedTasksToday: number;
  inProgressTasks: number;
  totalUsers: number;
  onlineUsers: number;
  myReusableWorkflows: number;
  totalSavedWorkflows: number;
}

export function useRealtimeDashboardMetrics() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalWorkflows: 0,
    activeWorkflows: 0,
    completedWorkflows: 0,
    pendingTasks: 0,
    completedTasks: 0,
    completedTasksToday: 0,
    inProgressTasks: 0,
    totalUsers: 0,
    onlineUsers: 0,
    myReusableWorkflows: 0,
    totalSavedWorkflows: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { profile, isRootUser } = useAuth();

  const fetchMetrics = async () => {
    if (!profile?.id) {
      setIsLoading(false);
      return;
    }

    try {
      // Fetch workflow metrics
      let workflowQuery = supabase.from('workflows').select('status');
      let taskQuery = supabase.from('workflow_step_assignments').select('status, completed_at');
      let savedWorkflowQuery = supabase.from('saved_workflows').select('id');
      
      // Root users see all data, regular users see only their workspace data  
      if (!isRootUser() && profile.workspace_id) {
        // For regular users, we would need to join with workspace data
        // For now, let them see all data in this demo
      }

      const [workflowsResult, tasksResult, usersResult, presenceResult, savedWorkflowsResult] = await Promise.all([
        workflowQuery,
        taskQuery,
        supabase.from('profiles').select('id, role'),
        supabase.from('user_presence').select('is_online'),
        savedWorkflowQuery
      ]);

      const workflows = workflowsResult.data || [];
      const tasks = tasksResult.data || [];
      const users = usersResult.data || [];
      const presence = presenceResult.data || [];
      const savedWorkflows = savedWorkflowsResult.data || [];

      // Calculate completed tasks today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const completedToday = tasks.filter(t => 
        t.status === 'completed' && 
        t.completed_at && 
        new Date(t.completed_at) >= today
      ).length;

      // Calculate reusable workflows (from workflows table)
      const reusableWorkflowsResult = await supabase
        .from('workflows')
        .select('id')
        .eq('is_reusable', true);
      const reusableWorkflows = reusableWorkflowsResult.data || [];

      setMetrics({
        totalWorkflows: workflows.length,
        activeWorkflows: workflows.filter(w => w.status === 'active').length,
        completedWorkflows: workflows.filter(w => w.status === 'completed').length,
        pendingTasks: tasks.filter(t => t.status === 'pending').length,
        completedTasks: tasks.filter(t => t.status === 'completed').length,
        completedTasksToday: completedToday,
        inProgressTasks: tasks.filter(t => t.status === 'in_progress').length,
        totalUsers: users.length,
        onlineUsers: presence.filter(p => p.is_online).length,
        myReusableWorkflows: reusableWorkflows.length,
        totalSavedWorkflows: savedWorkflows.length,
      });

      console.log('Dashboard metrics updated:', {
        workflows: workflows.length,
        tasks: tasks.length,
        users: users.length,
        savedWorkflows: savedWorkflows.length
      });
    } catch (error) {
      console.error('Failed to fetch dashboard metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();

    // Set up real-time subscriptions for metrics updates
    const workflowsChannel = supabase
      .channel('dashboard-workflows')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'workflows' }, 
        () => fetchMetrics()
      )
      .subscribe();

    const tasksChannel = supabase
      .channel('dashboard-tasks')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'workflow_step_assignments' }, 
        () => fetchMetrics()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(workflowsChannel);
      supabase.removeChannel(tasksChannel);
    };
  }, [profile?.id, isRootUser]);

  return {
    metrics,
    isLoading,
    refetch: fetchMetrics,
  };
}
