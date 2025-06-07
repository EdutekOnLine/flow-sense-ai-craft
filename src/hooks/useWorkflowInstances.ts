
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

export function useWorkflowInstances() {
  const { user } = useAuth();
  const [instances, setInstances] = useState<WorkflowInstance[]>([]);
  const [startableWorkflows, setStartableWorkflows] = useState<StartableWorkflow[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchWorkflowInstances = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('workflow_instances')
        .select('*')
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

  const fetchStartableWorkflows = useCallback(async () => {
    if (!user) return;

    try {
      // Get workflows that are marked as reusable
      const { data: workflows, error: workflowsError } = await supabase
        .from('workflows')
        .select(`
          id,
          name,
          description,
          is_reusable,
          workflow_steps (
            id,
            name,
            description,
            step_order,
            metadata
          )
        `)
        .eq('is_reusable', true)
        .order('created_at', { ascending: false });

      if (workflowsError) throw workflowsError;

      // Convert to startable workflows format
      const startable = (workflows || []).map(workflow => {
        const firstStep = workflow.workflow_steps?.[0];
        return {
          id: workflow.id,
          name: workflow.name,
          description: workflow.description,
          is_reusable: workflow.is_reusable,
          start_step: {
            id: firstStep?.id || 'start',
            name: firstStep?.name || 'Start Step',
            description: firstStep?.description || '',
            metadata: firstStep?.metadata || {}
          }
        };
      });

      setStartableWorkflows(startable);
    } catch (error) {
      console.error('Error fetching startable workflows:', error);
    }
  }, [user]);

  const createWorkflowFromSavedWorkflow = async (savedWorkflowId: string) => {
    // Get the saved workflow data
    const { data: savedWorkflow, error: savedError } = await supabase
      .from('saved_workflows')
      .select('*')
      .eq('id', savedWorkflowId)
      .single();

    if (savedError) throw savedError;

    // Create a new workflow
    const { data: newWorkflow, error: workflowError } = await supabase
      .from('workflows')
      .insert({
        name: savedWorkflow.name,
        description: savedWorkflow.description,
        status: 'active',
        created_by: user?.id,
        is_reusable: true
      })
      .select()
      .single();

    if (workflowError) throw workflowError;

    // Create workflow steps from the saved workflow nodes
    // Ensure nodes is an array before filtering
    const nodes = Array.isArray(savedWorkflow.nodes) ? savedWorkflow.nodes : [];
    const steps = nodes
      .filter((node: any) => node?.data?.stepType !== 'trigger') // Skip trigger nodes
      .sort((a: any, b: any) => (a.position?.y || 0) - (b.position?.y || 0)) // Sort by Y position
      .map((node: any, index: number) => ({
        workflow_id: newWorkflow.id,
        name: node.data?.label || `Step ${index + 1}`,
        description: node.data?.description || '',
        step_order: index + 1,
        assigned_to: node.data?.assignedTo || null,
        status: 'pending' as const, // Use 'as const' to ensure TypeScript treats this as the literal type
        metadata: node.data?.metadata || {}
      }));

    if (steps.length > 0) {
      const { error: stepsError } = await supabase
        .from('workflow_steps')
        .insert(steps);

      if (stepsError) throw stepsError;
    }

    return newWorkflow.id;
  };

  const startWorkflow = useCallback(async (workflowId: string, startData: any = {}) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      let actualWorkflowId = workflowId;

      // Check if this is a saved workflow (not a regular workflow)
      const { data: savedWorkflow } = await supabase
        .from('saved_workflows')
        .select('id')
        .eq('id', workflowId)
        .single();

      if (savedWorkflow) {
        // This is a saved workflow, create a real workflow from it
        console.log('Converting saved workflow to actual workflow');
        actualWorkflowId = await createWorkflowFromSavedWorkflow(workflowId);
      }

      // Get the first step of the workflow
      const { data: firstStep, error: stepError } = await supabase
        .from('workflow_steps')
        .select('id')
        .eq('workflow_id', actualWorkflowId)
        .order('step_order', { ascending: true })
        .limit(1)
        .single();

      if (stepError && stepError.code !== 'PGRST116') {
        throw stepError;
      }

      // Create workflow instance
      const { data: instance, error: instanceError } = await supabase
        .from('workflow_instances')
        .insert({
          workflow_id: actualWorkflowId,
          started_by: user.id,
          current_step_id: firstStep?.id || null,
          start_data: startData,
          status: 'active'
        })
        .select()
        .single();

      if (instanceError) {
        console.error('Error creating workflow instance:', instanceError);
        throw instanceError;
      }

      // Create assignments for all workflow steps that have assigned users
      const { data: steps, error: stepsError } = await supabase
        .from('workflow_steps')
        .select('id, assigned_to, name')
        .eq('workflow_id', actualWorkflowId)
        .not('assigned_to', 'is', null);

      if (stepsError) {
        console.error('Error fetching workflow steps:', stepsError);
      } else if (steps && steps.length > 0) {
        const assignments = steps.map(step => ({
          workflow_step_id: step.id,
          assigned_to: step.assigned_to,
          assigned_by: user.id,
          status: 'pending',
          notes: `Assignment for workflow step: ${step.name}`
        }));

        const { error: assignmentError } = await supabase
          .from('workflow_step_assignments')
          .insert(assignments);

        if (assignmentError) {
          console.error('Error creating assignments:', assignmentError);
        } else {
          console.log(`Created ${assignments.length} assignments for workflow steps`);
        }
      }

      // Refresh the instances
      await fetchWorkflowInstances();
      
      return instance;
    } catch (error) {
      console.error('Error starting workflow:', error);
      throw error;
    }
  }, [user, fetchWorkflowInstances]);

  const refreshWorkflows = useCallback(async () => {
    await Promise.all([
      fetchWorkflowInstances(),
      fetchStartableWorkflows()
    ]);
  }, [fetchWorkflowInstances, fetchStartableWorkflows]);

  useEffect(() => {
    refreshWorkflows();
  }, [refreshWorkflows]);

  return {
    instances,
    startableWorkflows,
    isLoading,
    startWorkflow,
    refreshWorkflows
  };
}
