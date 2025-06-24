
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface WorkflowMetrics {
  activeInstances: number;
  pendingAssignments: number;
  completedTasksThisWeek: number;
  completedTasksThisMonth: number;
  averageCompletionTime: number;
  myTemplates: number;
  totalTemplates: number;
  teamProductivity: number;
}

interface RecentActivity {
  id: string;
  type: 'instance_started' | 'assignment_completed' | 'template_created';
  title: string;
  timestamp: string;
  user?: string;
  workflowName?: string;
}

interface WorkflowDashboardData {
  metrics: WorkflowMetrics;
  recentActivity: RecentActivity[];
  activeInstances: any[];
  myRecentAssignments: any[];
}

export function useWorkflowDashboardData() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['workflow-dashboard-data', profile?.id],
    queryFn: async (): Promise<WorkflowDashboardData> => {
      if (!profile) throw new Error('No user profile');

      // Fetch workflow instances
      const { data: instances } = await supabase
        .from('workflow_instances')
        .select(`
          *,
          saved_workflows!inner(name, created_by)
        `)
        .order('created_at', { ascending: false });

      // Fetch assignments
      const { data: assignments } = await supabase
        .from('workflow_step_assignments')
        .select(`
          *,
          workflow_instances!inner(
            id,
            saved_workflows!inner(name)
          ),
          profiles!inner(first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      // Fetch saved workflows
      const { data: workflows } = await supabase
        .from('saved_workflows')
        .select('*')
        .order('created_at', { ascending: false });

      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Calculate metrics
      const activeInstances = instances?.filter(i => i.status === 'active').length || 0;
      const pendingAssignments = assignments?.filter(a => a.assigned_to === profile.id && a.status === 'pending').length || 0;
      
      const completedThisWeek = assignments?.filter(a => 
        a.status === 'completed' && 
        new Date(a.updated_at || a.created_at) >= weekAgo
      ).length || 0;

      const completedThisMonth = assignments?.filter(a => 
        a.status === 'completed' && 
        new Date(a.updated_at || a.created_at) >= monthAgo
      ).length || 0;

      const myTemplates = workflows?.filter(w => w.created_by === profile.id).length || 0;
      const totalTemplates = workflows?.length || 0;

      // Mock average completion time (in hours)
      const averageCompletionTime = Math.floor(Math.random() * 48) + 2;

      // Mock team productivity score
      const teamProductivity = Math.floor(Math.random() * 100) + 75;

      // Recent activity
      const recentActivity: RecentActivity[] = [];
      
      // Add recent instance starts
      instances?.slice(0, 3).forEach(instance => {
        recentActivity.push({
          id: `instance-${instance.id}`,
          type: 'instance_started',
          title: `Workflow "${instance.saved_workflows?.name}" started`,
          timestamp: instance.created_at,
          workflowName: instance.saved_workflows?.name
        });
      });

      // Add recent completed assignments
      assignments?.filter(a => a.status === 'completed').slice(0, 3).forEach(assignment => {
        recentActivity.push({
          id: `assignment-${assignment.id}`,
          type: 'assignment_completed',
          title: `Task completed in "${assignment.workflow_instances?.saved_workflows?.name}"`,
          timestamp: assignment.updated_at || assignment.created_at,
          user: `${assignment.profiles?.first_name} ${assignment.profiles?.last_name}`,
          workflowName: assignment.workflow_instances?.saved_workflows?.name
        });
      });

      // Sort by timestamp
      recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return {
        metrics: {
          activeInstances,
          pendingAssignments,
          completedTasksThisWeek: completedThisWeek,
          completedTasksThisMonth: completedThisMonth,
          averageCompletionTime,
          myTemplates,
          totalTemplates,
          teamProductivity
        },
        recentActivity: recentActivity.slice(0, 10),
        activeInstances: instances?.filter(i => i.status === 'active').slice(0, 5) || [],
        myRecentAssignments: assignments?.filter(a => a.assigned_to === profile.id).slice(0, 5) || []
      };
    },
    enabled: !!profile,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}
