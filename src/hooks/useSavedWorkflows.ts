
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
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [workflows, setWorkflows] = useState<SavedWorkflow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchWorkflows = useCallback(async () => {
    if (!user || !profile) {
      console.log('No user or profile found, skipping workflow fetch');
      return;
    }

    console.log('Fetching workflows for user:', user.id, 'with role:', profile.role);
    setIsLoading(true);
    try {
      let query = supabase
        .from('saved_workflows')
        .select('*');

      // Role-based filtering
      if (profile.role === 'admin') {
        // Admins see all workflows - no filter needed
        console.log('Admin user - fetching all workflows');
      } else if (profile.role === 'manager') {
        // Managers only see workflows they created
        console.log('Manager user - fetching only workflows created by user');
        query = query.eq('created_by', user.id);
      } else {
        // Employees shouldn't reach this point due to permission guards, but safety check
        console.log('Employee user - no workflow access');
        setWorkflows([]);
        return;
      }

      const { data, error } = await query.order('updated_at', { ascending: false });

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
      console.log('Fetched workflows:', transformedWorkflows.length, 'workflows for role:', profile.role);
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
  }, [user, profile, toast]);

  const saveWorkflow = useCallback(async (
    name: string,
    description: string,
    nodes: Node[],
    edges: Edge[],
    viewport: Viewport,
    isReusable: boolean = false
  ): Promise<SavedWorkflow> => {
    if (!user || !profile?.workspace_id) {
      throw new Error('User must be authenticated and have a workspace to save workflows');
    }
    
    if (isSaving) {
      throw new Error('Save operation already in progress');
    }

    setIsSaving(true);
    const loadingToastId = sonnerToast.loading('Saving workflow...');
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
          workspace_id: profile.workspace_id,
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
      sonnerToast.dismiss(loadingToastId);
      sonnerToast.success('Workflow saved successfully');

      return savedWorkflow;
    } catch (error) {
      console.error('Error saving workflow:', error);
      sonnerToast.dismiss(loadingToastId);
      sonnerToast.error('Failed to save workflow');
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [user, profile?.workspace_id, fetchWorkflows, isSaving]);

  const updateWorkflow = useCallback(async (
    id: string,
    name: string,
    description: string,
    nodes: Node[],
    edges: Edge[],
    viewport: Viewport,
    isReusable: boolean = false
  ) => {
    if (!user) {
      throw new Error('User must be authenticated to update workflows');
    }
    
    if (isSaving) {
      throw new Error('Update operation already in progress');
    }

    setIsSaving(true);
    const loadingToastId = sonnerToast.loading('Updating workflow...');
    console.log('Updating workflow with nodes:', nodes.length, 'isReusable:', isReusable);

    try {
      // Update the workflow visualization data including is_reusable
      const { data, error } = await supabase
        .from('saved_workflows')
        .update({
          name,
          description,
          nodes: nodes as unknown as Json,
          edges: edges as unknown as Json,
          viewport: viewport as unknown as Json,
          is_reusable: isReusable,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      console.log('Updated workflow successfully:', data);

      // Refresh workflows
      await fetchWorkflows();
      sonnerToast.dismiss(loadingToastId);
      sonnerToast.success('Workflow updated successfully');

      return data;
    } catch (error) {
      console.error('Error updating workflow:', error);
      sonnerToast.dismiss(loadingToastId);
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
