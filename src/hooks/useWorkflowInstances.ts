
import { useState, useEffect, useCallback } from 'react';
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

// Type guard to check if a value is a valid node object
const isValidNode = (node: any): node is { id: string; data: any; position?: any } => {
  return node && typeof node === 'object' && node.data && typeof node.data === 'object';
};

export function useWorkflowInstances() {
  const [instances, setInstances] = useState<WorkflowInstance[]>([]);
  const [startableWorkflows, setStartableWorkflows] = useState<StartableWorkflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchInstances = useCallback(async () => {
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

      if (error) {
        console.error('Error fetching workflow instances:', error);
        throw error;
      }
      
      const typedData = (data || []).map(item => ({
        ...item,
        status: item.status as 'active' | 'completed' | 'cancelled' | 'paused'
      })) as WorkflowInstance[];
      
      setInstances(typedData);
    } catch (error) {
      console.error('Error fetching workflow instances:', error);
    }
  }, [user]);

  const fetchStartableWorkflows = useCallback(async () => {
    if (!user) return;

    try {
      const availableWorkflows: StartableWorkflow[] = [];

      // Check saved workflows that are reusable - now works with RLS policies
      const { data: savedWorkflows, error: savedError } = await supabase
        .from('saved_workflows')
        .select('*')
        .eq('is_reusable', true);
      
      if (!savedError && savedWorkflows) {
        // For each reusable saved workflow, check if user is assigned to the first step
        for (const savedWorkflow of savedWorkflows) {
          const nodes = savedWorkflow.nodes;
          
          if (!Array.isArray(nodes)) {
            continue;
          }
          
          // Find the first step
          const firstNode = nodes.find((node: any) => {
            if (!isValidNode(node)) return false;
            return node.data && (
              node.data.stepType === 'trigger' || 
              node.data.stepType === 'start' ||
              node.position?.y === Math.min(...nodes.filter(isValidNode).map((n: any) => n.position?.y || 0))
            );
          }) || nodes.find(isValidNode);
          
          if (firstNode && isValidNode(firstNode) && firstNode.data) {
            const assignedTo = firstNode.data.assignedTo;
            
            if (assignedTo === user.id) {
              availableWorkflows.push({
                id: savedWorkflow.id,
                name: savedWorkflow.name,
                description: savedWorkflow.description,
                is_reusable: true,
                start_step: {
                  id: firstNode.id,
                  name: firstNode.data.label || 'Start Step',
                  description: firstNode.data.description || '',
                  metadata: firstNode.data.metadata || {}
                }
              });
            }
          }
        }
      }

      // Check workflows table for reusable workflows where user is assigned to first step
      const { data: reusableWorkflows, error: reusableError } = await supabase
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
        .eq('is_reusable', true);

      if (!reusableError && reusableWorkflows) {
        for (const workflow of reusableWorkflows) {
          availableWorkflows.push({
            id: workflow.id,
            name: workflow.name,
            description: workflow.description,
            is_reusable: true,
            start_step: {
              id: workflow.workflow_steps[0].id,
              name: workflow.workflow_steps[0].name,
              description: workflow.workflow_steps[0].description,
              metadata: workflow.workflow_steps[0].metadata,
            }
          });
        }
      }

      // Get non-reusable workflows where user is assigned to first step and hasn't been started yet
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

      if (!nonReusableError && nonReusableWorkflows) {
        // Check which haven't been started yet
        for (const workflow of nonReusableWorkflows) {
          const { data: existingInstance } = await supabase
            .from('workflow_instances')
            .select('id')
            .eq('workflow_id', workflow.id)
            .limit(1);

          if (!existingInstance || existingInstance.length === 0) {
            availableWorkflows.push({
              id: workflow.id,
              name: workflow.name,
              description: workflow.description,
              is_reusable: false,
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

      setStartableWorkflows(availableWorkflows);
    } catch (error) {
      console.error('Error fetching startable workflows:', error);
    }
  }, [user]);

  // Manual refresh function
  const refreshWorkflows = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchInstances(), fetchStartableWorkflows()]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchInstances, fetchStartableWorkflows]);

  const startWorkflow = useCallback(async (workflowId: string, startData: any = {}) => {
    if (!user) return null;

    try {
      let actualWorkflowId = workflowId;

      // Check if this is a saved workflow (reusable workflow from saved_workflows table)
      const { data: savedWorkflow, error: savedError } = await supabase
        .from('saved_workflows')
        .select('*')
        .eq('id', workflowId)
        .maybeSingle();

      if (!savedError && savedWorkflow) {
        // For saved workflows, we need to create a new workflow instance in the workflows table first
        const { data: newWorkflow, error: workflowError } = await supabase
          .from('workflows')
          .insert({
            name: savedWorkflow.name,
            description: savedWorkflow.description,
            is_reusable: false, // Individual instances are not reusable
            status: 'active',
            created_by: user.id
          })
          .select()
          .single();

        if (workflowError) throw workflowError;
        
        actualWorkflowId = newWorkflow.id;

        // Create workflow steps based on the saved workflow nodes
        const nodes = savedWorkflow.nodes;
        
        if (Array.isArray(nodes)) {
          let stepOrder = 1;
          
          for (const node of nodes) {
            if (isValidNode(node) && node.data) {
              const { data: step, error: stepError } = await supabase
                .from('workflow_steps')
                .insert({
                  workflow_id: actualWorkflowId,
                  name: node.data.label || 'Step',
                  description: node.data.description || '',
                  step_order: stepOrder++,
                  assigned_to: node.data.assignedTo,
                  metadata: node.data
                })
                .select()
                .single();

              if (stepError) {
                console.error('Error creating step:', stepError);
              }
            }
          }
        }
      }

      // Get the first step
      const { data: firstStep, error: stepError } = await supabase
        .from('workflow_steps')
        .select('id')
        .eq('workflow_id', actualWorkflowId)
        .eq('step_order', 1)
        .single();

      if (stepError) throw stepError;

      // Create instance
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

      await refreshWorkflows();

      return data;
    } catch (error) {
      console.error('Error starting workflow:', error);
      throw error;
    }
  }, [user, refreshWorkflows]);

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      Promise.all([fetchInstances(), fetchStartableWorkflows()]).finally(() => {
        setIsLoading(false);
      });
    } else {
      setInstances([]);
      setStartableWorkflows([]);
      setIsLoading(false);
    }
  }, [user, fetchInstances, fetchStartableWorkflows]);

  return {
    instances,
    startableWorkflows,
    isLoading,
    startWorkflow,
    refreshWorkflows,
    refetch: refreshWorkflows
  };
}
