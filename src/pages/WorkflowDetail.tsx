
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, User, Clock } from 'lucide-react';
import { format } from 'date-fns';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function WorkflowDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: workflow, isLoading, error } = useQuery({
    queryKey: ['workflow', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflows')
        .select(`
          *,
          workflow_steps (
            id,
            name,
            description,
            step_order,
            status,
            estimated_hours,
            actual_hours,
            assigned_to,
            dependencies
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: profiles } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email');
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading workflow...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !workflow) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">Failed to load workflow</div>
        </div>
      </DashboardLayout>
    );
  }

  const getAssignedUserName = (userId: string | null) => {
    if (!userId || !profiles) return 'Unassigned';
    const profile = profiles.find(p => p.id === userId);
    return profile ? `${profile.first_name} ${profile.last_name}` : 'Unknown User';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'active': return 'bg-blue-500';
      case 'paused': return 'bg-yellow-500';
      case 'draft': return 'bg-gray-500';
      case 'archived': return 'bg-gray-400';
      default: return 'bg-gray-500';
    }
  };

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'blocked': return 'bg-red-500';
      case 'cancelled': return 'bg-gray-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const sortedSteps = workflow.workflow_steps?.sort((a, b) => a.step_order - b.step_order) || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">{workflow.name}</h1>
        </div>

        {/* Workflow Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Workflow Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(workflow.status)}>
                  {workflow.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getPriorityColor(workflow.priority)}>
                  {workflow.priority} priority
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{getAssignedUserName(workflow.assigned_to)}</span>
              </div>
              {workflow.due_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    Due: {format(new Date(workflow.due_date), 'MMM dd, yyyy')}
                  </span>
                </div>
              )}
            </div>

            {workflow.description && (
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-gray-600">{workflow.description}</p>
              </div>
            )}

            {workflow.tags && workflow.tags.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {workflow.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="text-sm text-gray-500">
              Created: {format(new Date(workflow.created_at), 'MMM dd, yyyy at h:mm a')}
            </div>
          </CardContent>
        </Card>

        {/* Workflow Steps */}
        <Card>
          <CardHeader>
            <CardTitle>Steps ({sortedSteps.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {sortedSteps.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No steps defined for this workflow</p>
            ) : (
              <div className="space-y-4">
                {sortedSteps.map((step, index) => (
                  <div key={step.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium">{step.name}</h4>
                          {step.description && (
                            <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                          )}
                        </div>
                      </div>
                      <Badge className={getStepStatusColor(step.status)}>
                        {step.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="ml-11 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span>{getAssignedUserName(step.assigned_to)}</span>
                      </div>
                      {step.estimated_hours && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>Est: {step.estimated_hours}h</span>
                          {step.actual_hours && (
                            <span className="text-gray-500">/ Actual: {step.actual_hours}h</span>
                          )}
                        </div>
                      )}
                      {step.dependencies && step.dependencies.length > 0 && (
                        <div className="text-gray-500">
                          Dependencies: {step.dependencies.length}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
