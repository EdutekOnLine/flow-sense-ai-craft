
import { useWorkflowAssignmentData } from './useWorkflowAssignmentData';
import { useWorkflowAssignmentActions } from './useWorkflowAssignmentActions';

export function useWorkflowAssignments() {
  const {
    assignments,
    isLoading,
    fetchAssignments,
    setAssignments,
  } = useWorkflowAssignmentData();

  const {
    updateAssignmentStatus,
    completeStep,
  } = useWorkflowAssignmentActions({
    assignments,
    setAssignments,
    fetchAssignments,
  });

  return {
    assignments,
    isLoading,
    updateAssignmentStatus,
    completeStep,
    refetch: fetchAssignments,
  };
}

// Re-export types for convenience
export type { WorkflowAssignment, AssignmentStatus } from './useWorkflowAssignmentData';
