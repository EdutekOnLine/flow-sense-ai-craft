
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Node, Edge, Viewport } from '@xyflow/react';

export interface SavedWorkflow {
  id: string;
  name: string;
  description: string | null;
  nodes: Node[];
  edges: Edge[];
  viewport: Viewport;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export function useSavedWorkflows() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [workflows, setWorkflows] = useState<SavedWorkflow[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchWorkflows = useCallback(async () => {
    if (!user) {
      console.log('No user found, skipping workflow fetch');
      return;
    }

    console.log('Fetching workflows for user:', user.id);
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('saved_workflows')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setWorkflows(data || []);
      console.log('Fetched workflows:', data);
    } catch (error) {
      console.error('Error fetching workflows:', error);
      toast({
        title: "Error",
        description: "Failed to load saved workflows",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  const createWorkflowStepAssignments = useCallback(async (workflowId: string, nodes: Node[]) => {
    if (!user) return;

    try {
      console.log('Creating step assignments for workflow:', workflowId);
      
      // Find nodes that have assigned users
      const assignedNodes = nodes.filter(node => 
        node.data?.assignedTo && 
        node.data.assignedTo !== null &&
        node.data.assignedTo !== ''
      );

      console.log('Nodes with assignments:', assignedNodes);

      if (assignedNodes.length === 0) {
        console.log('No assigned nodes found');
        return;
      }

      // For each assigned node, we need to find the corresponding workflow step and create an assignment
      for (const node of assignedNodes) {
        const assignedUserId = node.data.assignedTo;
        
        // Find workflow step by looking for a step with matching metadata
        const { data: existingSteps, error: stepsError } = await supabase
          .from('workflow_steps')
          .select('id, assigned_to')
          .eq('workflow_id', workflowId)
          .eq('name', node.data.label);

        if (stepsError) {
          console.error('Error finding workflow step:', stepsError);
          continue;
        }

        for (const step of existingSteps || []) {
          // Check if assignment already exists
          const { data: existingAssignment, error: assignmentCheckError } = await supabase
            .from('workflow_step_assignments')
            .select('id')
            .eq('workflow_step_id', step.id)
            .single();

          if (assignmentCheckError && assignmentCheckError.code !== 'PGRST116') {
            console.error('Error checking existing assignment:', assignmentCheckError);
            continue;
          }

          if (!existingAssignment) {
            // Create new assignment
            const { error: createError } = await supabase
              .from('workflow_step_assignments')
              .insert({
                workflow_step_id: step.id,
                assigned_to: assignedUserId,
                assigned_by: user.id,
                status: 'pending',
                notes: `Auto-created assignment for step: ${node.data.label}`
              });

            if (createError) {
              console.error('Error creating assignment:', createError);
            } else {
              console.log('Created assignment for step:', step.id, 'to user:', assignedUserId);
            }
          }
        }
      }

    } catch (error) {
      console.error('Error creating workflow step assignments:', error);
    }
  }, [user]);

  const saveWorkflow = useCallback(async (
    name: string,
    description: string,
    nodes: Node[],
    edges: Edge[],
    viewport: Viewport
  ): Promise<SavedWorkflow> => {
    if (!user) {
      throw new Error('User must be authenticated to save workflows');
    }

    console.log('Saving workflow with nodes:', nodes);
    console.log('Assigned nodes:', nodes.filter(n => n.data?.assignedTo));

    try {
      const { data, error } = await supabase
        .from('saved_workflows')
        .insert({
          name,
          description,
          nodes,
          edges,
          viewport,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      console.log('Saved workflow successfully:', data);

      // Create workflow step assignments for assigned nodes
      await createWorkflowStepAssignments(data.id, nodes);

      // Refresh the workflows list
      await fetchWorkflows();

      return data;
    } catch (error) {
      console.error('Error saving workflow:', error);
      throw error;
    }
  }, [user, fetchWorkflows, createWorkflowStepAssignments]);

  const updateWorkflow = useCallback(async (
    id: string,
    name: string,
    description: string,
    nodes: Node[],
    edges: Edge[],
    viewport: Viewport
  ) => {
    if (!user) {
      throw new Error('User must be authenticated to update workflows');
    }

    console.log('Updating workflow with nodes:', nodes);

    try {
      const { data, error } = await supabase
        .from('saved_workflows')
        .update({
          name,
          description,
          nodes,
          edges,
          viewport,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      console.log('Updated workflow successfully:', data);

      // Update workflow step assignments for assigned nodes
      await createWorkflowStepAssignments(id, nodes);

      // Refresh the workflows list
      await fetchWorkflows();

      return data;
    } catch (error) {
      console.error('Error updating workflow:', error);
      throw error;
    }
  }, [user, fetchWorkflows, createWorkflowStepAssignments]);

  const deleteWorkflow = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('saved_workflows')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Refresh the workflows list
      await fetchWorkflows();

      toast({
        title: "Workflow Deleted",
        description: "The workflow has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting workflow:', error);
      toast({
        title: "Error",
        description: "Failed to delete workflow",
        variant: "destructive",
      });
    }
  }, [fetchWorkflows, toast]);

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  return {
    workflows,
    isLoading,
    saveWorkflow,
    updateWorkflow,
    deleteWorkflow,
    refetch: fetchWorkflows,
  };
}
