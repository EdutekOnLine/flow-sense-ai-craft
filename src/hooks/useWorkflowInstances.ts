
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface WorkflowInstance {
  id: string;
  workflow_id: string;
  started_by: string;
  current_step_id: string | null;
  status: 'active' | 'completed' | 'cancelled' | 'paused';
  start_data: any;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  workflows: {
    name: string;
    description: string | null;
    is_reusable: boolean;
  };
  workflow_steps: {
    name: string;
    description: string | null;
  } | null;
}

export interface StartableWorkflow {
  id: string;
  name: string;
  description: string | null;
  is_reusable: boolean;
  start_step: {
    id: string;
    name: string;
    description: string | null;
    metadata: any;
  };
}

export function useWorkflowInstances() {
  const [instances, setInstances] = useState<WorkflowInstance[]>([]);
  const [startableWorkflows, setStartableWorkflows] = useState<StartableWorkflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchInstances = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('workflow_instances')
        .select(`
          *,
          workflows!inner(name, description, is_reusable),
          workflow_steps(name, description)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type assertion to ensure proper typing
      const typedData = (data || []).map(item => ({
        ...item,
        status: item.status as 'active' | 'completed' | 'cancelled' | 'paused'
      })) as WorkflowInstance[];
      
      setInstances(typedData);
    } catch (error) {
      console.error('Error fetching workflow instances:', error);
    }
  };

  const fetchStartableWorkflows = async () => {
    if (!user) return;

    console.log('Fetching startable workflows for user:', user.id);

    try {
      const availableWorkflows: StartableWorkflow[] = [];

      // First, get reusable workflow definitions
      const { data: reusableWorkflowDefs, error: reusableError } = await supabase
        .from('workflow_definitions')
        .select(`
          id,
          name,
          description,
          is_reusable
        `)
        .eq('is_reusable', true);

      if (reusableError) {
        console.error('Error fetching reusable workflow definitions:', reusableError);
      } else {
        console.log('Found reusable workflow definitions:', reusableWorkflowDefs?.length);

        // For each reusable workflow definition, check if there's a corresponding active workflow
        // that the user can start (i.e., they're assigned to the first step)
        for (const workflowDef of reusableWorkflowDefs || []) {
          const { data: correspondingWorkflows, error: correspondingError } = await supabase
            .from('workflows')
            .select(`
              id,
              workflow_steps!inner(
                id,
                name,
                description,
                metadata,
                step_order,
                workflow_step_assignments!inner(assigned_to)
              )
            `)
            .eq('workflow_steps.step_order', 1)
            .eq('workflow_steps.workflow_step_assignments.assigned_to', user.id)
            .eq('status', 'active');

          if (!correspondingError && correspondingWorkflows && correspondingWorkflows.length > 0) {
            console.log(`Found ${correspondingWorkflows.length} corresponding workflows for definition ${workflowDef.name}`);
            
            // Add each corresponding workflow as startable
            for (const workflow of correspondingWorkflows) {
              availableWorkflows.push({
                id: workflowDef.id, // Use the workflow definition ID
                name: workflowDef.name,
                description: workflowDef.description,
                is_reusable: workflowDef.is_reusable,
                start_step: {
                  id: workflow.workflow_steps[0].id,
                  name: workflow.workflow_steps[0].name,
                  description: workflow.workflow_steps[0].description,
                  metadata: workflow.workflow_steps[0].metadata,
                }
              });
            }
          }
        }
      }

      // Then get non-reusable workflows where user is assigned to first step
      const { data: nonReusableWorkflows, error: nonReusableError } = await supabase
        .from('workflows')
        .select(`
          id,
          name,
          description,
          is_reusable,
          workflow_steps!inner(
            id,
            name,
            description,
            metadata,
            step_order,
            workflow_step_assignments!inner(assigned_to)
          )
        `)
        .eq('workflow_steps.step_order', 1)
        .eq('workflow_steps.workflow_step_assignments.assigned_to', user.id)
        .eq('status', 'active')
        .eq('is_reusable', false);

      if (nonReusableError) {
        console.error('Error fetching non-reusable workflows:', nonReusableError);
      } else {
        console.log('Found non-reusable workflows:', nonReusableWorkflows?.length);

        // Check which non-reusable workflows haven't been started yet
        for (const workflow of nonReusableWorkflows || []) {
          const { data: existingInstance } = await supabase
            .from('workflow_instances')
            .select('id')
            .eq('workflow_id', workflow.id)
            .limit(1);

          // Only include if no instance exists yet
          if (!existingInstance || existingInstance.length === 0) {
            availableWorkflows.push({
              id: workflow.id,
              name: workflow.name,
              description: workflow.description,
              is_reusable: workflow.is_reusable,
              start_step: {
                id: workflow.workflow_steps[0].id,
                name: workflow.workflow_steps[0].name,
                description: workflow.workflow_steps[0].description,
                metadata: workflow.workflow_steps[0].metadata,
              }
            });
          }
        }
      }

      console.log('Total startable workflows found:', availableWorkflows.length);
      setStartableWorkflows(availableWorkflows);
    } catch (error) {
      console.error('Error fetching startable workflows:', error);
    }
  };

  const startWorkflow = async (workflowId: string, startData: any = {}) => {
    if (!user) return null;

    try {
      console.log('Starting workflow:', workflowId);

      // For reusable workflows, we need to find the actual workflow ID to start
      // (not the workflow definition ID)
      let actualWorkflowId = workflowId;

      // Check if this is a reusable workflow definition
      const { data: workflowDef, error: defError } = await supabase
        .from('workflow_definitions')
        .select('id, is_reusable')
        .eq('id', workflowId)
        .eq('is_reusable', true)
        .maybeSingle();

      if (!defError && workflowDef) {
        // This is a reusable workflow definition, find a corresponding workflow
        const { data: correspondingWorkflow, error: correspondingError } = await supabase
          .from('workflows')
          .select(`
            id,
            workflow_steps!inner(
              id,
              step_order,
              workflow_step_assignments!inner(assigned_to)
            )
          `)
          .eq('workflow_steps.step_order', 1)
          .eq('workflow_steps.workflow_step_assignments.assigned_to', user.id)
          .eq('status', 'active')
          .limit(1)
          .maybeSingle();

        if (correspondingError || !correspondingWorkflow) {
          throw new Error('No corresponding workflow found that you can start');
        }

        actualWorkflowId = correspondingWorkflow.id;
      }

      // Get the first step of the actual workflow
      const { data: firstStep, error: stepError } = await supabase
        .from('workflow_steps')
        .select('id')
        .eq('workflow_id', actualWorkflowId)
        .eq('step_order', 1)
        .single();

      if (stepError) throw stepError;

      // Create the workflow instance
      const { data, error } = await supabase
        .from('workflow_instances')
        .insert({
          workflow_id: actualWorkflowId,
          started_by: user.id,
          current_step_id: firstStep.id,
          start_data: startData,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      console.log('Workflow instance created:', data);

      // Refresh the instances list
      await fetchInstances();
      await fetchStartableWorkflows();

      return data;
    } catch (error) {
      console.error('Error starting workflow:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      Promise.all([fetchInstances(), fetchStartableWorkflows()]).finally(() => {
        setIsLoading(false);
      });
    }
  }, [user]);

  return {
    instances,
    startableWorkflows,
    isLoading,
    startWorkflow,
    refetch: () => Promise.all([fetchInstances(), fetchStartableWorkflows()])
  };
}
