
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

      // Check workflow_definitions for reusable workflows where user is assigned to first step
      console.log('=== CHECKING WORKFLOW_DEFINITIONS FOR REUSABLE ===');
      const { data: reusableDefinitions, error: reusableError } = await supabase
        .from('workflow_definitions')
        .select('*')
        .eq('is_reusable', true);
      
      if (reusableError) {
        console.error('Error fetching reusable workflow definitions:', reusableError);
      } else {
        console.log('Found reusable workflow definitions:', reusableDefinitions);
        
        // For each reusable definition, check if there are corresponding workflows where user is assigned to first step
        for (const definition of reusableDefinitions || []) {
          console.log(`Processing reusable definition: ${definition.name}`);
          
          // Find workflows based on this definition where user is assigned to first step
          const { data: workflows, error: workflowError } = await supabase
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
            .eq('name', definition.name)
            .eq('workflow_steps.step_order', 1)
            .eq('workflow_steps.workflow_step_assignments.assigned_to', user.id)
            .eq('status', 'active');

          if (workflowError) {
            console.error(`Error fetching workflows for definition ${definition.name}:`, workflowError);
          } else {
            console.log(`Found ${workflows?.length || 0} workflows for definition ${definition.name}`);
            
            if (workflows && workflows.length > 0) {
              // Add this as a startable workflow
              availableWorkflows.push({
                id: definition.id,
                name: definition.name,
                description: definition.description,
                is_reusable: true,
                start_step: {
                  id: workflows[0].workflow_steps[0].id,
                  name: workflows[0].workflow_steps[0].name,
                  description: workflows[0].workflow_steps[0].description,
                  metadata: workflows[0].workflow_steps[0].metadata,
                }
              });
              console.log(`Added reusable workflow: ${definition.name}`);
            }
          }
        }
      }

      // Check saved_workflows - but only show if user is assigned to a corresponding workflow's first step
      console.log('=== CHECKING SAVED_WORKFLOWS ===');
      const { data: savedWorkflows, error: savedError } = await supabase
        .from('saved_workflows')
        .select('*');
      
      if (savedError) {
        console.error('Error fetching saved workflows:', savedError);
      } else {
        console.log('Found saved workflows:', savedWorkflows);
        
        // For each saved workflow, check if there are corresponding active workflows where user is assigned to first step
        for (const savedWorkflow of savedWorkflows || []) {
          console.log(`Processing saved workflow: ${savedWorkflow.name}`);
          
          // Find workflows based on this saved workflow where user is assigned to first step
          const { data: workflows, error: workflowError } = await supabase
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
            .eq('name', savedWorkflow.name)
            .eq('workflow_steps.step_order', 1)
            .eq('workflow_steps.workflow_step_assignments.assigned_to', user.id)
            .eq('status', 'active');

          if (workflowError) {
            console.error(`Error fetching workflows for saved workflow ${savedWorkflow.name}:`, workflowError);
          } else {
            console.log(`Found ${workflows?.length || 0} workflows for saved workflow ${savedWorkflow.name}`);
            
            if (workflows && workflows.length > 0) {
              // Check if we already added this workflow from workflow_definitions
              const alreadyExists = availableWorkflows.some(w => w.name === savedWorkflow.name);
              if (!alreadyExists) {
                availableWorkflows.push({
                  id: savedWorkflow.id,
                  name: savedWorkflow.name,
                  description: savedWorkflow.description,
                  is_reusable: true, // Treat saved workflows as reusable
                  start_step: {
                    id: workflows[0].workflow_steps[0].id,
                    name: workflows[0].workflow_steps[0].name,
                    description: workflows[0].workflow_steps[0].description,
                    metadata: workflows[0].workflow_steps[0].metadata,
                  }
                });
                console.log(`Added saved workflow as reusable: ${savedWorkflow.name}`);
              }
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

      // Check if this is a reusable workflow definition
      const { data: workflowDefinition, error: definitionError } = await supabase
        .from('workflow_definitions')
        .select('id, is_reusable, name')
        .eq('id', workflowId)
        .eq('is_reusable', true)
        .maybeSingle();

      if (!definitionError && workflowDefinition) {
        // Find a corresponding workflow where user is assigned to first step
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
          .eq('name', workflowDefinition.name)
          .eq('workflow_steps.step_order', 1)
          .eq('workflow_steps.workflow_step_assignments.assigned_to', user.id)
          .eq('status', 'active')
          .limit(1)
          .maybeSingle();

        if (correspondingError || !correspondingWorkflow) {
          throw new Error('No corresponding workflow found that you can start');
        }

        actualWorkflowId = correspondingWorkflow.id;
      } else {
        // Check if this is a saved workflow
        const { data: savedWorkflow, error: savedError } = await supabase
          .from('saved_workflows')
          .select('id, name')
          .eq('id', workflowId)
          .maybeSingle();

        if (!savedError && savedWorkflow) {
          // Find a corresponding workflow where user is assigned to first step
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
            .eq('name', savedWorkflow.name)
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
