
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type AssignmentStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';

export interface WorkflowAssignment {
  id: string;
  workflow_step_id: string;
  assigned_to: string;
  assigned_by: string;
  status: AssignmentStatus;
  due_date?: string;
  completed_at?: string;
  notes?: string;
  created_at: string;
  workflow_steps: {
    name: string;
    description?: string;
    workflow_id: string;
    step_order: number;
    workflows: {
      name: string;
    };
  };
  workflow_instance?: {
    id: string;
    status: string;
    current_step_id: string | null;
    started_by: string;
    created_at: string;
  };
}

export function useWorkflowAssignmentData() {
  const [assignments, setAssignments] = useState<WorkflowAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { profile, isRootUser } = useAuth();

  const fetchAssignments = useCallback(async () => {
    if (!profile?.id) {
      setAssignments([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      let query = supabase
        .from('workflow_step_assignments')
        .select(`
          *,
          workflow_steps (
            name,
            description,
            workflow_id,
            step_order,
            workflows (
              name
            )
          ),
          workflow_instance:workflow_instances!workflow_instances_current_step_id_fkey (
            id,
            status,
            current_step_id,
            started_by,
            created_at
          )
        `);

      // Root users can see all assignments, regular users only see their own
      if (!isRootUser()) {
        query = query.eq('assigned_to', profile.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching workflow assignments:', error);
        throw error;
      }

      console.log('Fetched workflow assignments:', data?.length || 0, 'assignments');
      setAssignments(data || []);
    } catch (error) {
      console.error('Failed to fetch workflow assignments:', error);
      setAssignments([]);
    } finally {
      setIsLoading(false);
    }
  }, [profile?.id, isRootUser]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  return {
    assignments,
    isLoading,
    fetchAssignments,
    setAssignments,
  };
}
