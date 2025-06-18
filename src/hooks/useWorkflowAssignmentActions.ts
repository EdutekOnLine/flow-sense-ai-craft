
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { WorkflowAssignment, AssignmentStatus } from './useWorkflowAssignmentData';

interface UseWorkflowAssignmentActionsProps {
  assignments: WorkflowAssignment[];
  setAssignments: React.Dispatch<React.SetStateAction<WorkflowAssignment[]>>;
  fetchAssignments: () => Promise<void>;
}

export function useWorkflowAssignmentActions({
  assignments,
  setAssignments,
  fetchAssignments,
}: UseWorkflowAssignmentActionsProps) {
  const { user } = useAuth();
  const { toast } = useToast();

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
  }, [toast, setAssignments]);

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
  }, [assignments, user?.id, toast, fetchAssignments, setAssignments]);

  return {
    updateAssignmentStatus,
    completeStep,
  };
}
