
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

        let query = `
          SELECT 
            wi.workflow_id,
            sw.name as workflow_name,
            sw.created_by,
            COUNT(*) as total_instances,
            COUNT(CASE WHEN wi.status = 'completed' THEN 1 END) as completed_instances,
            COUNT(CASE WHEN wi.status = 'active' THEN 1 END) as active_instances,
            COUNT(CASE WHEN wi.status = 'cancelled' THEN 1 END) as cancelled_instances,
            AVG(CASE 
              WHEN wi.completed_at IS NOT NULL 
              THEN EXTRACT(EPOCH FROM (wi.completed_at - wi.created_at))/3600 
            END) as avg_completion_hours,
            MIN(wi.created_at) as first_instance,
            MAX(wi.created_at) as latest_instance
          FROM workflow_instances wi
          JOIN saved_workflows sw ON sw.id = wi.workflow_id
          WHERE 1=1
        `;

        const params: any[] = [];
        let paramIndex = 1;

        if (filters.workflowId) {
          query += ` AND wi.workflow_id = $${paramIndex}`;
          params.push(filters.workflowId);
          paramIndex++;
        }

        query += ` GROUP BY wi.workflow_id, sw.name, sw.created_by ORDER BY total_instances DESC`;

        const { data: reportData, error: reportError } = await supabase.rpc('custom_query', {
          query_text: query,
          params: params
        });

        if (reportError) {
          // Fallback to a simpler query if custom_query doesn't exist
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('workflow_instances')
            .select(`
              workflow_id,
              status,
              created_at,
              completed_at,
              saved_workflows!inner(name, created_by)
            `);

          if (fallbackError) throw fallbackError;

          // Process the data manually
          const processedData = processWorkflowData(fallbackData || []);
          setData(processedData);
        } else {
          setData(reportData || []);
        }
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

        // Use a simpler approach with existing tables
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*');

        if (profilesError) throw profilesError;

        const { data: assignmentsData, error: assignmentsError } = await supabase
          .from('workflow_step_assignments')
          .select('*');

        if (assignmentsError) throw assignmentsError;

        // Process the data manually
        const processedData = processUserActivityData(profilesData || [], assignmentsData || [], filters);
        setData(processedData);
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

        // Use a simpler approach with existing tables
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .not('department', 'is', null);

        if (profilesError) throw profilesError;

        const { data: assignmentsData, error: assignmentsError } = await supabase
          .from('workflow_step_assignments')
          .select('*');

        if (assignmentsError) throw assignmentsError;

        // Process the data manually
        const processedData = processDepartmentData(profilesData || [], assignmentsData || [], filters);
        setData(processedData);
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

// Helper functions to process data manually
function processWorkflowData(rawData: any[]): WorkflowPerformanceData[] {
  const groupedData = rawData.reduce((acc, item) => {
    const key = item.workflow_id;
    if (!acc[key]) {
      acc[key] = {
        workflow_id: item.workflow_id,
        workflow_name: item.saved_workflows?.name || 'Unknown',
        created_by: item.saved_workflows?.created_by || '',
        instances: []
      };
    }
    acc[key].instances.push(item);
    return acc;
  }, {});

  return Object.values(groupedData).map((group: any) => {
    const instances = group.instances;
    const totalInstances = instances.length;
    const completedInstances = instances.filter((i: any) => i.status === 'completed').length;
    const activeInstances = instances.filter((i: any) => i.status === 'active').length;
    const cancelledInstances = instances.filter((i: any) => i.status === 'cancelled').length;
    
    const completedTimes = instances
      .filter((i: any) => i.completed_at && i.created_at)
      .map((i: any) => (new Date(i.completed_at).getTime() - new Date(i.created_at).getTime()) / (1000 * 60 * 60));
    
    const avgCompletionHours = completedTimes.length > 0 
      ? completedTimes.reduce((sum, time) => sum + time, 0) / completedTimes.length 
      : 0;

    return {
      workflow_id: group.workflow_id,
      workflow_name: group.workflow_name,
      created_by: group.created_by,
      total_instances: totalInstances,
      completed_instances: completedInstances,
      active_instances: activeInstances,
      cancelled_instances: cancelledInstances,
      avg_completion_hours: avgCompletionHours,
      first_instance: Math.min(...instances.map((i: any) => new Date(i.created_at).getTime())).toString(),
      latest_instance: Math.max(...instances.map((i: any) => new Date(i.created_at).getTime())).toString()
    };
  });
}

function processUserActivityData(profiles: any[], assignments: any[], filters: ReportFilters): UserActivityData[] {
  return profiles.map(profile => {
    const userAssignments = assignments.filter(a => a.assigned_to === profile.id);
    
    const completedAssignments = userAssignments.filter(a => a.status === 'completed');
    const pendingAssignments = userAssignments.filter(a => a.status === 'pending');
    const inProgressAssignments = userAssignments.filter(a => a.status === 'in_progress');
    
    const completedTimes = completedAssignments
      .filter(a => a.completed_at && a.created_at)
      .map(a => (new Date(a.completed_at).getTime() - new Date(a.created_at).getTime()) / (1000 * 60 * 60));
    
    const avgCompletionHours = completedTimes.length > 0 
      ? completedTimes.reduce((sum, time) => sum + time, 0) / completedTimes.length 
      : 0;

    const overdueAssignments = userAssignments.filter(a => 
      a.due_date && new Date(a.due_date) < new Date() && a.status !== 'completed'
    );

    return {
      user_id: profile.id,
      first_name: profile.first_name || '',
      last_name: profile.last_name || '',
      department: profile.department || '',
      total_assignments: userAssignments.length,
      completed_assignments: completedAssignments.length,
      pending_assignments: pendingAssignments.length,
      in_progress_assignments: inProgressAssignments.length,
      avg_completion_hours: avgCompletionHours,
      overdue_assignments: overdueAssignments.length
    };
  }).filter(user => 
    !filters.department || user.department === filters.department
  ).filter(user =>
    !filters.userId || user.user_id === filters.userId
  );
}

function processDepartmentData(profiles: any[], assignments: any[], filters: ReportFilters): DepartmentAnalyticsData[] {
  const departmentGroups = profiles.reduce((acc, profile) => {
    const dept = profile.department;
    if (!dept) return acc;
    
    if (!acc[dept]) {
      acc[dept] = {
        department: dept,
        users: []
      };
    }
    acc[dept].users.push(profile);
    return acc;
  }, {});

  return Object.values(departmentGroups).map((group: any) => {
    const userIds = group.users.map((u: any) => u.id);
    const deptAssignments = assignments.filter(a => userIds.includes(a.assigned_to));
    
    const completedAssignments = deptAssignments.filter(a => a.status === 'completed');
    const pendingAssignments = deptAssignments.filter(a => a.status === 'pending');
    const inProgressAssignments = deptAssignments.filter(a => a.status === 'in_progress');
    
    const completedTimes = completedAssignments
      .filter(a => a.completed_at && a.created_at)
      .map(a => (new Date(a.completed_at).getTime() - new Date(a.created_at).getTime()) / (1000 * 60 * 60));
    
    const avgCompletionHours = completedTimes.length > 0 
      ? completedTimes.reduce((sum, time) => sum + time, 0) / completedTimes.length 
      : 0;

    return {
      department: group.department,
      user_count: group.users.length,
      total_assignments: deptAssignments.length,
      completed_assignments: completedAssignments.length,
      pending_assignments: pendingAssignments.length,
      in_progress_assignments: inProgressAssignments.length,
      avg_completion_hours: avgCompletionHours
    };
  }).filter(dept => 
    !filters.department || dept.department === filters.department
  );
}
