
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

        // Fetch workflow instances with related workflow data
        const { data: instancesData, error: instancesError } = await supabase
          .from('workflow_instances')
          .select(`
            workflow_id,
            status,
            created_at,
            completed_at,
            saved_workflows!inner(name, created_by)
          `);

        if (instancesError) throw instancesError;

        // Process the data manually
        const processedData = processWorkflowData(instancesData || [], filters);
        setData(processedData);
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

        // Fetch profiles and assignments separately
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

        // Fetch profiles and assignments separately
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
function processWorkflowData(rawData: any[], filters: ReportFilters): WorkflowPerformanceData[] {
  // Filter by workflow if specified
  const filteredData = filters.workflowId 
    ? rawData.filter(item => item.workflow_id === filters.workflowId)
    : rawData;

  const groupedData = filteredData.reduce((acc, item) => {
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
  }, {} as Record<string, any>);

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
      ? completedTimes.reduce((sum: number, time: number) => sum + time, 0) / completedTimes.length 
      : 0;

    const createdTimes = instances.map((i: any) => new Date(i.created_at).getTime());

    return {
      workflow_id: group.workflow_id,
      workflow_name: group.workflow_name,
      created_by: group.created_by,
      total_instances: totalInstances,
      completed_instances: completedInstances,
      active_instances: activeInstances,
      cancelled_instances: cancelledInstances,
      avg_completion_hours: avgCompletionHours,
      first_instance: new Date(Math.min(...createdTimes)).toISOString(),
      latest_instance: new Date(Math.max(...createdTimes)).toISOString()
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
      ? completedTimes.reduce((sum: number, time: number) => sum + time, 0) / completedTimes.length 
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
  }, {} as Record<string, any>);

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
      ? completedTimes.reduce((sum: number, time: number) => sum + time, 0) / completedTimes.length 
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
