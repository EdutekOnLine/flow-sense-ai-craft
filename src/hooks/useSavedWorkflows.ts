
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Node, Edge, Viewport } from '@xyflow/react';
import { Json } from '@/integrations/supabase/types';
import { toast as sonnerToast } from 'sonner';

export interface SavedWorkflow {
  id: string;
  name: string;
  description: string | null;
  nodes: Node[];
  edges: Edge[];
  viewport: Viewport;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_reusable: boolean;
}

export function useSavedWorkflows() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [workflows, setWorkflows] = useState<SavedWorkflow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchWorkflows = useCallback(async () => {
    if (!user) {
      console.log('No user found, skipping workflow fetch');
      return;
    }

    console.log('Fetching workflows for user:', user.id);
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('saved_workflows')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Transform the database data to match our SavedWorkflow interface
      const transformedWorkflows: SavedWorkflow[] = (data || []).map(workflow => ({
        id: workflow.id,
        name: workflow.name,
        description: workflow.description,
        nodes: Array.isArray(workflow.nodes) ? workflow.nodes as unknown as Node[] : [],
        edges: Array.isArray(workflow.edges) ? workflow.edges as unknown as Edge[] : [],
        viewport: (workflow.viewport as unknown as Viewport) || { x: 0, y: 0, zoom: 1 },
        created_by: workflow.created_by,
        created_at: workflow.created_at,
        updated_at: workflow.updated_at,
        is_reusable: workflow.is_reusable || false,
      }));

      setWorkflows(transformedWorkflows);
      console.log('Fetched workflows:', transformedWorkflows);
    } catch (error) {
      console.error('Error fetching workflows:', error);
      toast({
        title: "Error",
        description: "Failed to load saved workflows",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  const saveWorkflow = useCallback(async (
    name: string,
    description: string,
    nodes: Node[],
    edges: Edge[],
    viewport: Viewport,
    isReusable: boolean = false
  ): Promise<SavedWorkflow> => {
    if (!user) {
      throw new Error('User must be authenticated to save workflows');
    }
    
    if (isSaving) {
      throw new Error('Save operation already in progress');
    }

    setIsSaving(true);
    sonnerToast.loading('Saving workflow...');
    console.log('Saving workflow with nodes:', nodes.length);

    try {
      // Save to saved_workflows for the UI listing
      const { data, error } = await supabase
        .from('saved_workflows')
        .insert({
          name,
          description,
          nodes: nodes as unknown as Json,
          edges: edges as unknown as Json,
          viewport: viewport as unknown as Json,
          created_by: user.id,
          is_reusable: isReusable,
        })
        .select()
        .single();

      if (error) throw error;

      // Transform the response data
      const savedWorkflow: SavedWorkflow = {
        id: data.id,
        name: data.name,
        description: data.description,
        nodes: Array.isArray(data.nodes) ? data.nodes as unknown as Node[] : [],
        edges: Array.isArray(data.edges) ? data.edges as unknown as Edge[] : [],
        viewport: (data.viewport as unknown as Viewport) || { x: 0, y: 0, zoom: 1 },
        created_by: data.created_by,
        created_at: data.created_at,
        updated_at: data.updated_at,
        is_reusable: data.is_reusable || false,
      };

      // Refresh workflows
      await fetchWorkflows();
      sonnerToast.success('Workflow saved successfully');

      return savedWorkflow;
    } catch (error) {
      console.error('Error saving workflow:', error);
      sonnerToast.error('Failed to save workflow');
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [user, fetchWorkflows, isSaving]);

  const updateWorkflow = useCallback(async (
    id: string,
    name: string,
    description: string,
    nodes: Node[],
    edges: Edge[],
    viewport: Viewport
  ) => {
    if (!user) {
      throw new Error('User must be authenticated to update workflows');
    }
    
    if (isSaving) {
      throw new Error('Update operation already in progress');
    }

    setIsSaving(true);
    sonnerToast.loading('Updating workflow...');
    console.log('Updating workflow with nodes:', nodes.length);

    try {
      // Update the workflow visualization data
      const { data, error } = await supabase
        .from('saved_workflows')
        .update({
          name,
          description,
          nodes: nodes as unknown as Json,
          edges: edges as unknown as Json,
          viewport: viewport as unknown as Json,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      console.log('Updated workflow successfully:', data);

      // Refresh workflows
      await fetchWorkflows();
      sonnerToast.success('Workflow updated successfully');

      return data;
    } catch (error) {
      console.error('Error updating workflow:', error);
      sonnerToast.error('Failed to update workflow');
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [user, fetchWorkflows, isSaving]);

  const deleteWorkflow = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('saved_workflows')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Refresh the workflows list
      await fetchWorkflows();

      toast({
        title: "Workflow Deleted",
        description: "The workflow has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting workflow:', error);
      toast({
        title: "Error",
        description: "Failed to delete workflow",
        variant: "destructive",
      });
    }
  }, [fetchWorkflows, toast]);

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  return {
    workflows,
    isLoading,
    isSaving,
    saveWorkflow,
    updateWorkflow,
    deleteWorkflow,
    refetch: fetchWorkflows,
  };
}
