
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
  Zap,
  Sparkles
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
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200"></div>
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
            </div>
            <p className="text-gray-600 animate-pulse">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Sparkles className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome to your Dashboard</h1>
        </div>
        <p className="text-gray-600">Here's what's happening with your workflows today</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800">Pending Tasks</CardTitle>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-700 mb-1">{pendingAssignments}</div>
            <p className="text-xs text-yellow-600 flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Awaiting your action
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-blue-400 bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">In Progress</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700 mb-1">{inProgressAssignments}</div>
            <p className="text-xs text-blue-600 flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Currently working on
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-green-400 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Completed</CardTitle>
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700 mb-1">{completedAssignments}</div>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Tasks finished
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-red-400 bg-gradient-to-br from-red-50 to-pink-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Overdue</CardTitle>
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-700 mb-1">{overdueTasks}</div>
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Need attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* My Assigned Steps */}
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-gray-900">My Assigned Steps</span>
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
              <div className="relative mb-6">
                <Briefcase className="h-16 w-16 text-gray-300 mx-auto" />
                <div className="absolute -top-2 -right-2 p-1 bg-blue-100 rounded-full">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No assignments yet</h3>
              <p className="text-gray-500 mb-4">Your workflow assignments will appear here</p>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {assignments.slice(0, 5).map((assignment, index) => (
                <div
                  key={assignment.id}
                  className="border border-gray-200 rounded-xl p-4 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-300 hover:shadow-md hover:border-blue-200 group"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    animation: 'slideInUp 0.5s ease-out forwards'
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                          {assignment.workflow_steps?.name}
                        </h4>
                        <div className="w-2 h-2 bg-blue-400 rounded-full group-hover:bg-blue-600 transition-colors"></div>
                      </div>
                      {assignment.workflow_steps?.description && (
                        <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                          {assignment.workflow_steps.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                          assignment.status === 'completed' ? 'bg-green-100 text-green-800 shadow-sm' :
                          assignment.status === 'in_progress' ? 'bg-blue-100 text-blue-800 shadow-sm' :
                          'bg-yellow-100 text-yellow-800 shadow-sm'
                        }`}>
                          {assignment.status.replace('_', ' ').toUpperCase()}
                        </span>
                        {assignment.due_date && (
                          <span className={`flex items-center gap-1 ${
                            new Date(assignment.due_date) < new Date() && assignment.status !== 'completed'
                              ? 'text-red-600 font-semibold'
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
                <div className="text-center pt-6 border-t border-gray-100">
                  <div className="inline-flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
                    <Sparkles className="h-4 w-4" />
                    <span>And {assignments.length - 5} more assignments...</span>
                  </div>
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
