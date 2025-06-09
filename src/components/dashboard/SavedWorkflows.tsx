
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSavedWorkflows } from '@/hooks/useSavedWorkflows';
import { useWorkflowPermissions } from '@/hooks/useWorkflowPermissions';
import { useUsers } from '@/hooks/useUsers';
import { useAuth } from '@/hooks/useAuth';
import { StartWorkflowDialog } from '@/components/workflow/StartWorkflowDialog';
import { Workflow, Edit, Trash2, Calendar, User, Repeat } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { StartableWorkflow } from '@/hooks/useWorkflowInstances';

interface SavedWorkflowsProps {
  onOpenWorkflow?: (workflowId: string) => void;
  onStartWorkflow?: (workflowId: string, startData: any) => Promise<void>;
}

export function SavedWorkflows({ onOpenWorkflow, onStartWorkflow }: SavedWorkflowsProps) {
  const { workflows, isLoading, deleteWorkflow } = useSavedWorkflows();
  const { canEditWorkflows } = useWorkflowPermissions();
  const { profile } = useAuth();
  const { data: users } = useUsers();

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

  // Get the assigned user name for the first step
  const getAssignedUserName = (workflow: any) => {
    const nodes = workflow.nodes || [];
    const startNode = nodes.find((node: any) => node?.data?.assignedTo);
    const assignedUserId = startNode?.data?.assignedTo;
    
    if (!assignedUserId) {
      return 'Unassigned';
    }
    
    const user = users?.find(u => u.id === assignedUserId);
    if (user) {
      const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ');
      return fullName || user.email;
    }
    
    return assignedUserId; // Fallback to ID if user not found
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div>
      {workflows.length === 0 ? (
        <div className="text-center py-8">
          <Workflow className="h-12 w-12 text-purple-400 mx-auto mb-4" />
          <p className="text-purple-600 mb-2">No saved workflows yet</p>
          <p className="text-sm text-purple-500">Create and save your first workflow in the Workflow Builder</p>
        </div>
      ) : (
        <div className="space-y-4">
          {workflows.slice(0, 5).map((workflow) => (
            <div
              key={workflow.id}
              className="border border-purple-200 rounded-lg p-4 bg-white hover:bg-purple-25 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm text-purple-800">{workflow.name}</h4>
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
                    <p className="text-xs text-purple-600 mb-2">{workflow.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-purple-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Updated {formatDistanceToNow(new Date(workflow.updated_at), { addSuffix: true })}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Assigned to: {getAssignedUserName(workflow)}
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
            <div className="text-center pt-4 border-t border-purple-200">
              <p className="text-sm text-purple-600">
                And {workflows.length - 5} more workflows...
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
