
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
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch saved workflows
      const { data: workflows } = await supabase
        .from('saved_workflows')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch assignments
      const { data: assignments } = await supabase
        .from('workflow_step_assignments')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch workflow steps
      const { data: workflowSteps } = await supabase
        .from('workflow_steps')
        .select('*');

      // Fetch profiles for user names
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name');

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

      // Create lookup maps
      const workflowsMap = new Map(workflows?.map(w => [w.id, w]) || []);
      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);
      const workflowStepsMap = new Map(workflowSteps?.map(s => [s.id, s]) || []);

      // Recent activity
      const recentActivity: RecentActivity[] = [];
      
      // Add recent instance starts
      instances?.slice(0, 3).forEach(instance => {
        const workflow = workflowsMap.get(instance.workflow_id);
        recentActivity.push({
          id: `instance-${instance.id}`,
          type: 'instance_started',
          title: `Workflow "${workflow?.name || 'Unknown'}" started`,
          timestamp: instance.created_at,
          workflowName: workflow?.name || 'Unknown'
        });
      });

      // Add recent completed assignments
      assignments?.filter(a => a.status === 'completed').slice(0, 3).forEach(assignment => {
        const workflowStep = workflowStepsMap.get(assignment.workflow_step_id);
        const assignedUser = profilesMap.get(assignment.assigned_to);
        
        recentActivity.push({
          id: `assignment-${assignment.id}`,
          type: 'assignment_completed',
          title: `Task "${workflowStep?.name || 'Unknown'}" completed`,
          timestamp: assignment.updated_at || assignment.created_at,
          user: assignedUser ? `${assignedUser.first_name || ''} ${assignedUser.last_name || ''}`.trim() : 'Unknown User',
          workflowName: 'Task Assignment'
        });
      });

      // Sort by timestamp
      recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // Enhance active instances with workflow names
      const enhancedActiveInstances = instances?.filter(i => i.status === 'active').slice(0, 5).map(instance => ({
        ...instance,
        saved_workflows: workflowsMap.get(instance.workflow_id)
      })) || [];

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
        activeInstances: enhancedActiveInstances,
        myRecentAssignments: assignments?.filter(a => a.assigned_to === profile.id).slice(0, 5) || []
      };
    },
    enabled: !!profile,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}
