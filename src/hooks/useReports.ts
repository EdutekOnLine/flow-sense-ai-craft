
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { ReportFilters } from '@/components/reports/ReportsContent';

export interface WorkflowPerformanceData {
  workflow_id: string;
  workflow_name: string;
  created_by: string;
  total_instances: number;
  completed_instances: number;
  active_instances: number;
  cancelled_instances: number;
  avg_completion_hours: number;
  first_instance: string;
  latest_instance: string;
}

export interface UserActivityData {
  user_id: string;
  first_name: string;
  last_name: string;
  department: string;
  total_assignments: number;
  completed_assignments: number;
  pending_assignments: number;
  in_progress_assignments: number;
  avg_completion_hours: number;
  overdue_assignments: number;
}

export interface DepartmentAnalyticsData {
  department: string;
  user_count: number;
  total_assignments: number;
  completed_assignments: number;
  pending_assignments: number;
  in_progress_assignments: number;
  avg_completion_hours: number;
}

export function useWorkflowPerformanceReport(filters: ReportFilters) {
  const { user } = useAuth();
  const [data, setData] = useState<WorkflowPerformanceData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let query = supabase
          .from('workflow_performance_stats')
          .select('*');

        if (filters.workflowId) {
          query = query.eq('workflow_id', filters.workflowId);
        }

        const { data: reportData, error: reportError } = await query;

        if (reportError) throw reportError;
        setData(reportData || []);
      } catch (err) {
        console.error('Error fetching workflow performance data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, filters]);

  return { data, isLoading, error };
}

export function useUserActivityReport(filters: ReportFilters) {
  const { user } = useAuth();
  const [data, setData] = useState<UserActivityData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let query = supabase
          .from('user_activity_stats')
          .select('*');

        if (filters.userId) {
          query = query.eq('user_id', filters.userId);
        }

        if (filters.department) {
          query = query.eq('department', filters.department);
        }

        const { data: reportData, error: reportError } = await query;

        if (reportError) throw reportError;
        setData(reportData || []);
      } catch (err) {
        console.error('Error fetching user activity data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, filters]);

  return { data, isLoading, error };
}

export function useDepartmentAnalyticsReport(filters: ReportFilters) {
  const { user } = useAuth();
  const [data, setData] = useState<DepartmentAnalyticsData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let query = supabase
          .from('department_analytics')
          .select('*');

        if (filters.department) {
          query = query.eq('department', filters.department);
        }

        const { data: reportData, error: reportError } = await query;

        if (reportError) throw reportError;
        setData(reportData || []);
      } catch (err) {
        console.error('Error fetching department analytics data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, filters]);

  return { data, isLoading, error };
}
