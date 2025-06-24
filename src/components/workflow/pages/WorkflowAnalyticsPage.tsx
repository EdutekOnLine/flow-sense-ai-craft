
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWorkflowAnalytics } from '@/hooks/useWorkflowAnalytics';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  CheckSquare, 
  Calendar,
  Target,
  Clock,
  FileText,
  Activity,
  Workflow
} from 'lucide-react';

export function WorkflowAnalyticsPage() {
  const { data, isLoading } = useWorkflowAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-64 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { analytics, statusBreakdown, stepStatusBreakdown, topTemplates, assignmentDistribution, recentActivity } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Workflow Analytics</h1>
        <p className="text-muted-foreground">Insights and metrics for your workflow management</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Workflows</p>
                <p className="text-2xl font-bold">{analytics.totalWorkflows}</p>
              </div>
              <Workflow className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Instances</p>
                <p className="text-2xl font-bold">{analytics.activeInstances}</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">{analytics.completionRate}%</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Completion Time</p>
                <p className="text-2xl font-bold">{analytics.averageCompletionTime}h</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Workflow Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Workflow Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(statusBreakdown).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={
                    status === 'completed' ? 'default' :
                    status === 'active' ? 'secondary' :
                    status === 'draft' ? 'outline' : 'destructive'
                  }>
                    {status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{count}</span>
                  <span className="text-sm text-muted-foreground">
                    ({analytics.totalWorkflows > 0 ? Math.round((count / analytics.totalWorkflows) * 100) : 0}%)
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Step Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              Step Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(stepStatusBreakdown).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={
                    status === 'completed' ? 'default' :
                    status === 'in_progress' ? 'secondary' :
                    status === 'pending' ? 'outline' : 'destructive'
                  }>
                    {status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{count}</span>
                  <span className="text-sm text-muted-foreground">
                    ({analytics.totalSteps > 0 ? Math.round((count / analytics.totalSteps) * 100) : 0}%)
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Popular Templates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topTemplates.length > 0 ? (
              topTemplates.map((template, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{template.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {template.completion_rate}% completion rate
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-medium">{template.usage}</span>
                    <p className="text-sm text-muted-foreground">uses</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No templates found</p>
            )}
          </CardContent>
        </Card>

        {/* Assignment Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Assignment Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {assignmentDistribution.length > 0 ? (
              assignmentDistribution.slice(0, 5).map((user, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{user.user_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {user.completed} completed, {user.pending} pending
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-medium">{user.total_assignments}</span>
                    <p className="text-sm text-muted-foreground">total</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No assignments found</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Workflow className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">{analytics.totalTemplates}</p>
              <p className="text-sm text-blue-700">Total Templates</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckSquare className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">{analytics.assignmentsCompleted}</p>
              <p className="text-sm text-green-700">Completed Tasks</p>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Calendar className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-orange-600">{analytics.assignmentsPending}</p>
              <p className="text-sm text-orange-700">Pending Tasks</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <FileText className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-600">{analytics.myTemplates}</p>
              <p className="text-sm text-purple-700">My Templates</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.title}</p>
                    {activity.user && (
                      <p className="text-sm text-muted-foreground">by {activity.user}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleDateString()} at{' '}
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No recent activity</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
