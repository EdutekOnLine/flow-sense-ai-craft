
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
      // First get the workflow comments
      const { data: comments, error: commentsError } = await supabase
        .from('workflow_comments')
        .select('*')
        .eq('workflow_id', workflowId)
        .order('created_at', { ascending: false });

      if (commentsError) throw commentsError;

      // Then get profile data for each comment
      const logsWithProfiles: WorkflowLog[] = [];
      
      for (const comment of comments || []) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name, email')
          .eq('id', comment.user_id)
          .single();

        logsWithProfiles.push({
          ...comment,
          profiles: profile || undefined
        });
      }

      setLogs(logsWithProfiles);
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
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data: newComment, error } = await supabase
        .from('workflow_comments')
        .insert({
          workflow_id: workflowId,
          comment,
          user_id: user.user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Get the user's profile for the new log entry
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name, email')
        .eq('id', user.user.id)
        .single();

      const newLog: WorkflowLog = {
        ...newComment,
        profiles: profile || undefined
      };

      setLogs(prev => [newLog, ...prev]);
      
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
