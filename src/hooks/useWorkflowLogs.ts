
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WorkflowLog {
  id: string;
  workflow_id: string;
  user_id: string;
  comment: string;
  created_at: string;
  profiles?: {
    first_name?: string;
    last_name?: string;
    email: string;
  };
}

export function useWorkflowLogs(workflowId?: string) {
  const { toast } = useToast();
  const [logs, setLogs] = useState<WorkflowLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLogs = useCallback(async () => {
    if (!workflowId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('workflow_comments')
        .select(`
          *,
          profiles (
            first_name,
            last_name,
            email
          )
        `)
        .eq('workflow_id', workflowId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching workflow logs:', error);
      toast({
        title: "Error",
        description: "Failed to load workflow logs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [workflowId, toast]);

  const addLog = useCallback(async (comment: string) => {
    if (!workflowId) return;

    try {
      const { data, error } = await supabase
        .from('workflow_comments')
        .insert({
          workflow_id: workflowId,
          comment,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select(`
          *,
          profiles (
            first_name,
            last_name,
            email
          )
        `)
        .single();

      if (error) throw error;

      setLogs(prev => [data, ...prev]);
      
      toast({
        title: "Log Added",
        description: "Comment has been added to the workflow log",
      });
    } catch (error) {
      console.error('Error adding workflow log:', error);
      toast({
        title: "Error",
        description: "Failed to add log entry",
        variant: "destructive",
      });
    }
  }, [workflowId, toast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return {
    logs,
    isLoading,
    addLog,
    refetch: fetchLogs
  };
}
