
import { useState, useCallback } from 'react';
import { Node, Edge, Viewport } from '@xyflow/react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  is_reusable: boolean;
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
    workflowId?: string,
    isReusable?: boolean
  ) => {
    if (isLoading) {
      console.log('Save already in progress, skipping...');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Starting save operation...', { name, workflowId, nodesCount: nodes.length, edgesCount: edges.length });
      
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
        console.log('Updating existing workflow:', workflowId);
        // Update existing workflow
        const { error } = await supabase
          .from('workflow_definitions')
          .update({
            name,
            description,
            is_reusable: isReusable || false,
            nodes: nodesWithIds as any,
            edges: edgesWithIds as any,
            viewport: viewport as any,
            updated_at: new Date().toISOString()
          })
          .eq('id', workflowId);

        if (error) {
          console.error('Error updating workflow:', error);
          throw error;
        }
        
        console.log('Workflow updated successfully');
        toast({
          title: "Workflow Updated",
          description: `"${name}" has been successfully updated.`,
        });
      } else {
        console.log('Creating new workflow');
        // Create new workflow
        const { data: userData } = await supabase.auth.getUser();
        
        if (!userData.user) {
          throw new Error('User not authenticated');
        }

        const { data, error } = await supabase
          .from('workflow_definitions')
          .insert([{
            name,
            description,
            is_reusable: isReusable || false,
            nodes: nodesWithIds as any,
            edges: edgesWithIds as any,
            viewport: viewport as any,
            created_by: userData.user.id
          }])
          .select()
          .single();

        if (error) {
          console.error('Error creating workflow:', error);
          throw error;
        }
        
        console.log('Workflow created successfully:', data.id);
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
        description: error instanceof Error ? error.message : "Failed to save workflow. Please try again.",
        variant: "destructive",
      });
      throw error; // Re-throw to let caller handle it
    } finally {
      setIsLoading(false);
    }
  }, [toast, isLoading]);

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
        is_reusable: data.is_reusable || false,
        nodes: data.nodes as unknown as Node[],
        edges: data.edges as unknown as Edge[],
        viewport: data.viewport as unknown as Viewport,
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
        .select('id, name, description, is_reusable, created_at, updated_at')
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
