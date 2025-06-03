
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Node, Edge } from '@xyflow/react';

export interface SavedWorkflow {
  id: string;
  name: string;
  description?: string;
  nodes: Node[];
  edges: Edge[];
  viewport?: { x: number; y: number; zoom: number };
  created_by: string;
  created_at: string;
  updated_at: string;
}

export function useSavedWorkflows() {
  const [workflows, setWorkflows] = useState<SavedWorkflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchWorkflows = async () => {
    if (!user) {
      console.log('No user found, skipping workflow fetch');
      setIsLoading(false);
      return;
    }
    
    console.log('Fetching workflows for user:', user.id);
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('saved_workflows')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching workflows:', error);
        throw error;
      } else {
        console.log('Fetched workflows:', data);
        // Transform the data to match our interface
        const transformedWorkflows = (data || []).map(workflow => ({
          ...workflow,
          nodes: (workflow.nodes as unknown) as Node[],
          edges: (workflow.edges as unknown) as Edge[],
          viewport: (workflow.viewport as unknown) as { x: number; y: number; zoom: number } | undefined,
        }));
        setWorkflows(transformedWorkflows);
      }
    } catch (error) {
      console.error('Failed to fetch workflows:', error);
      setWorkflows([]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveWorkflow = async (
    name: string,
    description: string,
    nodes: Node[],
    edges: Edge[],
    viewport?: { x: number; y: number; zoom: number }
  ) => {
    if (!user) {
      console.error('User not authenticated');
      throw new Error('User not authenticated');
    }

    console.log('Saving workflow:', { name, description, nodesCount: nodes.length, edgesCount: edges.length });

    const workflowData = {
      name,
      description,
      nodes: nodes as any,
      edges: edges as any,
      viewport: viewport as any,
      created_by: user.id,
    };

    console.log('Workflow data being saved:', workflowData);

    try {
      const { data, error } = await supabase
        .from('saved_workflows')
        .insert(workflowData)
        .select()
        .single();

      if (error) {
        console.error('Error saving workflow:', error);
        throw error;
      }
      
      console.log('Workflow saved successfully:', data);
      await fetchWorkflows();
      return data;
    } catch (error) {
      console.error('Failed to save workflow:', error);
      throw error;
    }
  };

  const updateWorkflow = async (
    id: string,
    name: string,
    description: string,
    nodes: Node[],
    edges: Edge[],
    viewport?: { x: number; y: number; zoom: number }
  ) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('saved_workflows')
        .update({
          name,
          description,
          nodes: nodes as any,
          edges: edges as any,
          viewport: viewport as any,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      await fetchWorkflows();
      return data;
    } catch (error) {
      console.error('Failed to update workflow:', error);
      throw error;
    }
  };

  const deleteWorkflow = async (id: string) => {
    try {
      const { error } = await supabase
        .from('saved_workflows')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchWorkflows();
    } catch (error) {
      console.error('Failed to delete workflow:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, [user]);

  return {
    workflows,
    isLoading,
    saveWorkflow,
    updateWorkflow,
    deleteWorkflow,
    refetch: fetchWorkflows,
  };
}
