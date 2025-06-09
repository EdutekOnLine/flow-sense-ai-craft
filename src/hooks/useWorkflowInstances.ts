
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface StartableWorkflow {
  id: string;
  name: string;
  description?: string;
  is_reusable: boolean;
  start_step: {
    id: string;
    name: string;
    description?: string;
    metadata?: any;
  };
}

export interface WorkflowInstance {
  id: string;
  workflow_id: string;
  started_by: string;
  current_step_id: string | null;
  status: string;
  start_data?: any;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

// Type for workflow node from saved_workflows
interface WorkflowNode {
  id: string;
  data?: {
    assignedTo?: string;
    label?: string;
    description?: string;
    metadata?: any;
    stepType?: string;
  };
  position?: {
    x: number;
    y: number;
  };
}

export function useWorkflowInstances() {
  const { user } = useAuth();
  const [instances, setInstances] = useState<WorkflowInstance[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchWorkflowInstances = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      // Only fetch workflow instances that have valid saved workflows
      const { data, error } = await supabase
        .from('workflow_instances')
        .select(`
          *,
          saved_workflows!inner(id, name)
        `)
        .eq('started_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInstances(data || []);
    } catch (error) {
      console.error('Error fetching workflow instances:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const createWorkflowFromSavedWorkflow = async (savedWorkflowId: string) => {
    console.log('Creating workflow from saved workflow:', savedWorkflowId);
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    try {
      // Get the saved workflow data
      const { data: savedWorkflow, error: savedError } = await supabase
        .from('saved_workflows')
        .select('*')
        .eq('id', savedWorkflowId)
        .single();

      if (savedError) {
        console.error('Error fetching saved workflow:', savedError);
        throw new Error(`Failed to fetch saved workflow: ${savedError.message}`);
      }

      console.log('Found saved workflow:', savedWorkflow);

      if (!savedWorkflow) {
        throw new Error('Saved workflow not found');
      }

      // First, create a workflow entry in the workflows table
      const { data: newWorkflow, error: workflowError } = await supabase
        .from('workflows')
        .insert({
          name: savedWorkflow.name,
          description: savedWorkflow.description,
          created_by: user.id,
          status: 'active',
          is_reusable: savedWorkflow.is_reusable || false,
          metadata: {
            original_saved_workflow_id: savedWorkflowId,
            nodes: savedWorkflow.nodes,
            edges: savedWorkflow.edges,
            viewport: savedWorkflow.viewport
          }
        })
        .select()
        .single();

      if (workflowError) {
        console.error('Error creating workflow:', workflowError);
        throw new Error(`Failed to create workflow: ${workflowError.message}`);
      }

      console.log('Created workflow:', newWorkflow);

      // Safely handle the nodes data
      let nodes: WorkflowNode[] = [];
      if (savedWorkflow.nodes && Array.isArray(savedWorkflow.nodes)) {
        nodes = savedWorkflow.nodes as unknown as WorkflowNode[];
      }

      console.log('Parsed nodes:', nodes);

      // Create workflow steps for each node that has assigned users
      const workflowSteps = [];
      const nodeIdToStepIdMap: { [nodeId: string]: string } = {};
      let firstStepId = null;

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node?.data?.assignedTo) {
          console.log(`Creating workflow step for node ${node.id}:`, node);
          
          // CRITICAL FIX: Generate a proper UUID for the step and store original node ID in metadata
          const { data: newStep, error: stepError } = await supabase
            .from('workflow_steps')
            .insert({
              // Don't specify ID - let Supabase generate a proper UUID
              workflow_id: newWorkflow.id,
              name: node.data.label || `Step ${i + 1}`,
              description: node.data.description || '',
              assigned_to: node.data.assignedTo,
              step_order: i + 1,
              status: 'pending',
              metadata: {
                ...node.data.metadata,
                original_node_id: node.id, // Store the original node ID for reference
                node_position: node.position
              }
            })
            .select()
            .single();

          if (stepError) {
            console.error('Error creating workflow step:', stepError);
            throw new Error(`Failed to create workflow step: ${stepError.message}`);
          } else {
            console.log('Created workflow step:', newStep);
            workflowSteps.push(newStep);
            nodeIdToStepIdMap[node.id] = newStep.id;
            
            // Set the first step as the current step
            if (!firstStepId) {
              firstStepId = newStep.id;
            }
          }
        }
      }

      console.log('Created workflow steps:', workflowSteps);
      console.log('Node ID to Step ID mapping:', nodeIdToStepIdMap);
      console.log('First step ID:', firstStepId);

      // Create a new workflow instance with the first step as current
      const { data: newWorkflowInstance, error: instanceError } = await supabase
        .from('workflow_instances')
        .insert({
          workflow_id: savedWorkflowId, // Link to the saved workflow, not the transient workflow
          started_by: user.id,
          current_step_id: firstStepId,
          start_data: { 
            nodeIdToStepIdMap,
            transient_workflow_id: newWorkflow.id // Store reference to the transient workflow
          },
          status: 'active'
        })
        .select()
        .single();

      if (instanceError) {
        console.error('Error creating workflow instance:', instanceError);
        throw new Error(`Failed to create workflow instance: ${instanceError.message}`);
      }

      console.log('Created workflow instance:', newWorkflowInstance);

      // CRITICAL FIX: Create assignments for all workflow steps automatically
      console.log('Creating assignments for all workflow steps...');
      const assignmentPromises = workflowSteps.map(async (step) => {
        console.log('Creating assignment for step:', step.id, 'assigned to:', step.assigned_to);
        
        const { data: assignment, error: assignmentError } = await supabase
          .from('workflow_step_assignments')
          .insert({
            workflow_step_id: step.id,
            assigned_to: step.assigned_to,
            assigned_by: user.id,
            status: 'pending', // All start as pending - only current step will be actionable
            notes: `Auto-created assignment for step: ${step.name}`
          })
          .select()
          .single();

        if (assignmentError) {
          console.error('Error creating assignment for step:', step.id, assignmentError);
          throw assignmentError;
        } else {
          console.log('Successfully created assignment:', assignment);
          return assignment;
        }
      });

      // Wait for all assignments to be created
      const createdAssignments = await Promise.all(assignmentPromises);
      console.log('All assignments created successfully:', createdAssignments);

      return newWorkflowInstance.id;
    } catch (error) {
      console.error('Error in createWorkflowFromSavedWorkflow:', error);
      throw error;
    }
  };

  const startWorkflow = useCallback(async (workflowId: string, startData: any = {}) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    console.log('Starting workflow:', workflowId);

    try {
      // Create workflow instance from saved workflow and assign steps
      console.log('Converting saved workflow to workflow instance with step assignments');
      const instanceId = await createWorkflowFromSavedWorkflow(workflowId);
      console.log('Created workflow instance with ID:', instanceId);

      // Refresh the instances
      await fetchWorkflowInstances();
      
      toast.success(`Workflow started successfully! Tasks have been assigned to team members.`);
      
      return { id: instanceId };
    } catch (error) {
      console.error('Error starting workflow:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start workflow. Please try again.';
      toast.error(errorMessage);
      throw error;
    }
  }, [user, fetchWorkflowInstances]);

  const cancelWorkflowInstance = useCallback(async (instanceId: string) => {
    try {
      // Use direct database update instead of RPC function
      const { error } = await supabase
        .from('workflow_instances')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', instanceId)
        .eq('status', 'active'); // Only update if currently active

      if (error) throw error;

      await fetchWorkflowInstances();
      toast.success('Workflow cancelled successfully');
    } catch (error) {
      console.error('Error cancelling workflow instance:', error);
      toast.error('Failed to cancel workflow');
      throw error;
    }
  }, [fetchWorkflowInstances]);

  const completeWorkflowInstance = useCallback(async (instanceId: string) => {
    try {
      // Use direct database update instead of RPC function
      const { error } = await supabase
        .from('workflow_instances')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', instanceId)
        .eq('status', 'active'); // Only update if currently active

      if (error) throw error;

      await fetchWorkflowInstances();
      toast.success('Workflow completed successfully');
    } catch (error) {
      console.error('Error completing workflow instance:', error);
      toast.error('Failed to complete workflow');
      throw error;
    }
  }, [fetchWorkflowInstances]);

  const refreshWorkflows = useCallback(async () => {
    await fetchWorkflowInstances();
  }, [fetchWorkflowInstances]);

  useEffect(() => {
    refreshWorkflows();
  }, [refreshWorkflows]);

  return {
    instances,
    startableWorkflows: [], // No longer needed
    isLoading,
    startWorkflow,
    cancelWorkflowInstance,
    completeWorkflowInstance,
    refreshWorkflows
  };
}
