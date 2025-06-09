
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface WorkflowAnalytics {
  id: string;
  name: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  assigned_to: string | null;
  created_by_name: string;
  assigned_to_name: string | null;
  total_steps: number;
  completed_steps: number;
  in_progress_steps: number;
  pending_steps: number;
  completion_percentage: number;
  total_estimated_hours: number;
  total_actual_hours: number;
  total_duration_hours: number;
}

export interface UserAnalytics {
  id: string;
  full_name: string;
  role: string;
  department: string | null;
  workflows_created: number;
  workflows_assigned: number;
  steps_assigned: number;
  steps_completed: number;
  steps_in_progress: number;
  completion_rate: number;
  total_estimated_hours: number;
  total_actual_hours: number;
  avg_time_variance: number;
}

export interface DepartmentAnalytics {
  department: string;
  total_users: number;
  workflows_created: number;
  total_steps: number;
  completed_steps: number;
  department_completion_rate: number;
  total_estimated_hours: number;
  total_actual_hours: number;
  avg_time_variance: number;
}

export interface WorkflowTrends {
  date: string;
  workflows_created: number;
  workflows_completed: number;
  workflows_active: number;
  workflows_paused: number;
  avg_completion_time_hours: number;
}

export interface AIInsight {
  id: string;
  insight_type: string;
  title: string;
  description: string;
  data: any;
  confidence_score: number;
  created_at: string;
  expires_at: string | null;
  is_active: boolean;
}

export function useWorkflowAnalytics() {
  return useQuery({
    queryKey: ['workflow-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflow_performance_analytics')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching workflow analytics:', error);
        throw error;
      }

      return data as WorkflowAnalytics[];
    },
  });
}

export function useUserAnalytics() {
  return useQuery({
    queryKey: ['user-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_performance_analytics')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) {
        console.error('Error fetching user analytics:', error);
        throw error;
      }

      return data as UserAnalytics[];
    },
  });
}

export function useDepartmentAnalytics() {
  return useQuery({
    queryKey: ['department-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('department_analytics')
        .select('*')
        .order('department', { ascending: true });

      if (error) {
        console.error('Error fetching department analytics:', error);
        throw error;
      }

      return data as DepartmentAnalytics[];
    },
  });
}

export function useWorkflowTrends(days: number = 30) {
  return useQuery({
    queryKey: ['workflow-trends', days],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflow_trends')
        .select('*')
        .order('date', { ascending: false })
        .limit(days);

      if (error) {
        console.error('Error fetching workflow trends:', error);
        throw error;
      }

      return data as WorkflowTrends[];
    },
  });
}

export function useAIInsights() {
  return useQuery({
    queryKey: ['ai-insights'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching AI insights:', error);
        throw error;
      }

      return data as AIInsight[];
    },
  });
}

export function useGenerateAIInsights() {
  return async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('No session found');
    }

    const response = await fetch('/functions/v1/generate-ai-insights', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to generate insights');
    }

    return response.json();
  };
}
