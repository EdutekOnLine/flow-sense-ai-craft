import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Calendar, User, Clock, Edit, Save, X } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StepStatusManager from '@/components/workflows/StepStatusManager';
import WorkflowStepEditor from '@/components/workflows/WorkflowStepEditor';

export default function WorkflowDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    priority: '',
    due_date: '',
    assigned_to: '',
    tags: [] as string[],
    steps: [] as any[]
  });

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

  const updateWorkflowMutation = useMutation({
    mutationFn: async (updatedData: any) => {
      const { steps, ...workflowData } = updatedData;
      
      // Update workflow
      const { error: workflowError } = await supabase
        .from('workflows')
        .update(workflowData)
        .eq('id', id);
      
      if (workflowError) throw workflowError;

      // Handle steps - delete existing and insert new ones
      if (steps) {
        // Delete existing steps
        const { error: deleteError } = await supabase
          .from('workflow_steps')
          .delete()
          .eq('workflow_id', id);
        
        if (deleteError) throw deleteError;

        // Insert new steps
        if (steps.length > 0) {
          const stepsToInsert = steps.map((step: any) => ({
            workflow_id: id,
            name: step.name,
            description: step.description || null,
            step_order: step.step_order,
            status: step.status,
            estimated_hours: step.estimated_hours,
            assigned_to: step.assigned_to,
            dependencies: step.dependencies
          }));

          const { error: insertError } = await supabase
            .from('workflow_steps')
            .insert(stepsToInsert);
          
          if (insertError) throw insertError;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow', id] });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Workflow updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update workflow",
        variant: "destructive",
      });
    },
  });

  const handleEdit = () => {
    if (workflow) {
      setEditForm({
        name: workflow.name,
        description: workflow.description || '',
        priority: workflow.priority,
        due_date: workflow.due_date ? format(new Date(workflow.due_date), 'yyyy-MM-dd') : '',
        assigned_to: workflow.assigned_to || 'unassigned',
        tags: workflow.tags || [],
        steps: workflow.workflow_steps || []
      });
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    const updateData: any = {
      name: editForm.name,
      description: editForm.description || null,
      priority: editForm.priority,
      assigned_to: editForm.assigned_to === 'unassigned' ? null : editForm.assigned_to,
      tags: editForm.tags.length > 0 ? editForm.tags : null,
      updated_at: new Date().toISOString(),
      steps: editForm.steps
    };

    if (editForm.due_date) {
      updateData.due_date = new Date(editForm.due_date).toISOString();
    } else {
      updateData.due_date = null;
    }

    updateWorkflowMutation.mutate(updateData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      name: '',
      description: '',
      priority: '',
      due_date: '',
      assigned_to: '',
      tags: [],
      steps: []
    });
  };

  const handleTagAdd = (tag: string) => {
    if (tag.trim() && !editForm.tags.includes(tag.trim())) {
      setEditForm(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }));
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setEditForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

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
        <div className="flex items-center justify-between">
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
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <Button onClick={handleEdit} className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Edit Workflow
              </Button>
            ) : (
              <>
                <Button onClick={handleSave} disabled={updateWorkflowMutation.isPending} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save
                </Button>
                <Button variant="outline" onClick={handleCancel} className="flex items-center gap-2">
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Workflow Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Workflow Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Workflow name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Workflow description"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Priority</label>
                    <Select value={editForm.priority} onValueChange={(value) => setEditForm(prev => ({ ...prev, priority: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Assigned To</label>
                    <Select value={editForm.assigned_to} onValueChange={(value) => setEditForm(prev => ({ ...prev, assigned_to: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select user" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {profiles?.map((profile) => (
                          <SelectItem key={profile.id} value={profile.id}>
                            {profile.first_name} {profile.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Due Date</label>
                    <Input
                      type="date"
                      value={editForm.due_date}
                      onChange={(e) => setEditForm(prev => ({ ...prev, due_date: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Tags</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {editForm.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        {tag}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => handleTagRemove(tag)} />
                      </Badge>
                    ))}
                  </div>
                  <Input
                    placeholder="Add tag and press Enter"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleTagAdd(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>

                {/* Workflow Steps Editor */}
                <WorkflowStepEditor
                  steps={editForm.steps}
                  onStepsChange={(steps) => setEditForm(prev => ({ ...prev, steps }))}
                  profiles={profiles}
                />
              </div>
            ) : (
              <>
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
              </>
            )}
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
                      <div className="flex items-center gap-2">
                        <StepStatusManager 
                          stepId={step.id}
                          currentStatus={step.status}
                          workflowId={id!}
                        />
                      </div>
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
