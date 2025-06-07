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

    try {
      // First, get reusable workflows from workflow_definitions where user is assigned to first step
      const { data: reusableWorkflows, error: reusableError } = await supabase
        .from('workflow_definitions')
        .select(`
          id,
          name,
          description,
          is_reusable,
          nodes
        `)
        .eq('is_reusable', true);

      if (reusableError) throw reusableError;

      // Then get non-reusable workflows from workflows table where user is assigned to first step
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

      if (nonReusableError) throw nonReusableError;

      // Check which non-reusable workflows haven't been started yet
      const availableNonReusable = [];
      for (const workflow of nonReusableWorkflows || []) {
        const { data: existingInstance } = await supabase
          .from('workflow_instances')
          .select('id')
          .eq('workflow_id', workflow.id)
          .limit(1);

        // Only include if no instance exists yet
        if (!existingInstance || existingInstance.length === 0) {
          availableNonReusable.push({
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

      // For reusable workflows, we need to check if user can start them
      const availableReusable = [];
      for (const workflowDef of reusableWorkflows || []) {
        // Check if there's a corresponding workflow in workflows table that user can start
        const { data: correspondingWorkflow, error: correspondingError } = await supabase
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
          .eq('status', 'active')
          .limit(1);

        if (!correspondingError && correspondingWorkflow && correspondingWorkflow.length > 0) {
          availableReusable.push({
            id: workflowDef.id,
            name: workflowDef.name,
            description: workflowDef.description,
            is_reusable: workflowDef.is_reusable,
            start_step: {
              id: correspondingWorkflow[0].workflow_steps[0].id,
              name: correspondingWorkflow[0].workflow_steps[0].name,
              description: correspondingWorkflow[0].workflow_steps[0].description,
              metadata: correspondingWorkflow[0].workflow_steps[0].metadata,
            }
          });
        }
      }

      setStartableWorkflows([...availableReusable, ...availableNonReusable]);
    } catch (error) {
      console.error('Error fetching startable workflows:', error);
    }
  };

  const startWorkflow = async (workflowId: string, startData: any = {}) => {
    if (!user) return null;

    try {
      // Get the first step of the workflow
      const { data: firstStep, error: stepError } = await supabase
        .from('workflow_steps')
        .select('id')
        .eq('workflow_id', workflowId)
        .eq('step_order', 1)
        .single();

      if (stepError) throw stepError;

      // Create the workflow instance
      const { data, error } = await supabase
        .from('workflow_instances')
        .insert({
          workflow_id: workflowId,
          started_by: user.id,
          current_step_id: firstStep.id,
          start_data: startData,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

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
