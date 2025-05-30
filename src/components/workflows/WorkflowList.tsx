
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Calendar, User, Eye, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export default function WorkflowList() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: workflows, isLoading, error } = useQuery({
    queryKey: ['workflows'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflows')
        .select(`
          *,
          workflow_steps!inner(id)
        `)
        .order('created_at', { ascending: false });

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

  const deleteWorkflowMutation = useMutation({
    mutationFn: async (workflowId: string) => {
      console.log('Starting deletion for workflow:', workflowId);
      
      // First delete workflow steps
      const { error: stepsError } = await supabase
        .from('workflow_steps')
        .delete()
        .eq('workflow_id', workflowId);
      
      if (stepsError) {
        console.error('Error deleting steps:', stepsError);
        throw stepsError;
      }

      console.log('Steps deleted successfully');

      // Then delete the workflow
      const { error: workflowError } = await supabase
        .from('workflows')
        .delete()
        .eq('id', workflowId);
      
      if (workflowError) {
        console.error('Error deleting workflow:', workflowError);
        throw workflowError;
      }

      console.log('Workflow deleted successfully');
    },
    onSuccess: () => {
      console.log('Delete mutation completed successfully');
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      toast({
        title: "Success",
        description: "Workflow deleted successfully",
      });
    },
    onError: (error) => {
      console.error('Delete mutation error:', error);
      toast({
        title: "Error",
        description: "Failed to delete workflow",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading workflows...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-red-500">Failed to load workflows</div>
        </CardContent>
      </Card>
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

  const handleViewDetails = (workflowId: string) => {
    console.log('Navigating to workflow:', workflowId);
    navigate(`/workflow/${workflowId}`);
  };

  const handleEdit = (workflowId: string) => {
    console.log('Editing workflow:', workflowId);
    navigate(`/workflow/${workflowId}?edit=true`);
  };

  const handleDelete = (workflowId: string) => {
    console.log('Delete button clicked for workflow:', workflowId);
    deleteWorkflowMutation.mutate(workflowId);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>All Workflows</CardTitle>
        </CardHeader>
        <CardContent>
          {!workflows || workflows.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No workflows found</p>
              <p className="text-sm text-gray-400">Create your first workflow to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {workflows.map((workflow) => (
                <div key={workflow.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{workflow.name}</h3>
                      {workflow.description && (
                        <p className="text-gray-600 text-sm line-clamp-2">{workflow.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Badge className={getStatusColor(workflow.status)}>
                        {workflow.status}
                      </Badge>
                      <Badge className={getPriorityColor(workflow.priority)}>
                        {workflow.priority}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{getAssignedUserName(workflow.assigned_to)}</span>
                      </div>
                      {workflow.due_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Due: {format(new Date(workflow.due_date), 'MMM dd, yyyy')}</span>
                        </div>
                      )}
                      <div>
                        Steps: {workflow.workflow_steps?.length || 0}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleViewDetails(workflow.id);
                        }}
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleEdit(workflow.id);
                        }}
                        className="flex items-center gap-1"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Workflow</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{workflow.name}"? This action cannot be undone and will also delete all associated workflow steps.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(workflow.id)}
                              className="bg-red-600 hover:bg-red-700"
                              disabled={deleteWorkflowMutation.isPending}
                            >
                              {deleteWorkflowMutation.isPending ? 'Deleting...' : 'Delete'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  {workflow.tags && workflow.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {workflow.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
