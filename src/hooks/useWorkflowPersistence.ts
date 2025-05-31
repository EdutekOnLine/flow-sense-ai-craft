
import { useState, useCallback } from 'react';
import { Node, Edge, Viewport } from '@xyflow/react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  nodes: Node[];
  edges: Edge[];
  viewport: Viewport;
  created_at: string;
  updated_at: string;
}

export function useWorkflowPersistence() {
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const saveWorkflow = useCallback(async (
    name: string,
    nodes: Node[],
    edges: Edge[],
    viewport: Viewport,
    description?: string,
    workflowId?: string
  ) => {
    setIsLoading(true);
    try {
      // Ensure all nodes have persistent IDs
      const nodesWithIds = nodes.map(node => ({
        ...node,
        id: node.id || `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }));

      // Ensure all edges have persistent IDs
      const edgesWithIds = edges.map(edge => ({
        ...edge,
        id: edge.id || `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }));

      if (workflowId) {
        // Update existing workflow
        const { error } = await supabase
          .from('workflow_definitions')
          .update({
            name,
            description,
            nodes: nodesWithIds,
            edges: edgesWithIds,
            viewport,
            updated_at: new Date().toISOString()
          })
          .eq('id', workflowId);

        if (error) throw error;
        
        toast({
          title: "Workflow Updated",
          description: `"${name}" has been successfully updated.`,
        });
      } else {
        // Create new workflow
        const { data, error } = await supabase
          .from('workflow_definitions')
          .insert({
            name,
            description,
            nodes: nodesWithIds,
            edges: edgesWithIds,
            viewport,
            created_by: (await supabase.auth.getUser()).data.user?.id
          })
          .select()
          .single();

        if (error) throw error;
        
        setCurrentWorkflowId(data.id);
        toast({
          title: "Workflow Saved",
          description: `"${name}" has been successfully created.`,
        });
      }
    } catch (error) {
      console.error('Error saving workflow:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save workflow. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const loadWorkflow = useCallback(async (workflowId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('workflow_definitions')
        .select('*')
        .eq('id', workflowId)
        .single();

      if (error) throw error;

      setCurrentWorkflowId(data.id);
      return {
        id: data.id,
        name: data.name,
        description: data.description,
        nodes: data.nodes as Node[],
        edges: data.edges as Edge[],
        viewport: data.viewport as Viewport,
        created_at: data.created_at,
        updated_at: data.updated_at
      } as WorkflowDefinition;
    } catch (error) {
      console.error('Error loading workflow:', error);
      toast({
        title: "Load Failed",
        description: "Failed to load workflow. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const listWorkflows = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('workflow_definitions')
        .select('id, name, description, created_at, updated_at')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error listing workflows:', error);
      toast({
        title: "Load Failed",
        description: "Failed to load workflows list.",
        variant: "destructive",
      });
      return [];
    }
  }, [toast]);

  const deleteWorkflow = useCallback(async (workflowId: string) => {
    try {
      const { error } = await supabase
        .from('workflow_definitions')
        .delete()
        .eq('id', workflowId);

      if (error) throw error;

      if (currentWorkflowId === workflowId) {
        setCurrentWorkflowId(null);
      }

      toast({
        title: "Workflow Deleted",
        description: "Workflow has been successfully deleted.",
      });
    } catch (error) {
      console.error('Error deleting workflow:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete workflow. Please try again.",
        variant: "destructive",
      });
    }
  }, [currentWorkflowId, toast]);

  return {
    currentWorkflowId,
    setCurrentWorkflowId,
    isLoading,
    saveWorkflow,
    loadWorkflow,
    listWorkflows,
    deleteWorkflow
  };
}
