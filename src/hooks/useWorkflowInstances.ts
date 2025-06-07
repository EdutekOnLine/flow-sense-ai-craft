
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

    // Create a new workflow instance directly - no complex workflow steps needed
    const { data: newWorkflowInstance, error: instanceError } = await supabase
      .from('workflow_instances')
      .insert({
        workflow_id: savedWorkflowId, // Use the saved workflow ID directly
        started_by: user?.id,
        current_step_id: null, // No step progression needed
        start_data: {},
        status: 'active'
      })
      .select()
      .single();

    if (instanceError) {
      console.error('Error creating workflow instance:', instanceError);
      throw instanceError;
    }

    console.log('Created workflow instance:', newWorkflowInstance);
    return newWorkflowInstance.id;
  };

  const startWorkflow = useCallback(async (workflowId: string, startData: any = {}) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    console.log('Starting workflow:', workflowId);

    try {
      // Create workflow instance from saved workflow
      console.log('Converting saved workflow to workflow instance');
      const instanceId = await createWorkflowFromSavedWorkflow(workflowId);
      console.log('Created workflow instance with ID:', instanceId);

      // Refresh the instances
      await fetchWorkflowInstances();
      
      toast.success(`Workflow started successfully!`);
      
      return { id: instanceId };
    } catch (error) {
      console.error('Error starting workflow:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to start workflow. Please try again.');
      throw error;
    }
  }, [user, fetchWorkflowInstances]);

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
    refreshWorkflows
  };
}
