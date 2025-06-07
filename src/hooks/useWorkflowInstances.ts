
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
      // Get reusable workflows where the user is assigned to the first step
      const { data: workflows, error: workflowsError } = await supabase
        .from('workflows')
        .select(`
          id,
          name,
          description,
          is_reusable,
          workflow_steps!inner (
            id,
            name,
            description,
            step_order,
            assigned_to,
            metadata
          )
        `)
        .eq('is_reusable', true)
        .eq('workflow_steps.step_order', 1)
        .eq('workflow_steps.assigned_to', user.id)
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
    console.log('Creating workflow from saved workflow:', savedWorkflowId);
    
    // Get the saved workflow data
    const { data: savedWorkflow, error: savedError } = await supabase
      .from('saved_workflows')
      .select('*')
      .eq('id', savedWorkflowId)
      .single();

    if (savedError) {
      console.error('Error fetching saved workflow:', savedError);
      throw savedError;
    }

    console.log('Found saved workflow:', savedWorkflow);

    // Create a new workflow
    const { data: newWorkflow, error: workflowError } = await supabase
      .from('workflows')
      .insert({
        name: savedWorkflow.name,
        description: savedWorkflow.description,
        status: 'active',
        created_by: user?.id,
        is_reusable: false // Set to false for one-time execution from saved workflow
      })
      .select()
      .single();

    if (workflowError) {
      console.error('Error creating new workflow:', workflowError);
      throw workflowError;
    }

    console.log('Created new workflow:', newWorkflow);

    // Create workflow steps from the saved workflow nodes
    const nodes = Array.isArray(savedWorkflow.nodes) ? savedWorkflow.nodes : [];
    const workflowSteps = nodes
      .filter((node: any) => node?.data?.stepType !== 'trigger')
      .sort((a: any, b: any) => (a.position?.y || 0) - (b.position?.y || 0))
      .map((node: any, index: number) => ({
        workflow_id: newWorkflow.id,
        name: node.data?.label || `Step ${index + 1}`,
        description: node.data?.description || '',
        step_order: index + 1,
        assigned_to: node.data?.assignedTo || null,
        status: index === 0 ? 'pending' : 'pending',
        metadata: node.data?.metadata || {}
      }));

    console.log('Creating workflow steps:', workflowSteps);

    if (workflowSteps.length > 0) {
      const { data: createdSteps, error: stepsError } = await supabase
        .from('workflow_steps')
        .insert(workflowSteps)
        .select();

      if (stepsError) {
        console.error('Error creating workflow steps:', stepsError);
        throw stepsError;
      }

      console.log('Created workflow steps:', createdSteps);

      // Create assignment for the first step only
      const firstStep = createdSteps?.[0];
      if (firstStep && firstStep.assigned_to) {
        const { error: assignmentError } = await supabase
          .from('workflow_step_assignments')
          .insert({
            workflow_step_id: firstStep.id,
            assigned_to: firstStep.assigned_to,
            assigned_by: user?.id,
            status: 'pending',
            notes: `Assignment for workflow step: ${firstStep.name}`
          });

        if (assignmentError) {
          console.error('Error creating assignment:', assignmentError);
        } else {
          console.log('Created assignment for first step');
        }
      }
    }

    return newWorkflow.id;
  };

  const startWorkflow = useCallback(async (workflowId: string, startData: any = {}) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    console.log('Starting workflow:', workflowId);

    try {
      let actualWorkflowId = workflowId;

      // Check if this is a saved workflow
      const { data: savedWorkflow } = await supabase
        .from('saved_workflows')
        .select('id')
        .eq('id', workflowId)
        .single();

      if (savedWorkflow) {
        // This is a saved workflow, create a real workflow from it
        console.log('Converting saved workflow to actual workflow');
        actualWorkflowId = await createWorkflowFromSavedWorkflow(workflowId);
        console.log('Created actual workflow with ID:', actualWorkflowId);
      }

      // Check if there's already an active instance for this workflow (for non-reusable workflows)
      const { data: existingInstance } = await supabase
        .from('workflow_instances')
        .select('id, status')
        .eq('workflow_id', actualWorkflowId)
        .eq('status', 'active')
        .single();

      if (existingInstance && !savedWorkflow) {
        throw new Error('This workflow already has an active instance');
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
        console.error('Error fetching first step:', stepError);
        throw stepError;
      }

      console.log('First step:', firstStep);

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

      console.log('Created workflow instance:', instance);

      // Refresh the instances
      await fetchWorkflowInstances();
      
      toast.success(`Workflow started successfully!`);
      
      return instance;
    } catch (error) {
      console.error('Error starting workflow:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to start workflow. Please try again.');
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
