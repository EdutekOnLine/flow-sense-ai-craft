
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
  Briefcase,
  Activity
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
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300"></div>
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
            </div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Activity className="h-5 w-5 text-blue-600" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>
        </div>
        <p className="text-gray-600">Track your workflow progress and manage tasks efficiently</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow duration-200 border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Pending Tasks</CardTitle>
            <div className="p-2 bg-amber-50 rounded-lg">
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">{pendingAssignments}</div>
            <p className="text-xs text-gray-600">Awaiting action</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-200 border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">In Progress</CardTitle>
            <div className="p-2 bg-blue-50 rounded-lg">
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">{inProgressAssignments}</div>
            <p className="text-xs text-gray-600">Currently active</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-200 border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Completed</CardTitle>
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">{completedAssignments}</div>
            <p className="text-xs text-gray-600">Successfully finished</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-200 border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Overdue</CardTitle>
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">{overdueTasks}</div>
            <p className="text-xs text-gray-600">Require attention</p>
          </CardContent>
        </Card>
      </div>

      {/* My Assigned Steps */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-gray-900">My Assigned Tasks</span>
            {assignments.length > 0 && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                {assignments.length}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {assignments.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-4">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No active assignments</h3>
              <p className="text-gray-500">Your workflow assignments will appear here when available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {assignments.slice(0, 5).map((assignment, index) => (
                <div
                  key={assignment.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200 group"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    animation: 'slideInUp 0.5s ease-out forwards'
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
                          {assignment.workflow_steps?.name}
                        </h4>
                      </div>
                      {assignment.workflow_steps?.description && (
                        <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                          {assignment.workflow_steps.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          assignment.status === 'completed' ? 'bg-green-100 text-green-800' :
                          assignment.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {assignment.status.replace('_', ' ').toUpperCase()}
                        </span>
                        {assignment.due_date && (
                          <span className={`flex items-center gap-1 ${
                            new Date(assignment.due_date) < new Date() && assignment.status !== 'completed'
                              ? 'text-red-600 font-medium'
                              : 'text-gray-500'
                          }`}>
                            <Clock className="h-3 w-3" />
                            Due {formatDistanceToNow(new Date(assignment.due_date), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {assignments.length > 5 && (
                <div className="text-center pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
                    +{assignments.length - 5} more assignments
                  </span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Workflows You Can Start */}
      <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <StartableWorkflows 
          workflows={startableWorkflows}
          onStartWorkflow={handleStartWorkflow}
          isLoading={workflowsLoading}
        />
      </div>

      {/* My Saved Workflows - Only show for users with workflow permissions */}
      {hasWorkflowPermissions && (
        <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <SavedWorkflows onOpenWorkflow={handleOpenWorkflow} />
        </div>
      )}
    </div>
  );
}
