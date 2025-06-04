import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWorkflowAssignments } from '@/hooks/useWorkflowAssignments';
import { useWorkflowInstances } from '@/hooks/useWorkflowInstances';
import { useAuth } from '@/hooks/useAuth';
import { Clock, CheckCircle, PlayCircle, XCircle, Calendar, User, ArrowRight, History, Play } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { StartableWorkflows } from '@/components/workflow/StartableWorkflows';
import { SavedWorkflows } from '@/components/dashboard/SavedWorkflows';
import { CreateAssignmentsButton } from '@/components/workflow/CreateAssignmentsButton';
import { toast } from 'sonner';
import { useSavedWorkflows } from '@/hooks/useSavedWorkflows';

export default function DashboardContent() {
  const { assignments, isLoading: assignmentsLoading } = useWorkflowAssignments();
  const { startableWorkflows, isLoading: workflowsLoading, startWorkflow } = useWorkflowInstances();
  const { profile } = useAuth();
  const { workflows } = useSavedWorkflows();

  // Add debugging
  console.log('Dashboard assignments:', assignments);
  console.log('Dashboard assignmentsLoading:', assignmentsLoading);
  console.log('Dashboard profile:', profile);

  const pendingAssignments = assignments.filter(a => a.status === 'pending');
  const inProgressAssignments = assignments.filter(a => a.status === 'in_progress');
  const completedAssignments = assignments.filter(a => a.status === 'completed');
  const recentAssignments = assignments.slice(0, 5);

  console.log('Filtered assignments:', {
    pending: pendingAssignments.length,
    inProgress: inProgressAssignments.length,
    completed: completedAssignments.length,
    total: assignments.length
  });

  const handleStartWorkflow = async (workflowId: string, startData: any) => {
    try {
      await startWorkflow(workflowId, startData);
      toast.success('Workflow started successfully!');
    } catch (error) {
      console.error('Failed to start workflow:', error);
      toast.error('Failed to start workflow. Please try again.');
    }
  };

  const handleOpenWorkflow = (workflowId: string) => {
    // Navigate to workflow builder tab with the workflow ID as a URL parameter
    window.location.hash = 'workflow-builder';
    const url = new URL(window.location.href);
    url.searchParams.set('workflowId', workflowId);
    window.history.pushState({}, '', url.toString());
    
    // Trigger a page reload to ensure the workflow builder loads with the correct workflow
    window.location.reload();
  };

  const handleViewAllTasks = () => {
    window.location.hash = 'workflow-inbox';
  };

  if (assignmentsLoading || workflowsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {profile?.first_name || profile?.email}</p>
        </div>
        <Button onClick={handleViewAllTasks} className="bg-blue-600 hover:bg-blue-700">
          <ArrowRight className="h-4 w-4 mr-2" />
          View All Tasks
        </Button>
      </div>

      {/* Debug info - remove this after testing */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-medium text-yellow-800">Debug Info:</h3>
        <p className="text-sm text-yellow-700">Total assignments: {assignments.length}</p>
        <p className="text-sm text-yellow-700">Pending: {pendingAssignments.length}</p>
        <p className="text-sm text-yellow-700">In Progress: {inProgressAssignments.length}</p>
        <p className="text-sm text-yellow-700">Completed: {completedAssignments.length}</p>
        <p className="text-sm text-yellow-700">User ID: {profile?.id}</p>
      </div>

      {/* Manual Assignment Creation Section */}
      {workflows.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-800 mb-3">Create Missing Assignments</h3>
          <p className="text-sm text-blue-700 mb-4">
            If you have workflows with assigned steps but no assignment records, click below to create them:
          </p>
          <div className="flex gap-3">
            {workflows.map(workflow => (
              <div key={workflow.id} className="flex items-center gap-2">
                <span className="text-sm font-medium">{workflow.name}:</span>
                <CreateAssignmentsButton 
                  workflowId={workflow.id} 
                  workflowName={workflow.name}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Startable Workflows Section */}
      {startableWorkflows.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <StartableWorkflows
            workflows={startableWorkflows}
            onStartWorkflow={handleStartWorkflow}
            isLoading={workflowsLoading}
          />
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <span className="text-2xl font-bold">{pendingAssignments.length}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">{inProgressAssignments.length}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">{completedAssignments.length}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Available Workflows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Play className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">{startableWorkflows.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Saved Workflows */}
        <SavedWorkflows onOpenWorkflow={handleOpenWorkflow} />

        {/* My Assigned Steps (Pending Actions) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              My Assigned Steps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingAssignments.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500">No pending assignments</p>
                <p className="text-xs text-gray-400 mt-2">
                  Total assignments loaded: {assignments.length}
                </p>
              </div>
            ) : (
              pendingAssignments.slice(0, 3).map((assignment) => (
                <div key={assignment.id} className="border rounded-lg p-3 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{assignment.workflow_steps.name}</h4>
                    <Badge className={getStatusColor(assignment.status)}>
                      {assignment.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">
                    Workflow: {assignment.workflow_steps.workflows.name}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    Assigned {formatDistanceToNow(new Date(assignment.created_at), { addSuffix: true })}
                  </div>
                </div>
              ))
            )}
            {pendingAssignments.length > 3 && (
              <Button variant="outline" size="sm" onClick={handleViewAllTasks} className="w-full">
                View {pendingAssignments.length - 3} more pending tasks
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recently Completed and Workflow History sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recently Completed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Recently Completed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {completedAssignments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No completed assignments yet</p>
            ) : (
              completedAssignments.slice(0, 3).map((assignment) => (
                <div key={assignment.id} className="border rounded-lg p-3 bg-green-50">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{assignment.workflow_steps.name}</h4>
                    <Badge className="bg-green-100 text-green-800">
                      Completed
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">
                    Workflow: {assignment.workflow_steps.workflows.name}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <CheckCircle className="h-3 w-3" />
                    Completed {assignment.completed_at && formatDistanceToNow(new Date(assignment.completed_at), { addSuffix: true })}
                  </div>
                  {assignment.notes && (
                    <p className="text-xs text-gray-600 mt-2 bg-white p-2 rounded">
                      {assignment.notes}
                    </p>
                  )}
                </div>
              ))
            )}
            {completedAssignments.length > 3 && (
              <Button variant="outline" size="sm" onClick={handleViewAllTasks} className="w-full">
                View {completedAssignments.length - 3} more completed tasks
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Workflow History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-purple-500" />
              Workflow History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAssignments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No workflow history yet</p>
              ) : (
                recentAssignments.map((assignment) => (
                  <div key={assignment.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(assignment.status)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm truncate">{assignment.workflow_steps.name}</h4>
                        <Badge className={getStatusColor(assignment.status)} variant="secondary">
                          {assignment.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 truncate">
                        {assignment.workflow_steps.workflows.name}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-xs text-gray-500">
                        {assignment.status === 'completed' && assignment.completed_at 
                          ? `Completed ${formatDistanceToNow(new Date(assignment.completed_at), { addSuffix: true })}`
                          : `Assigned ${formatDistanceToNow(new Date(assignment.created_at), { addSuffix: true })}`
                        }
                      </div>
                      {assignment.due_date && (
                        <div className="text-xs text-orange-600">
                          Due {formatDistanceToNow(new Date(assignment.due_date), { addSuffix: true })}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {assignments.length > 5 && (
              <div className="mt-4 pt-4 border-t">
                <Button variant="outline" onClick={handleViewAllTasks} className="w-full">
                  View Complete Workflow History ({assignments.length} total assignments)
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-4 w-4 text-orange-500" />;
    case 'in_progress':
      return <PlayCircle className="h-4 w-4 text-blue-500" />;
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'skipped':
      return <XCircle className="h-4 w-4 text-gray-500" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-orange-100 text-orange-800';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'skipped':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
