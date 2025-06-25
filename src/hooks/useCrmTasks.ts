
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import type { CrmTask } from '@/modules/neura-crm';

interface CreateTaskData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  due_date: string | null;
  contact_id: string | null;
  company_id: string | null;
  assigned_to: string | null;
  workspace_id: string;
  created_by: string;
}

interface UpdateTaskData {
  id: string;
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  due_date?: string | null;
  contact_id?: string | null;
  company_id?: string | null;
  assigned_to?: string | null;
}

export function useCrmTasks() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createTask = useMutation({
    mutationFn: async (data: CreateTaskData) => {
      const { error } = await supabase
        .from('crm_tasks')
        .insert([data]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-tasks'] });
      toast({
        title: 'Task created',
        description: 'The task has been created successfully.',
      });
    },
    onError: (error) => {
      console.error('Error creating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to create task. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const updateTask = useMutation({
    mutationFn: async (data: UpdateTaskData) => {
      const { id, ...updateData } = data;
      const { error } = await supabase
        .from('crm_tasks')
        .update({
          ...updateData,
          updated_by: profile?.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-tasks'] });
      toast({
        title: 'Task updated',
        description: 'The task has been updated successfully.',
      });
    },
    onError: (error) => {
      console.error('Error updating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('crm_tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-tasks'] });
      toast({
        title: 'Task deleted',
        description: 'The task has been deleted successfully.',
      });
    },
    onError: (error) => {
      console.error('Error deleting task:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete task. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const updateTaskStatus = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: 'pending' | 'in_progress' | 'completed' | 'cancelled' }) => {
      const updateData: any = {
        status,
        updated_by: profile?.id,
        updated_at: new Date().toISOString(),
      };

      // Set completed_at when marking as completed, clear it otherwise
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      } else if (status !== 'completed') {
        updateData.completed_at = null;
      }

      const { error } = await supabase
        .from('crm_tasks')
        .update(updateData)
        .eq('id', taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-tasks'] });
    },
    onError: (error) => {
      console.error('Error updating task status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task status. Please try again.',
        variant: 'destructive',
      });
    },
  });

  return {
    createTask: createTask.mutateAsync,
    updateTask: updateTask.mutateAsync,
    deleteTask: deleteTask.mutateAsync,
    updateTaskStatus: updateTaskStatus.mutateAsync,
    isCreating: createTask.isPending,
    isUpdating: updateTask.isPending,
    isDeleting: deleteTask.isPending,
    isUpdatingStatus: updateTaskStatus.isPending,
  };
}
