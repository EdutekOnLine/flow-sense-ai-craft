
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Node, Edge, Viewport } from '@xyflow/react';
import { Json } from '@/integrations/supabase/types';

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

      // Transform the database data to match our SavedWorkflow interface
      const transformedWorkflows: SavedWorkflow[] = (data || []).map(workflow => ({
        id: workflow.id,
        name: workflow.name,
        description: workflow.description,
        nodes: Array.isArray(workflow.nodes) ? workflow.nodes as unknown as Node[] : [],
        edges: Array.isArray(workflow.edges) ? workflow.edges as unknown as Edge[] : [],
        viewport: (workflow.viewport as unknown as Viewport) || { x: 0, y: 0, zoom: 1 },
        created_by: workflow.created_by,
        created_at: workflow.created_at,
        updated_at: workflow.updated_at,
      }));

      setWorkflows(transformedWorkflows);
      console.log('Fetched workflows:', transformedWorkflows);
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

  const createWorkflowStepsOptimized = useCallback(async (workflowId: string, nodes: Node[]) => {
    if (!user) return;

    try {
      console.log('Creating workflow steps for workflow:', workflowId);
      
      // Ensure workflow record exists (upsert)
      const { error: workflowUpsertError } = await supabase
        .from('workflows')
        .upsert({
          id: workflowId,
          name: 'Generated from Saved Workflow',
          description: 'Auto-generated workflow from saved workflow',
          created_by: user.id,
          status: 'draft'
        }, { onConflict: 'id' });

      if (workflowUpsertError) {
        console.error('Error upserting workflow:', workflowUpsertError);
        return;
      }

      // Delete existing workflow steps in batch
      const { error: deleteError } = await supabase
        .from('workflow_steps')
        .delete()
        .eq('workflow_id', workflowId);

      if (deleteError) {
        console.error('Error deleting existing steps:', deleteError);
      }

      // Create workflow steps from nodes in batch
      if (nodes.length > 0) {
        const stepsToCreate = nodes.map((node, index) => ({
          workflow_id: workflowId,
          name: String(node.data?.label || `Step ${index + 1}`),
          description: String(node.data?.description || ''),
          step_order: index + 1,
          assigned_to: node.data?.assignedTo ? String(node.data.assignedTo) : null,
          estimated_hours: node.data?.estimatedHours ? Number(node.data.estimatedHours) : null,
          status: 'pending' as const,
          metadata: {
            node_id: node.id,
            step_type: String(node.data?.stepType || 'task'),
            position: node.position
          }
        }));

        const { data: createdSteps, error: createError } = await supabase
          .from('workflow_steps')
          .insert(stepsToCreate)
          .select();

        if (createError) {
          console.error('Error creating workflow steps:', createError);
          return;
        }

        // Create assignments in batch for assigned nodes
        const assignedNodes = nodes.filter(node => 
          node.data?.assignedTo && 
          node.data.assignedTo !== null &&
          node.data.assignedTo !== ''
        );

        if (assignedNodes.length > 0 && createdSteps) {
          const assignmentsToCreate = createdSteps
            .filter(step => {
              const correspondingNode = assignedNodes.find(node => 
                String(node.data?.label || '') === step.name
              );
              return correspondingNode && step.assigned_to;
            })
            .map(step => ({
              workflow_step_id: step.id,
              assigned_to: step.assigned_to!,
              assigned_by: user.id,
              status: 'pending' as const,
              notes: `Auto-created assignment for step: ${step.name}`
            }));

          if (assignmentsToCreate.length > 0) {
            const { error: assignmentError } = await supabase
              .from('workflow_step_assignments')
              .insert(assignmentsToCreate);

            if (assignmentError) {
              console.error('Error creating assignments:', assignmentError);
            } else {
              console.log('Created assignments:', assignmentsToCreate.length);
            }
          }
        }

        console.log('Created workflow steps:', createdSteps.length);
      }

    } catch (error) {
      console.error('Error creating workflow steps:', error);
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
          nodes: nodes as unknown as Json,
          edges: edges as unknown as Json,
          viewport: viewport as unknown as Json,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      console.log('Saved workflow successfully:', data);

      // Transform the response data
      const savedWorkflow: SavedWorkflow = {
        id: data.id,
        name: data.name,
        description: data.description,
        nodes: Array.isArray(data.nodes) ? data.nodes as unknown as Node[] : [],
        edges: Array.isArray(data.edges) ? data.edges as unknown as Edge[] : [],
        viewport: (data.viewport as unknown as Viewport) || { x: 0, y: 0, zoom: 1 },
        created_by: data.created_by,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      // Create workflow steps and assignments in one optimized operation
      await createWorkflowStepsOptimized(data.id, nodes);

      // Refresh the workflows list
      await fetchWorkflows();

      return savedWorkflow;
    } catch (error) {
      console.error('Error saving workflow:', error);
      throw error;
    }
  }, [user, fetchWorkflows, createWorkflowStepsOptimized]);

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
          nodes: nodes as unknown as Json,
          edges: edges as unknown as Json,
          viewport: viewport as unknown as Json,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      console.log('Updated workflow successfully:', data);

      // Update workflow steps and assignments in one optimized operation
      await createWorkflowStepsOptimized(id, nodes);

      // Refresh the workflows list
      await fetchWorkflows();

      return data;
    } catch (error) {
      console.error('Error updating workflow:', error);
      throw error;
    }
  }, [user, fetchWorkflows, createWorkflowStepsOptimized]);

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
