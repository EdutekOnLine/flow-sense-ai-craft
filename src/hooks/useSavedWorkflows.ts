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

  const createWorkflowSteps = useCallback(async (workflowId: string, nodes: Node[]) => {
    if (!user) return;

    try {
      console.log('Creating workflow steps for workflow:', workflowId);
      
      // First, check if there's a workflow record in the workflows table
      const { data: existingWorkflow, error: workflowCheckError } = await supabase
        .from('workflows')
        .select('id')
        .eq('id', workflowId)
        .single();

      // If no workflow exists, create one
      if (workflowCheckError && workflowCheckError.code === 'PGRST116') {
        console.log('Creating workflow record...');
        const { error: workflowCreateError } = await supabase
          .from('workflows')
          .insert({
            id: workflowId,
            name: 'Generated from Saved Workflow',
            description: 'Auto-generated workflow from saved workflow',
            created_by: user.id,
            status: 'draft'
          });

        if (workflowCreateError) {
          console.error('Error creating workflow:', workflowCreateError);
          return;
        }
      }

      // Delete existing workflow steps for this workflow to avoid duplicates
      const { error: deleteError } = await supabase
        .from('workflow_steps')
        .delete()
        .eq('workflow_id', workflowId);

      if (deleteError) {
        console.error('Error deleting existing steps:', deleteError);
      }

      // Create workflow steps from nodes
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

      if (stepsToCreate.length > 0) {
        const { data: createdSteps, error: createError } = await supabase
          .from('workflow_steps')
          .insert(stepsToCreate)
          .select();

        if (createError) {
          console.error('Error creating workflow steps:', createError);
        } else {
          console.log('Created workflow steps:', createdSteps);
        }
      }

    } catch (error) {
      console.error('Error creating workflow steps:', error);
    }
  }, [user]);

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
        const assignedUserId = String(node.data.assignedTo);
        
        // Find workflow step by looking for a step with matching metadata
        const { data: existingSteps, error: stepsError } = await supabase
          .from('workflow_steps')
          .select('id, assigned_to')
          .eq('workflow_id', workflowId)
          .eq('name', String(node.data.label || ''));

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
                notes: `Auto-created assignment for step: ${String(node.data.label || '')}`
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

      // Create workflow steps from nodes
      await createWorkflowSteps(data.id, nodes);

      // Create workflow step assignments for assigned nodes
      await createWorkflowStepAssignments(data.id, nodes);

      // Refresh the workflows list
      await fetchWorkflows();

      return savedWorkflow;
    } catch (error) {
      console.error('Error saving workflow:', error);
      throw error;
    }
  }, [user, fetchWorkflows, createWorkflowSteps, createWorkflowStepAssignments]);

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

      // Update workflow steps from nodes
      await createWorkflowSteps(id, nodes);

      // Update workflow step assignments for assigned nodes
      await createWorkflowStepAssignments(id, nodes);

      // Refresh the workflows list
      await fetchWorkflows();

      return data;
    } catch (error) {
      console.error('Error updating workflow:', error);
      throw error;
    }
  }, [user, fetchWorkflows, createWorkflowSteps, createWorkflowStepAssignments]);

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
