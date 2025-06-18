
import { useState, useEffect, useCallback } from 'react';
import { useWorkflowAssignments } from '@/hooks/useWorkflowAssignments';
import { supabase } from '@/integrations/supabase/client';

type AssignmentStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';

interface Assignment {
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
    step_order: number;
    workflows: {
      name: string;
    };
  };
  workflow_instance?: {
    id: string;
    status: string;
    current_step_id: string | null;
    started_by: string;
    created_at: string;
  };
}

export function useWorkflowInbox() {
  const { assignments, isLoading, updateAssignmentStatus, completeStep, refetch } = useWorkflowAssignments();
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [notes, setNotes] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCompleting, setIsCompleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);

  // Set up real-time subscription for new assignments
  useEffect(() => {
    const channel = supabase
      .channel('workflow-assignments-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'workflow_step_assignments'
        },
        (payload) => {
          console.log('New assignment created:', payload);
          refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'workflow_step_assignments'
        },
        (payload) => {
          console.log('Assignment updated:', payload);
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  const handleStartWorking = useCallback(async (assignmentId: string) => {
    await updateAssignmentStatus(assignmentId, 'in_progress');
  }, [updateAssignmentStatus]);

  const handleOpenCompleteDialog = useCallback((assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setNotes('');
    setIsCompleteDialogOpen(true);
  }, []);

  const handleOpenUpdateDialog = useCallback((assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setNotes(assignment.notes || '');
    setIsUpdateDialogOpen(true);
  }, []);

  const handleCloseCompleteDialog = useCallback(() => {
    setIsCompleteDialogOpen(false);
    setSelectedAssignment(null);
    setNotes('');
  }, []);

  const handleCloseUpdateDialog = useCallback(() => {
    setIsUpdateDialogOpen(false);
    setSelectedAssignment(null);
    setNotes('');
  }, []);

  const handleCompleteStep = useCallback(async (assignment: Assignment) => {
    setIsCompleting(true);
    try {
      await completeStep(assignment.id, notes);
      setNotes('');
      setIsCompleteDialogOpen(false);
      setSelectedAssignment(null);
    } finally {
      setIsCompleting(false);
    }
  }, [completeStep, notes]);

  const handleUpdateStatus = useCallback(async (newStatus: AssignmentStatus) => {
    if (!selectedAssignment) return;
    
    await updateAssignmentStatus(selectedAssignment.id, newStatus, notes);
    setIsUpdateDialogOpen(false);
    setSelectedAssignment(null);
    setNotes('');
  }, [selectedAssignment, updateAssignmentStatus, notes]);

  const filteredAssignments = assignments.filter(assignment => {
    if (statusFilter === 'all') return true;
    return assignment.status === statusFilter;
  });

  const pendingCount = assignments.filter(a => a.status === 'pending').length;
  const inProgressCount = assignments.filter(a => a.status === 'in_progress').length;

  return {
    // Data
    assignments: filteredAssignments,
    isLoading,
    isRefreshing,
    isCompleting,
    pendingCount,
    inProgressCount,
    
    // Dialog states
    selectedAssignment,
    isCompleteDialogOpen,
    isUpdateDialogOpen,
    notes,
    
    // Filter state
    statusFilter,
    
    // Actions
    handleRefresh,
    handleStartWorking,
    handleOpenCompleteDialog,
    handleOpenUpdateDialog,
    handleCloseCompleteDialog,
    handleCloseUpdateDialog,
    handleCompleteStep,
    handleUpdateStatus,
    setNotes,
    setStatusFilter,
  };
}
