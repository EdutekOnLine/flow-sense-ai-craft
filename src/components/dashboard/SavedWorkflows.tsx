
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSavedWorkflows } from '@/hooks/useSavedWorkflows';
import { useWorkflowPermissions } from '@/hooks/useWorkflowPermissions';
import { Workflow, Edit, Trash2, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SavedWorkflowsProps {
  onOpenWorkflow?: (workflowId: string) => void;
}

export function SavedWorkflows({ onOpenWorkflow }: SavedWorkflowsProps) {
  const { workflows, isLoading, deleteWorkflow } = useSavedWorkflows();
  const { canEditWorkflows } = useWorkflowPermissions();

  // Don't render for employees who can't edit workflows
  if (!canEditWorkflows) {
    return null;
  }

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteWorkflow(id);
      } catch (error) {
        console.error('Error deleting workflow:', error);
      }
    }
  };

  const handleOpenWorkflow = (workflowId: string) => {
    if (onOpenWorkflow) {
      onOpenWorkflow(workflowId);
    } else {
      console.log('No onOpenWorkflow function provided');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5 text-blue-500" />
            My Saved Workflows
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Workflow className="h-5 w-5 text-blue-500" />
          My Saved Workflows
        </CardTitle>
      </CardHeader>
      <CardContent>
        {workflows.length === 0 ? (
          <div className="text-center py-8">
            <Workflow className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No saved workflows yet</p>
            <p className="text-sm text-gray-400">Create and save your first workflow in the Workflow Builder</p>
          </div>
        ) : (
          <div className="space-y-4">
            {workflows.slice(0, 5).map((workflow) => (
              <div
                key={workflow.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm mb-1">{workflow.name}</h4>
                    {workflow.description && (
                      <p className="text-xs text-gray-600 mb-2">{workflow.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Updated {formatDistanceToNow(new Date(workflow.updated_at), { addSuffix: true })}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {workflow.nodes.length} nodes
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenWorkflow(workflow.id)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-3 w-3" />
                      Open
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(workflow.id, workflow.name)}
                      className="flex items-center gap-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {workflows.length > 5 && (
              <div className="text-center pt-4 border-t">
                <p className="text-sm text-gray-600">
                  And {workflows.length - 5} more workflows...
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
