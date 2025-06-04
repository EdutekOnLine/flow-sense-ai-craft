
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useWorkflowStepAssignments } from '@/hooks/useWorkflowStepAssignments';
import { Play } from 'lucide-react';

interface CreateAssignmentsButtonProps {
  workflowId: string;
  workflowName?: string;
}

export function CreateAssignmentsButton({ workflowId, workflowName }: CreateAssignmentsButtonProps) {
  const [isCreating, setIsCreating] = useState(false);
  const { createAssignmentsForWorkflow } = useWorkflowStepAssignments();

  const handleCreateAssignments = async () => {
    setIsCreating(true);
    try {
      await createAssignmentsForWorkflow(workflowId);
    } catch (error) {
      console.error('Failed to create assignments:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Button
      onClick={handleCreateAssignments}
      disabled={isCreating}
      size="sm"
      className="bg-green-600 hover:bg-green-700"
    >
      <Play className="h-4 w-4 mr-2" />
      {isCreating ? 'Creating...' : 'Create Assignments'}
    </Button>
  );
}
