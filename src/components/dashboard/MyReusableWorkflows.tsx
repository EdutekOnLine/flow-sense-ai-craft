
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMyReusableWorkflows } from '@/hooks/useMyReusableWorkflows';
import { useUsers } from '@/hooks/useUsers';
import { StartWorkflowDialog } from '@/components/workflow/StartWorkflowDialog';
import { Repeat, Calendar, User, Play } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { StartableWorkflow } from '@/hooks/useWorkflowInstances';

interface MyReusableWorkflowsProps {
  onStartWorkflow?: (workflowId: string, startData: any) => Promise<void>;
}

export function MyReusableWorkflows({ onStartWorkflow }: MyReusableWorkflowsProps) {
  const { workflows, isLoading } = useMyReusableWorkflows();
  const { data: users } = useUsers();

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
      <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Repeat className="h-5 w-5 text-green-600" />
            My Reusable Workflows
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Repeat className="h-5 w-5 text-green-600" />
          My Reusable Workflows
        </CardTitle>
        <p className="text-sm text-green-700 mt-2">
          Workflows you can start multiple times
        </p>
      </CardHeader>
      <CardContent>
        {workflows.length === 0 ? (
          <div className="text-center py-8">
            <Repeat className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <p className="text-green-600 mb-2">No reusable workflows available</p>
            <p className="text-sm text-green-500">You'll see reusable workflows you can start here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {workflows.map((workflow) => (
              <div
                key={workflow.id}
                className="border border-green-200 rounded-lg p-4 bg-white hover:bg-green-25 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm text-green-800">{workflow.name}</h4>
                      <Badge className="bg-green-100 text-green-800 border-green-300">
                        <Repeat className="h-3 w-3 mr-1" />
                        Reusable
                      </Badge>
                    </div>
                    {workflow.description && (
                      <p className="text-xs text-green-600 mb-2">{workflow.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-green-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Updated {formatDistanceToNow(new Date(workflow.updated_at), { addSuffix: true })}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Starts with: {getAssignedUserName(workflow)}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {workflow.nodes.length} steps
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {onStartWorkflow && (
                      <StartWorkflowDialog
                        workflow={convertToStartableWorkflow(workflow)}
                        onStartWorkflow={onStartWorkflow}
                        trigger={
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Start
                          </Button>
                        }
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
