
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
          workflows!inner(name, description),
          workflow_steps(name, description)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInstances(data || []);
    } catch (error) {
      console.error('Error fetching workflow instances:', error);
    }
  };

  const fetchStartableWorkflows = async () => {
    if (!user) return;

    try {
      // Get workflows where user is assigned to the first step (start step)
      const { data, error } = await supabase
        .from('workflows')
        .select(`
          id,
          name,
          description,
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

      if (error) throw error;

      const startableWorkflows = (data || []).map(workflow => ({
        id: workflow.id,
        name: workflow.name,
        description: workflow.description,
        start_step: {
          id: workflow.workflow_steps[0].id,
          name: workflow.workflow_steps[0].name,
          description: workflow.workflow_steps[0].description,
          metadata: workflow.workflow_steps[0].metadata,
        }
      }));

      setStartableWorkflows(startableWorkflows);
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
