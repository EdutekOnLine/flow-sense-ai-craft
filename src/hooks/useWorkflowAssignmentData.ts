
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

type AssignmentStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';

interface WorkflowAssignment {
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
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<WorkflowAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAssignments = useCallback(async () => {
    if (!user) {
      console.log('No user found, skipping assignment fetch');
      return;
    }

    console.log('=== WORKFLOW ASSIGNMENT FETCH DEBUG ===');
    console.log('Current user ID:', user.id);
    
    setIsLoading(true);
    try {
      // Get all assignments for the current user with step and workflow details
      const { data, error } = await supabase
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
          )
        `)
        .eq('assigned_to', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching assignments:', error);
        throw error;
      }

      console.log('Raw assignments from database:', data);

      if (!data || data.length === 0) {
        console.log('No assignments found for user');
        setAssignments([]);
        return;
      }

      // Process assignments and filter based on workflow instance status
      const processedAssignments: WorkflowAssignment[] = [];

      for (const assignment of data) {
        if (!assignment.workflow_steps) continue;

        // Get the active workflow instance for this assignment's workflow
        const { data: instanceData, error: instanceError } = await supabase
          .from('workflow_instances')
          .select('*')
          .eq('workflow_id', assignment.workflow_steps.workflow_id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1);

        if (instanceError) {
          console.error('Error fetching workflow instance:', instanceError);
          continue;
        }

        let workflowInstance = null;
        let shouldShow = false;

        if (instanceData && instanceData.length > 0) {
          workflowInstance = instanceData[0];
          console.log('Found workflow instance:', workflowInstance);

          // Show assignment if it's the current step OR if it's completed
          if (workflowInstance.current_step_id === assignment.workflow_step_id) {
            shouldShow = true;
            console.log(`Assignment ${assignment.id} is the current step, showing to user`);
          } else if (assignment.status === 'completed') {
            // Show completed assignments for history
            shouldShow = true;
            console.log(`Assignment ${assignment.id} is completed, showing for history`);
          } else {
            console.log(`Assignment ${assignment.id} is not the current step (current: ${workflowInstance.current_step_id}, assignment: ${assignment.workflow_step_id}), hiding from user`);
          }
        } else {
          // No active workflow instance found - this assignment is orphaned
          console.log(`Assignment ${assignment.id} has no active workflow instance, removing it`);
          
          // Clean up orphaned assignment
          const { error: deleteError } = await supabase
            .from('workflow_step_assignments')
            .delete()
            .eq('id', assignment.id);
            
          if (deleteError) {
            console.error('Error deleting orphaned assignment:', deleteError);
          } else {
            console.log(`Deleted orphaned assignment ${assignment.id}`);
          }
        }

        if (shouldShow) {
          const typedAssignment: WorkflowAssignment = {
            ...assignment,
            status: assignment.status as AssignmentStatus,
            workflow_instance: workflowInstance
          };
          
          processedAssignments.push(typedAssignment);
        }
      }

      console.log('Processed assignments for user:', processedAssignments);
      console.log('=== END WORKFLOW ASSIGNMENT DEBUG ===');
      setAssignments(processedAssignments);
    } catch (error) {
      console.error('Error fetching workflow assignments:', error);
      toast({
        title: "Error",
        description: "Failed to load workflow assignments",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, profile, toast]);

  // Set up real-time subscription for assignment changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('user-assignments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workflow_step_assignments',
          filter: `assigned_to=eq.${user.id}`
        },
        (payload) => {
          console.log('Assignment change detected:', payload);
          // Refresh assignments when any change occurs
          fetchAssignments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchAssignments]);

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

export type { WorkflowAssignment, AssignmentStatus };
