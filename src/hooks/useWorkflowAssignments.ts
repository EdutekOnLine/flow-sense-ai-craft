
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

type AssignmentStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';

interface WorkflowAssignment {
  id: string;
  workflow_step_id: string;
  assigned_to: string;
  assigned_by: string;
  status: AssignmentStatus;
  due_date?: string;
  completed_at?: string;
  notes?: string;
  created_at: string;
  workflow_steps: {
    name: string;
    description?: string;
    workflow_id: string;
    workflows: {
      name: string;
    };
  };
}

export function useWorkflowAssignments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<WorkflowAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAssignments = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('workflow_step_assignments')
        .select(`
          *,
          workflow_steps (
            name,
            description,
            workflow_id,
            workflows (
              name
            )
          )
        `)
        .eq('assigned_to', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Type-safe mapping of database data to our interface
      const typedAssignments: WorkflowAssignment[] = (data || []).map(item => ({
        ...item,
        status: item.status as AssignmentStatus
      }));

      setAssignments(typedAssignments);
    } catch (error) {
      console.error('Error fetching workflow assignments:', error);
      toast({
        title: "Error",
        description: "Failed to load workflow assignments",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  const updateAssignmentStatus = useCallback(async (
    assignmentId: string, 
    status: AssignmentStatus,
    notes?: string
  ) => {
    try {
      const updateData: any = { status };
      
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }
      
      if (notes !== undefined) {
        updateData.notes = notes;
      }

      const { error } = await supabase
        .from('workflow_step_assignments')
        .update(updateData)
        .eq('id', assignmentId);

      if (error) throw error;

      setAssignments(prev => 
        prev.map(assignment => 
          assignment.id === assignmentId 
            ? { ...assignment, ...updateData }
            : assignment
        )
      );

      toast({
        title: "Status Updated",
        description: `Assignment marked as ${status.replace('_', ' ')}`,
      });
    } catch (error) {
      console.error('Error updating assignment status:', error);
      toast({
        title: "Error",
        description: "Failed to update assignment status",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  return {
    assignments,
    isLoading,
    updateAssignmentStatus,
    refetch: fetchAssignments
  };
}
