
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

export function useWorkflowAssignments() {
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

      // Process assignments and check for workflow instances
      const processedAssignments: WorkflowAssignment[] = [];

      for (const assignment of data) {
        if (!assignment.workflow_steps) continue;

        // Check if there's an active workflow instance for this assignment's workflow
        const { data: instanceData, error: instanceError } = await supabase
          .from('workflow_instances')
          .select('*')
          .eq('workflow_id', assignment.workflow_steps.workflow_id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1);

        if (instanceError) {
          console.error('Error fetching workflow instance:', instanceError);
        }

        let workflowInstance = null;
        let shouldShow = false;

        if (instanceData && instanceData.length > 0) {
          workflowInstance = instanceData[0];
          console.log('Found workflow instance:', workflowInstance);

          // CRITICAL: Only show assignment if it's the current step in the workflow instance
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
          // No active workflow instance - this might be a standalone assignment or from a saved workflow
          // Only show if it's pending or in progress
          if (assignment.status === 'pending' || assignment.status === 'in_progress') {
            shouldShow = true;
            console.log(`Assignment ${assignment.id} has no active instance but is pending/in_progress, showing to user`);
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

  const updateAssignmentStatus = useCallback(async (
    assignmentId: string, 
    status: AssignmentStatus,
    notes?: string
  ) => {
    try {
      const updateData: any = { status };
      
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }
      
      if (notes !== undefined) {
        updateData.notes = notes;
      }

      const { error } = await supabase
        .from('workflow_step_assignments')
        .update(updateData)
        .eq('id', assignmentId);

      if (error) throw error;

      setAssignments(prev => 
        prev.map(assignment => 
          assignment.id === assignmentId 
            ? { ...assignment, ...updateData }
            : assignment
        )
      );

      toast({
        title: "Status Updated",
        description: `Assignment marked as ${status.replace('_', ' ')}`,
      });
    } catch (error) {
      console.error('Error updating assignment status:', error);
      toast({
        title: "Error",
        description: "Failed to update assignment status",
        variant: "destructive",
      });
    }
  }, [toast]);

  const completeStep = useCallback(async (
    assignmentId: string,
    completionNotes?: string
  ) => {
    try {
      // Get the assignment details first
      const assignment = assignments.find(a => a.id === assignmentId);
      if (!assignment) {
        throw new Error('Assignment not found');
      }

      console.log('Completing step for assignment:', assignment);

      // Update assignment status to completed
      const updateData = {
        status: 'completed',
        completed_at: new Date().toISOString(),
        notes: completionNotes || assignment.notes
      };

      const { error: updateError } = await supabase
        .from('workflow_step_assignments')
        .update(updateData)
        .eq('id', assignmentId);

      if (updateError) throw updateError;

      // Call the edge function to advance the workflow if there's an active instance
      if (assignment.workflow_instance) {
        const { data: functionData, error: functionError } = await supabase.functions.invoke('advance-workflow', {
          body: {
            workflowId: assignment.workflow_steps.workflow_id,
            completedStepId: assignment.workflow_step_id,
            completedBy: user?.id,
            completionNotes: completionNotes
          }
        });

        if (functionError) {
          console.error('Error advancing workflow:', functionError);
          toast({
            title: "Step Completed",
            description: "Step completed but workflow advancement may have failed. Check with administrator.",
            variant: "destructive",
          });
        } else {
          console.log('Workflow advancement result:', functionData);
          toast({
            title: "Step Completed",
            description: "Step completed successfully and workflow has been advanced.",
          });
        }
      } else {
        toast({
          title: "Step Completed", 
          description: "Step completed successfully.",
        });
      }

      // Update local state
      setAssignments(prev => 
        prev.map(a => 
          a.id === assignmentId 
            ? { ...a, ...updateData, status: 'completed' as AssignmentStatus }
            : a
        )
      );

      // Refresh assignments to get any new ones
      setTimeout(() => {
        fetchAssignments();
      }, 1000);

    } catch (error) {
      console.error('Error completing step:', error);
      toast({
        title: "Error",
        description: "Failed to complete step. Please try again.",
        variant: "destructive",
      });
    }
  }, [assignments, user?.id, toast, fetchAssignments]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  return {
    assignments,
    isLoading,
    updateAssignmentStatus,
    completeStep,
    refetch: fetchAssignments
  };
}
