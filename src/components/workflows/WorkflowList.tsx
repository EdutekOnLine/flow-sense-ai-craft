import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Clock, 
  User, 
  Calendar, 
  MoreHorizontal,
  Play,
  Pause,
  CheckCircle,
  Copy,
  Trash2,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import type { Database } from '@/integrations/supabase/types';

type WorkflowStatus = Database['public']['Enums']['workflow_status'];
type TaskPriority = Database['public']['Enums']['task_priority'];

interface WorkflowData {
  id: string;
  name: string;
  description: string | null;
  status: WorkflowStatus;
  priority: TaskPriority;
  due_date: string | null;
  created_at: string;
  assigned_to: string | null;
  tags: string[] | null;
  created_by: string;
  creator: {
    first_name: string | null;
    last_name: string | null;
    email: string;
  } | null;
  assignee: {
    first_name: string | null;
    last_name: string | null;
    email: string;
  } | null;
  workflow_steps: {
    id: string;
    status: string;
  }[];
}

export default function WorkflowList() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteWorkflowId, setDeleteWorkflowId] = useState<string | null>(null);

  const { data: workflows = [], isLoading } = useQuery({
    queryKey: ['workflows'],
    queryFn: async () => {
      // First get workflows
      const { data: workflowsData, error: workflowsError } = await supabase
        .from('workflows')
        .select(`
          *,
          workflow_steps(id, status)
        `)
        .order('created_at', { ascending: false });
      
      if (workflowsError) throw workflowsError;

      // Get all unique user IDs
      const userIds = new Set<string>();
      workflowsData?.forEach(workflow => {
        userIds.add(workflow.created_by);
        if (workflow.assigned_to) {
          userIds.add(workflow.assigned_to);
        }
      });

      // Fetch profiles for these users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .in('id', Array.from(userIds));

      if (profilesError) throw profilesError;

      // Create a map of user ID to profile
      const profileMap = new Map();
      profilesData?.forEach(profile => {
        profileMap.set(profile.id, profile);
      });

      // Combine the data
      const enrichedWorkflows = workflowsData?.map(workflow => ({
        ...workflow,
        creator: profileMap.get(workflow.created_by) || null,
        assignee: workflow.assigned_to ? profileMap.get(workflow.assigned_to) || null : null
      }));

      return enrichedWorkflows as WorkflowData[];
    },
  });

  // Duplicate workflow mutation
  const duplicateWorkflow = useMutation({
    mutationFn: async (workflowId: string) => {
      // Get the original workflow with its steps
      const { data: originalWorkflow, error: workflowError } = await supabase
        .from('workflows')
        .select(`
          *,
          workflow_steps(*)
        `)
        .eq('id', workflowId)
        .single();

      if (workflowError) throw workflowError;

      // Create new workflow
      const { data: newWorkflow, error: newWorkflowError } = await supabase
        .from('workflows')
        .insert([{
          name: `${originalWorkflow.name} (Copy)`,
          description: originalWorkflow.description,
          priority: originalWorkflow.priority,
          due_date: null, // Reset due date for copy
          assigned_to: null, // Reset assignment for copy
          created_by: profile?.id,
          tags: originalWorkflow.tags,
          status: 'draft' as const
        }])
        .select()
        .single();

      if (newWorkflowError) throw newWorkflowError;

      // Duplicate workflow steps if any exist
      if (originalWorkflow.workflow_steps && originalWorkflow.workflow_steps.length > 0) {
        const stepsData = originalWorkflow.workflow_steps.map((step: any) => ({
          workflow_id: newWorkflow.id,
          name: step.name,
          description: step.description,
          step_order: step.step_order,
          assigned_to: null, // Reset assignment for copy
          estimated_hours: step.estimated_hours,
          dependencies: step.dependencies,
          status: 'pending' as const
        }));

        const { error: stepsError } = await supabase
          .from('workflow_steps')
          .insert(stepsData);

        if (stepsError) throw stepsError;
      }

      return newWorkflow;
    },
    onSuccess: () => {
      toast({
        title: 'Workflow duplicated!',
        description: 'The workflow has been successfully duplicated.',
      });
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error duplicating workflow',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete workflow mutation
  const deleteWorkflow = useMutation({
    mutationFn: async (workflowId: string) => {
      const { error } = await supabase
        .from('workflows')
        .delete()
        .eq('id', workflowId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Workflow deleted!',
        description: 'The workflow has been successfully deleted.',
      });
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      setDeleteWorkflowId(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error deleting workflow',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'paused': return <Pause className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStepsSummary = (steps: { status: string }[]) => {
    const completed = steps.filter(step => step.status === 'completed').length;
    const total = steps.length;
    return { completed, total };
  };

  const getDisplayName = (profile: { first_name: string | null; last_name: string | null; email: string } | null) => {
    if (!profile) return 'Unknown User';
    
    const firstName = profile.first_name?.trim();
    const lastName = profile.last_name?.trim();
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else if (lastName) {
      return lastName;
    } else {
      // Extract name from email if no first/last name
      const emailName = profile.email.split('@')[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
  };

  const handleWorkflowAction = (action: string, workflowId: string) => {
    console.log(`${action} workflow:`, workflowId);
    
    switch (action) {
      case 'view':
        toast({
          title: 'View Workflow',
          description: 'Workflow detail view will be implemented soon.',
        });
        break;
      case 'duplicate':
        duplicateWorkflow.mutate(workflowId);
        break;
      case 'delete':
        setDeleteWorkflowId(workflowId);
        break;
      default:
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">All Workflows</h2>
          <p className="text-gray-600">Manage and track your team's workflows</p>
        </div>
        <Button>
          Create New Workflow
        </Button>
      </div>

      {workflows.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No workflows yet</h3>
            <p className="text-gray-600 mb-4">
              Create your first workflow to get started with process management.
            </p>
            <Button>Create New Workflow</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflows.map((workflow) => {
            const stepsSummary = getStepsSummary(workflow.workflow_steps);
            
            return (
              <Card key={workflow.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{workflow.name}</CardTitle>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                        {workflow.description || 'No description provided'}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleWorkflowAction('view', workflow.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleWorkflowAction('duplicate', workflow.id)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleWorkflowAction('delete', workflow.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(workflow.status)}>
                      {getStatusIcon(workflow.status)}
                      <span className="ml-1">{workflow.status.toUpperCase()}</span>
                    </Badge>
                    <Badge className={getPriorityColor(workflow.priority)}>
                      {workflow.priority.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Progress */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">
                        {stepsSummary.completed}/{stepsSummary.total} steps
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ 
                          width: stepsSummary.total > 0 
                            ? `${(stepsSummary.completed / stepsSummary.total) * 100}%` 
                            : '0%' 
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <User className="h-4 w-4" />
                      <span>
                        Created by {getDisplayName(workflow.creator)}
                      </span>
                    </div>
                    
                    {workflow.assignee && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="h-4 w-4" />
                        <span>
                          Assigned to {getDisplayName(workflow.assignee)}
                        </span>
                      </div>
                    )}
                    
                    {workflow.due_date && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>Due {new Date(workflow.due_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {workflow.tags && workflow.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {workflow.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {workflow.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{workflow.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteWorkflowId !== null} onOpenChange={() => setDeleteWorkflowId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the workflow
              and all its associated steps and data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteWorkflowId && deleteWorkflow.mutate(deleteWorkflowId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
