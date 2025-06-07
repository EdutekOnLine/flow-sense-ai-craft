
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSavedWorkflows } from '@/hooks/useSavedWorkflows';
import { useWorkflowPermissions } from '@/hooks/useWorkflowPermissions';
import { StartWorkflowDialog } from '@/components/workflow/StartWorkflowDialog';
import { Workflow, Edit, Trash2, Calendar, Play, User, Repeat } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { StartableWorkflow } from '@/hooks/useWorkflowInstances';

interface SavedWorkflowsProps {
  onOpenWorkflow?: (workflowId: string) => void;
  onStartWorkflow?: (workflowId: string, startData: any) => Promise<void>;
}

export function SavedWorkflows({ onOpenWorkflow, onStartWorkflow }: SavedWorkflowsProps) {
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
    console.log('SavedWorkflows handleOpenWorkflow called with:', workflowId);
    console.log('onOpenWorkflow function exists:', !!onOpenWorkflow);
    
    if (onOpenWorkflow) {
      console.log('Calling onOpenWorkflow with workflowId:', workflowId);
      onOpenWorkflow(workflowId);
    } else {
      console.error('No onOpenWorkflow function provided to SavedWorkflows');
    }
  };

  // Convert saved workflow to startable workflow format
  const convertToStartableWorkflow = (savedWorkflow: any): StartableWorkflow => {
    const nodes = savedWorkflow.nodes || [];
    
    // Find the first/start node with an assigned user
    const startNode = nodes.find((node: any) => {
      return node?.data && node.data.assignedTo && (
        node.data.stepType === 'trigger' || 
        node.data.stepType === 'start' ||
        node.position?.y === Math.min(...nodes.filter((n: any) => n?.position?.y !== undefined).map((n: any) => n.position.y))
      );
    }) || nodes.find((node: any) => node?.data?.assignedTo) || nodes[0];

    return {
      id: savedWorkflow.id,
      name: savedWorkflow.name,
      description: savedWorkflow.description,
      is_reusable: savedWorkflow.is_reusable || false,
      start_step: {
        id: startNode?.id || 'start',
        name: startNode?.data?.label || 'Start Step',
        description: startNode?.data?.description || '',
        metadata: startNode?.data?.metadata || {}
      }
    };
  };

  // Get the assigned user for the first step
  const getAssignedUser = (workflow: any) => {
    const nodes = workflow.nodes || [];
    const startNode = nodes.find((node: any) => node?.data?.assignedTo);
    return startNode?.data?.assignedTo || 'Unassigned';
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
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{workflow.name}</h4>
                      <Badge 
                        variant={workflow.is_reusable ? "default" : "secondary"}
                        className={workflow.is_reusable ? "bg-green-100 text-green-800 border-green-300" : "bg-orange-100 text-orange-800 border-orange-300"}
                      >
                        {workflow.is_reusable ? (
                          <>
                            <Repeat className="h-3 w-3 mr-1" />
                            Reusable
                          </>
                        ) : (
                          'One-time'
                        )}
                      </Badge>
                    </div>
                    {workflow.description && (
                      <p className="text-xs text-gray-600 mb-2">{workflow.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Updated {formatDistanceToNow(new Date(workflow.updated_at), { addSuffix: true })}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Assigned to: {getAssignedUser(workflow)}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {workflow.nodes.length} nodes
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {onStartWorkflow && (
                      <StartWorkflowDialog
                        workflow={convertToStartableWorkflow(workflow)}
                        onStartWorkflow={onStartWorkflow}
                      />
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        console.log('Open button clicked for workflow:', workflow.id);
                        handleOpenWorkflow(workflow.id);
                      }}
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
