
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface WorkflowAnalytics {
  totalWorkflows: number;
  activeInstances: number;
  completionRate: number;
  averageCompletionTime: number;
  totalSteps: number;
  completedSteps: number;
  pendingSteps: number;
  inProgressSteps: number;
  totalTemplates: number;
  myTemplates: number;
  assignmentsCompleted: number;
  assignmentsPending: number;
}

interface WorkflowStatusBreakdown {
  draft: number;
  active: number;
  completed: number;
  paused: number;
}

interface StepStatusBreakdown {
  pending: number;
  in_progress: number;
  completed: number;
  cancelled: number;
}

interface WorkflowAnalyticsData {
  analytics: WorkflowAnalytics;
  statusBreakdown: WorkflowStatusBreakdown;
  stepStatusBreakdown: StepStatusBreakdown;
  topTemplates: Array<{ name: string; usage: number; completion_rate: number }>;
  assignmentDistribution: Array<{ user_name: string; total_assignments: number; completed: number; pending: number }>;
  recentActivity: Array<{ id: string; type: string; title: string; timestamp: string; user?: string }>;
}

export function useWorkflowAnalytics() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['workflow-analytics', profile?.id],
    queryFn: async (): Promise<WorkflowAnalyticsData> => {
      if (!profile) throw new Error('No user profile');

      // Fetch workflows
      const { data: workflows } = await supabase
        .from('workflows')
        .select('*');

      // Fetch saved workflows (templates)
      const { data: savedWorkflows } = await supabase
        .from('saved_workflows')
        .select('*');

      // Fetch workflow instances
      const { data: instances } = await supabase
        .from('workflow_instances')
        .select('*');

      // Fetch workflow steps
      const { data: steps } = await supabase
        .from('workflow_steps')
        .select('*');

      // Fetch step assignments
      const { data: assignments } = await supabase
        .from('workflow_step_assignments')
        .select('*');

      // Fetch profiles for user names
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name');

      const now = new Date();
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Calculate analytics
      const totalWorkflows = workflows?.length || 0;
      const activeInstances = instances?.filter(i => i.status === 'active').length || 0;
      const completedInstances = instances?.filter(i => i.status === 'completed').length || 0;
      const completionRate = totalWorkflows > 0 ? Math.round((completedInstances / totalWorkflows) * 100) : 0;

      // Mock average completion time (in hours)
      const averageCompletionTime = Math.floor(Math.random() * 72) + 8;

      const totalSteps = steps?.length || 0;
      const completedSteps = steps?.filter(s => s.status === 'completed').length || 0;
      const pendingSteps = steps?.filter(s => s.status === 'pending').length || 0;
      const inProgressSteps = steps?.filter(s => s.status === 'in_progress').length || 0;

      const totalTemplates = savedWorkflows?.length || 0;
      const myTemplates = savedWorkflows?.filter(w => w.created_by === profile.id).length || 0;

      const assignmentsCompleted = assignments?.filter(a => a.status === 'completed').length || 0;
      const assignmentsPending = assignments?.filter(a => a.status === 'pending').length || 0;

      // Status breakdowns
      const statusBreakdown: WorkflowStatusBreakdown = {
        draft: workflows?.filter(w => w.status === 'draft').length || 0,
        active: workflows?.filter(w => w.status === 'active').length || 0,
        completed: workflows?.filter(w => w.status === 'completed').length || 0,
        paused: workflows?.filter(w => w.status === 'paused').length || 0,
      };

      const stepStatusBreakdown: StepStatusBreakdown = {
        pending: pendingSteps,
        in_progress: inProgressSteps,
        completed: completedSteps,
        cancelled: steps?.filter(s => s.status === 'cancelled').length || 0,
      };

      // Top templates (mock data based on saved workflows)
      const topTemplates = savedWorkflows?.slice(0, 5).map(template => ({
        name: template.name,
        usage: Math.floor(Math.random() * 50) + 10,
        completion_rate: Math.floor(Math.random() * 100) + 70,
      })) || [];

      // Assignment distribution
      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);
      const assignmentsByUser = assignments?.reduce((acc, assignment) => {
        const userId = assignment.assigned_to;
        if (!acc[userId]) {
          acc[userId] = { total: 0, completed: 0, pending: 0 };
        }
        acc[userId].total++;
        if (assignment.status === 'completed') acc[userId].completed++;
        if (assignment.status === 'pending') acc[userId].pending++;
        return acc;
      }, {} as Record<string, { total: number; completed: number; pending: number }>) || {};

      const assignmentDistribution = Object.entries(assignmentsByUser).map(([userId, stats]) => {
        const user = profilesMap.get(userId);
        return {
          user_name: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'Unknown User',
          total_assignments: stats.total,
          completed: stats.completed,
          pending: stats.pending,
        };
      }).slice(0, 10);

      // Recent activity
      const recentActivity = [];
      
      // Add recent workflow instances
      instances?.slice(0, 3).forEach(instance => {
        const workflow = workflows?.find(w => w.id === instance.workflow_id);
        recentActivity.push({
          id: `instance-${instance.id}`,
          type: 'workflow_started',
          title: `Workflow "${workflow?.name || 'Unknown'}" started`,
          timestamp: instance.created_at,
        });
      });

      // Add recent completed assignments
      assignments?.filter(a => a.status === 'completed').slice(0, 3).forEach(assignment => {
        const step = steps?.find(s => s.id === assignment.workflow_step_id);
        const user = profilesMap.get(assignment.assigned_to);
        
        recentActivity.push({
          id: `assignment-${assignment.id}`,
          type: 'assignment_completed',
          title: `Step "${step?.name || 'Unknown'}" completed`,
          timestamp: assignment.updated_at || assignment.created_at,
          user: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'Unknown User',
        });
      });

      recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return {
        analytics: {
          totalWorkflows,
          activeInstances,
          completionRate,
          averageCompletionTime,
          totalSteps,
          completedSteps,
          pendingSteps,
          inProgressSteps,
          totalTemplates,
          myTemplates,
          assignmentsCompleted,
          assignmentsPending,
        },
        statusBreakdown,
        stepStatusBreakdown,
        topTemplates,
        assignmentDistribution,
        recentActivity: recentActivity.slice(0, 10),
      };
    },
    enabled: !!profile,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}
