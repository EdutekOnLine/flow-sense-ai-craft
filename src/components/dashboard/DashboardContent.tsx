
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWorkflowAssignments } from '@/hooks/useWorkflowAssignments';
import { useWorkflowInstances } from '@/hooks/useWorkflowInstances';
import { useWorkflowPermissions } from '@/hooks/useWorkflowPermissions';
import { SavedWorkflows } from './SavedWorkflows';
import { StartableWorkflows } from '../workflow/StartableWorkflows';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  TrendingUp,
  User,
  Briefcase
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function DashboardContent() {
  const { assignments, isLoading: assignmentsLoading } = useWorkflowAssignments();
  const { startableWorkflows, startWorkflow, isLoading: workflowsLoading } = useWorkflowInstances();
  const { hasWorkflowPermissions } = useWorkflowPermissions();

  const handleOpenWorkflow = (workflowId: string) => {
    // Navigate to workflow builder with the specific workflow
    window.location.href = `/?workflowId=${workflowId}#workflow-builder`;
  };

  const handleStartWorkflow = async (workflowId: string, startData: any) => {
    try {
      await startWorkflow(workflowId, startData);
    } catch (error) {
      console.error('Failed to start workflow:', error);
    }
  };

  // Calculate assignment statistics
  const pendingAssignments = assignments.filter(a => a.status === 'pending').length;
  const inProgressAssignments = assignments.filter(a => a.status === 'in_progress').length;
  const completedAssignments = assignments.filter(a => a.status === 'completed').length;
  const overdueTasks = assignments.filter(a => 
    a.due_date && 
    new Date(a.due_date) < new Date() && 
    a.status !== 'completed'
  ).length;

  if (assignmentsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingAssignments}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting your action
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressAssignments}</div>
            <p className="text-xs text-muted-foreground">
              Currently working on
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedAssignments}</div>
            <p className="text-xs text-muted-foreground">
              Tasks finished
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueTasks}</div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* My Assigned Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-500" />
            My Assigned Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No assignments yet</p>
              <p className="text-sm text-gray-400">Your workflow assignments will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {assignments.slice(0, 5).map((assignment) => (
                <div
                  key={assignment.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm mb-1">{assignment.workflow_step?.name}</h4>
                      {assignment.workflow_step?.description && (
                        <p className="text-xs text-gray-600 mb-2">{assignment.workflow_step.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          assignment.status === 'completed' ? 'bg-green-100 text-green-800' :
                          assignment.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {assignment.status.replace('_', ' ').toUpperCase()}
                        </span>
                        {assignment.due_date && (
                          <span className={`${
                            new Date(assignment.due_date) < new Date() && assignment.status !== 'completed'
                              ? 'text-red-600 font-medium'
                              : 'text-gray-500'
                          }`}>
                            Due {formatDistanceToNow(new Date(assignment.due_date), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {assignments.length > 5 && (
                <div className="text-center pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    And {assignments.length - 5} more assignments...
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Workflows You Can Start */}
      <StartableWorkflows 
        workflows={startableWorkflows}
        onStartWorkflow={handleStartWorkflow}
        isLoading={workflowsLoading}
      />

      {/* My Saved Workflows - Only show for users with workflow permissions */}
      {hasWorkflowPermissions && (
        <SavedWorkflows onOpenWorkflow={handleOpenWorkflow} />
      )}
    </div>
  );
}
