
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface ReusableWorkflow {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_reusable: boolean;
  status: string;
  priority: string;
  assigned_to?: string;
  due_date?: string;
  metadata?: any;
  tags?: string[];
}

export function useMyReusableWorkflows() {
  const [workflows, setWorkflows] = useState<ReusableWorkflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { profile, isRootUser } = useAuth();

  useEffect(() => {
    async function fetchReusableWorkflows() {
      if (!profile?.id) {
        setWorkflows([]);
        setIsLoading(false);
        return;
      }

      try {
        let query = supabase
          .from('workflows')
          .select('id, name, description, created_by, created_at, updated_at, is_reusable, status, priority, assigned_to, due_date, metadata, tags')
          .eq('is_reusable', true);

        // Root users can see all reusable workflows, regular users see public ones and their own
        if (!isRootUser()) {
          query = query.or(`created_by.eq.${profile.id},status.eq.published`);
        }

        const { data, error } = await query.order('updated_at', { ascending: false });

        if (error) {
          console.error('Error fetching reusable workflows:', error);
          throw error;
        }

        console.log('Fetched reusable workflows:', data?.length || 0, 'workflows');
        setWorkflows(data || []);
      } catch (error) {
        console.error('Failed to fetch reusable workflows:', error);
        setWorkflows([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchReusableWorkflows();
  }, [profile?.id, isRootUser]);

  const deleteWorkflow = async (workflowId: string) => {
    if (!profile?.id) return;

    try {
      const { error } = await supabase
        .from('workflows')
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
      setWorkflows([]);
    }
  };
}
