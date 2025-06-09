
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useWorkflowInstances } from '@/hooks/useWorkflowInstances';
import { formatDistanceToNow } from 'date-fns';

export function WorkflowInstanceManager() {
  const { 
    instances, 
    isLoading, 
    cancelWorkflowInstance, 
    completeWorkflowInstance 
  } = useWorkflowInstances();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded w-24"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (instances.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Workflow Instances</h3>
          <p className="text-gray-600">You haven't started any workflows yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Workflow Instances</h2>
        <Badge variant="secondary">{instances.length} total</Badge>
      </div>

      {instances.map((instance) => (
        <Card key={instance.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(instance.status)}
                Workflow Instance
              </CardTitle>
              <Badge className={getStatusColor(instance.status)}>
                {instance.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Started:</span>
                  <span className="ml-2 text-gray-600">
                    {formatDistanceToNow(new Date(instance.created_at), { addSuffix: true })}
                  </span>
                </div>
                {instance.completed_at && (
                  <div>
                    <span className="font-medium">Completed:</span>
                    <span className="ml-2 text-gray-600">
                      {formatDistanceToNow(new Date(instance.completed_at), { addSuffix: true })}
                    </span>
                  </div>
                )}
              </div>

              {instance.status === 'active' && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => completeWorkflowInstance(instance.id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => cancelWorkflowInstance(instance.id)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
