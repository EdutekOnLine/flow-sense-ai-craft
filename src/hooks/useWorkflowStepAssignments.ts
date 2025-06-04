
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export function useWorkflowStepAssignments() {
  const { user } = useAuth();
  const { toast } = useToast();

  const createAssignmentsForWorkflow = useCallback(async (workflowId: string) => {
    if (!user) return;

    try {
      console.log('Creating assignments for workflow:', workflowId);

      // Get all workflow steps that have assigned_to but no corresponding assignment
      const { data: steps, error: stepsError } = await supabase
        .from('workflow_steps')
        .select(`
          id,
          assigned_to,
          name,
          description,
          workflow_id
        `)
        .eq('workflow_id', workflowId)
        .not('assigned_to', 'is', null);

      if (stepsError) {
        console.error('Error fetching workflow steps:', stepsError);
        throw stepsError;
      }

      console.log('Found workflow steps with assignments:', steps);

      if (!steps || steps.length === 0) {
        console.log('No assigned steps found for workflow');
        return;
      }

      // Check which steps already have assignments
      const stepIds = steps.map(step => step.id);
      const { data: existingAssignments, error: assignmentsError } = await supabase
        .from('workflow_step_assignments')
        .select('workflow_step_id')
        .in('workflow_step_id', stepIds);

      if (assignmentsError) {
        console.error('Error checking existing assignments:', assignmentsError);
        throw assignmentsError;
      }

      const existingStepIds = existingAssignments?.map(a => a.workflow_step_id) || [];
      const stepsNeedingAssignments = steps.filter(step => !existingStepIds.includes(step.id));

      console.log('Steps needing new assignments:', stepsNeedingAssignments);

      if (stepsNeedingAssignments.length === 0) {
        console.log('All steps already have assignments');
        return;
      }

      // Create assignments for steps that don't have them
      const assignmentsToCreate = stepsNeedingAssignments.map(step => ({
        workflow_step_id: step.id,
        assigned_to: step.assigned_to,
        assigned_by: user.id,
        status: 'pending',
        notes: `Auto-created assignment for step: ${step.name}`
      }));

      console.log('Creating assignments:', assignmentsToCreate);

      const { data: newAssignments, error: createError } = await supabase
        .from('workflow_step_assignments')
        .insert(assignmentsToCreate)
        .select();

      if (createError) {
        console.error('Error creating assignments:', createError);
        throw createError;
      }

      console.log('Successfully created assignments:', newAssignments);

      toast({
        title: "Assignments Created",
        description: `Created ${newAssignments?.length || 0} workflow step assignments.`,
      });

      return newAssignments;
    } catch (error) {
      console.error('Error in createAssignmentsForWorkflow:', error);
      toast({
        title: "Error",
        description: "Failed to create workflow step assignments.",
        variant: "destructive",
      });
      throw error;
    }
  }, [user, toast]);

  return {
    createAssignmentsForWorkflow
  };
}
