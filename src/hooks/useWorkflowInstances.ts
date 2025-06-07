
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

    console.log('=== DEBUGGING STARTABLE WORKFLOWS ===');
    console.log('User ID:', user.id);

    try {
      const availableWorkflows: StartableWorkflow[] = [];

      // First, get all saved workflows marked as reusable
      console.log('=== CHECKING SAVED_WORKFLOWS FOR REUSABLE ===');
      const { data: savedWorkflows, error: savedError } = await supabase
        .from('saved_workflows')
        .select('*');
      
      if (savedError) {
        console.error('Error fetching saved workflows:', savedError);
      } else {
        console.log('Found saved workflows:', savedWorkflows);
        
        // For each saved workflow, check if user is assigned to the first step via the nodes data
        for (const savedWorkflow of savedWorkflows || []) {
          console.log(`Processing saved workflow: ${savedWorkflow.name}`);
          
          // Check the nodes directly from the saved workflow to see if user is assigned to first step
          const nodes = savedWorkflow.nodes;
          console.log('Workflow nodes:', nodes);
          
          // Type guard to ensure nodes is an array
          if (!Array.isArray(nodes)) {
            console.log('Nodes is not an array, skipping workflow');
            continue;
          }
          
          // Find the first step (step_order = 1 or the first node)
          const firstNode = nodes.find((node: any) => {
            return node.data && (
              node.data.stepType === 'trigger' || 
              node.data.stepType === 'start' ||
              node.position?.y === Math.min(...nodes.map((n: any) => n.position?.y || 0))
            );
          }) || nodes[0]; // Fallback to first node if no trigger found
          
          console.log('First node found:', firstNode);
          
          if (firstNode && firstNode.data) {
            const assignedTo = firstNode.data.assignedTo;
            console.log('First node assigned to:', assignedTo);
            console.log('Current user ID:', user.id);
            
            if (assignedTo === user.id) {
              console.log(`User is assigned to first step of workflow: ${savedWorkflow.name}`);
              
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
              console.log(`Added saved workflow as reusable: ${savedWorkflow.name}`);
            } else {
              console.log(`User not assigned to first step of ${savedWorkflow.name}`);
            }
          }
        }
      }

      // Get non-reusable workflows where user is assigned to first step and hasn't been started yet
      console.log('=== CHECKING NON-REUSABLE WORKFLOWS ===');
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
        console.log('Found non-reusable workflows:', nonReusableWorkflows?.length || 0);

        // Check which haven't been started yet
        for (const workflow of nonReusableWorkflows || []) {
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

      console.log('=== FINAL RESULTS ===');
      console.log('Total startable workflows found:', availableWorkflows.length);
      console.log('Workflows:', availableWorkflows.map(w => ({ name: w.name, reusable: w.is_reusable })));
      
      setStartableWorkflows(availableWorkflows);
    } catch (error) {
      console.error('Error fetching startable workflows:', error);
    }
  };

  const startWorkflow = async (workflowId: string, startData: any = {}) => {
    if (!user) return null;

    try {
      console.log('Starting workflow:', workflowId);

      let actualWorkflowId = workflowId;

      // Check if this is a saved workflow (reusable workflow from saved_workflows table)
      const { data: savedWorkflow, error: savedError } = await supabase
        .from('saved_workflows')
        .select('*')
        .eq('id', workflowId)
        .maybeSingle();

      if (!savedError && savedWorkflow) {
        console.log('Starting saved workflow:', savedWorkflow.name);
        
        // For saved workflows, we need to create a new workflow instance in the workflows table first
        // Then create the workflow instance
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
        
        // Type guard to ensure nodes is an array before iterating
        if (Array.isArray(nodes)) {
          let stepOrder = 1;
          
          for (const node of nodes) {
            if (node.data) {
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
              } else {
                console.log('Created step:', step);
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

      console.log('Workflow instance created:', data);

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
