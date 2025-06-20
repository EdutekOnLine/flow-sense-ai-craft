
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface SavedWorkflow {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_reusable: boolean;
  nodes: any[];
  edges: any[];
  viewport?: { x: number; y: number; zoom: number };
}

export function useSavedWorkflows() {
  const [workflows, setWorkflows] = useState<SavedWorkflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { profile, isRootUser } = useAuth();

  useEffect(() => {
    async function fetchWorkflows() {
      if (!profile?.id) {
        setWorkflows([]);
        setIsLoading(false);
        return;
      }

      try {
        let query = supabase
          .from('saved_workflows')
          .select('*');

        // Root users can see all saved workflows, regular users only see their own and reusable ones
        if (!isRootUser()) {
          query = query.or(`created_by.eq.${profile.id},is_reusable.eq.true`);
        }

        const { data, error } = await query.order('updated_at', { ascending: false });

        if (error) {
          console.error('Error fetching saved workflows:', error);
          throw error;
        }

        console.log('Fetched saved workflows:', data?.length || 0, 'workflows');
        
        // Transform the data to ensure proper types
        const transformedData = (data || []).map(workflow => ({
          ...workflow,
          nodes: Array.isArray(workflow.nodes) ? workflow.nodes : [],
          edges: Array.isArray(workflow.edges) ? workflow.edges : [],
          viewport: workflow.viewport || { x: 0, y: 0, zoom: 1 }
        }));
        
        setWorkflows(transformedData);
      } catch (error) {
        console.error('Failed to fetch saved workflows:', error);
        setWorkflows([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchWorkflows();
  }, [profile?.id, isRootUser]);

  const deleteWorkflow = async (workflowId: string) => {
    if (!profile?.id) return;

    try {
      const { error } = await supabase
        .from('saved_workflows')
        .delete()
        .eq('id', workflowId);

      if (error) throw error;

      setWorkflows(prev => prev.filter(w => w.id !== workflowId));
    } catch (error) {
      console.error('Failed to delete workflow:', error);
      throw error;
    }
  };

  return {
    workflows,
    isLoading,
    deleteWorkflow,
    refetch: () => {
      setIsLoading(true);
      // Re-trigger the effect
      setWorkflows([]);
    }
  };
}
