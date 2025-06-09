
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { SavedWorkflow } from '@/hooks/useSavedWorkflows';
import { Node, Edge, Viewport } from '@xyflow/react';

export function useMyReusableWorkflows() {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState<SavedWorkflow[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMyReusableWorkflows = useCallback(async () => {
    if (!user) {
      console.log('No user found, skipping reusable workflow fetch');
      return;
    }

    console.log('Fetching reusable workflows for user:', user.id);
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('saved_workflows')
        .select('*')
        .eq('is_reusable', true)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Filter workflows where user is creator OR assigned to first step
      const filteredWorkflows = (data || []).filter(workflow => {
        // User is creator
        if (workflow.created_by === user.id) {
          return true;
        }

        // Check if user is assigned to the first step
        const nodes = Array.isArray(workflow.nodes) ? workflow.nodes : [];
        if (nodes.length === 0) return false;

        // Find the first step (node with earliest Y position or start/trigger type)
        const firstNode = nodes.find((node: any) => {
          // Safely access node properties
          if (!node || typeof node !== 'object') return false;
          
          const nodeData = node.data;
          if (!nodeData || typeof nodeData !== 'object') return false;

          return nodeData.assignedTo && (
            nodeData.stepType === 'trigger' || 
            nodeData.stepType === 'start' ||
            (node.position && typeof node.position.y === 'number' && 
             node.position.y === Math.min(...nodes
               .filter((n: any) => n?.position?.y !== undefined && typeof n.position.y === 'number')
               .map((n: any) => n.position.y)))
          );
        }) || nodes.find((node: any) => {
          if (!node || typeof node !== 'object') return false;
          const nodeData = node.data;
          return nodeData && typeof nodeData === 'object' && nodeData.assignedTo;
        }) || nodes[0];

        if (!firstNode || typeof firstNode !== 'object') return false;
        const firstNodeData = firstNode.data;
        if (!firstNodeData || typeof firstNodeData !== 'object') return false;

        return firstNodeData.assignedTo === user.id;
      });

      // Transform the database data to match our SavedWorkflow interface
      const transformedWorkflows: SavedWorkflow[] = filteredWorkflows.map(workflow => ({
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
      console.log('Fetched my reusable workflows:', transformedWorkflows);
    } catch (error) {
      console.error('Error fetching my reusable workflows:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMyReusableWorkflows();
  }, [fetchMyReusableWorkflows]);

  return {
    workflows,
    isLoading,
    refetch: fetchMyReusableWorkflows,
  };
}
