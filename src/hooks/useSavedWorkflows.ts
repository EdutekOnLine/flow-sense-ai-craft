
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
    if (!user) return;
    
    setIsLoading(true);
    const { data, error } = await supabase
      .from('saved_workflows')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching workflows:', error);
    } else {
      setWorkflows(data || []);
    }
    setIsLoading(false);
  };

  const saveWorkflow = async (
    name: string,
    description: string,
    nodes: Node[],
    edges: Edge[],
    viewport?: { x: number; y: number; zoom: number }
  ) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('saved_workflows')
      .insert({
        name,
        description,
        nodes,
        edges,
        viewport,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    
    await fetchWorkflows();
    return data;
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

    const { data, error } = await supabase
      .from('saved_workflows')
      .update({
        name,
        description,
        nodes,
        edges,
        viewport,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    await fetchWorkflows();
    return data;
  };

  const deleteWorkflow = async (id: string) => {
    const { error } = await supabase
      .from('saved_workflows')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    await fetchWorkflows();
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
