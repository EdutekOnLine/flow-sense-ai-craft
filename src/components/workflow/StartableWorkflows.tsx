
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface StartableWorkflowsProps {
  workflows: any[];
  onStartWorkflow?: (workflowId: string, startData: any) => Promise<void>;
  isLoading?: boolean;
}

export function StartableWorkflows({ 
  workflows, 
  onStartWorkflow, 
  isLoading
}: StartableWorkflowsProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // No longer showing startable workflows since they're managed in "My Saved Workflows"
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Workflows moved to "My Saved Workflows"</h3>
        <p className="text-gray-600">
          All workflow management is now handled in the "My Saved Workflows" section.
        </p>
      </CardContent>
    </Card>
  );
}
