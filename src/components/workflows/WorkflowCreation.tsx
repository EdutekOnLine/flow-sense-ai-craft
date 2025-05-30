import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, X, ArrowUp, ArrowDown, Save, Users } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type TaskStatus = Database['public']['Enums']['task_status'];
type TaskPriority = Database['public']['Enums']['task_priority'];

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  assigned_to?: string;
  estimated_hours?: number;
  dependencies: string[];
}

interface WorkflowForm {
  name: string;
  description: string;
  priority: TaskPriority;
  due_date: string;
  assigned_to?: string;
  tags: string[];
  steps: WorkflowStep[];
}

export default function WorkflowCreation() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [form, setForm] = useState<WorkflowForm>({
    name: '',
    description: '',
    priority: 'medium',
    due_date: '',
    assigned_to: '',
    tags: [],
    steps: []
  });
  
  const [newTag, setNewTag] = useState('');
  const [currentStep, setCurrentStep] = useState<Partial<WorkflowStep>>({
    name: '',
    description: '',
    estimated_hours: undefined,
    assigned_to: '',
    dependencies: []
  });

  // Fetch team members for assignment
  const { data: teamMembers = [] } = useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, role')
        .order('first_name');
      
      if (error) throw error;
      return data;
    },
  });

  // Create workflow mutation
  const createWorkflow = useMutation({
    mutationFn: async (workflowData: WorkflowForm) => {
      // First create the workflow
      const { data: workflow, error: workflowError } = await supabase
        .from('workflows')
        .insert([{
          name: workflowData.name,
          description: workflowData.description,
          priority: workflowData.priority,
          due_date: workflowData.due_date || null,
          assigned_to: workflowData.assigned_to || null,
          created_by: profile?.id,
          tags: workflowData.tags,
          status: 'draft' as const
        }])
        .select()
        .single();
      
      if (workflowError) throw workflowError;

      // Then create the workflow steps
      if (workflowData.steps.length > 0) {
        const stepsData = workflowData.steps.map((step, index) => ({
          workflow_id: workflow.id,
          name: step.name,
          description: step.description,
          step_order: index + 1,
          assigned_to: step.assigned_to || null,
          estimated_hours: step.estimated_hours || null,
          dependencies: step.dependencies,
          status: 'pending' as TaskStatus
        }));

        const { error: stepsError } = await supabase
          .from('workflow_steps')
          .insert(stepsData);
        
        if (stepsError) throw stepsError;
      }
      
      return workflow;
    },
    onSuccess: () => {
      toast({
        title: 'Workflow created!',
        description: 'Your workflow has been successfully created.',
      });
      // Reset form
      setForm({
        name: '',
        description: '',
        priority: 'medium',
        due_date: '',
        assigned_to: '',
        tags: [],
        steps: []
      });
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error creating workflow',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const addTag = () => {
    if (newTag.trim() && !form.tags.includes(newTag.trim())) {
      setForm(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addStep = () => {
    if (currentStep.name?.trim()) {
      const newStep: WorkflowStep = {
        id: crypto.randomUUID(),
        name: currentStep.name,
        description: currentStep.description || '',
        assigned_to: currentStep.assigned_to || undefined,
        estimated_hours: currentStep.estimated_hours || undefined,
        dependencies: currentStep.dependencies || []
      };
      
      setForm(prev => ({
        ...prev,
        steps: [...prev.steps, newStep]
      }));
      
      setCurrentStep({
        name: '',
        description: '',
        estimated_hours: undefined,
        assigned_to: '',
        dependencies: []
      });
    }
  };

  const removeStep = (stepId: string) => {
    setForm(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== stepId)
    }));
  };

  const moveStep = (stepId: string, direction: 'up' | 'down') => {
    const currentIndex = form.steps.findIndex(step => step.id === stepId);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === form.steps.length - 1)
    ) {
      return;
    }

    const newSteps = [...form.steps];
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    [newSteps[currentIndex], newSteps[newIndex]] = [newSteps[newIndex], newSteps[currentIndex]];
    
    setForm(prev => ({ ...prev, steps: newSteps }));
  };

  const handleSubmit = () => {
    if (!form.name.trim()) {
      toast({
        title: 'Workflow name required',
        description: 'Please enter a name for your workflow.',
        variant: 'destructive',
      });
      return;
    }
    
    createWorkflow.mutate(form);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTeamMemberName = (userId: string) => {
    const member = teamMembers.find(m => m.id === userId);
    return member ? `${member.first_name} ${member.last_name}` : 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Workflow</h1>
          <p className="text-gray-600 mt-1">
            Design a new workflow with multiple steps and assign team members.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workflow Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Workflow Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Workflow Name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Product Launch Process"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the purpose and goals of this workflow..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={form.priority} onValueChange={(value: TaskPriority) => setForm(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={form.due_date}
                  onChange={(e) => setForm(prev => ({ ...prev, due_date: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="assigned_to">Assign to Team Member</Label>
              <Select value={form.assigned_to} onValueChange={(value) => setForm(prev => ({ ...prev, assigned_to: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team member (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.first_name} {member.last_name} ({member.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tags */}
            <div>
              <Label>Tags</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag..."
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  className="flex-1"
                />
                <Button onClick={addTag} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {form.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="flex items-center gap-1">
                    {tag}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workflow Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Priority</p>
              <Badge className={getPriorityColor(form.priority)}>
                {form.priority.toUpperCase()}
              </Badge>
            </div>
            
            {form.assigned_to && (
              <div>
                <p className="text-sm text-gray-600">Assigned to</p>
                <p className="font-medium">{getTeamMemberName(form.assigned_to)}</p>
              </div>
            )}
            
            <div>
              <p className="text-sm text-gray-600">Steps</p>
              <p className="font-medium">{form.steps.length} steps defined</p>
            </div>
            
            {form.tags.length > 0 && (
              <div>
                <p className="text-sm text-gray-600">Tags</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {form.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Button 
              onClick={handleSubmit} 
              disabled={createWorkflow.isPending || !form.name.trim()}
              className="w-full mt-4"
            >
              <Save className="h-4 w-4 mr-2" />
              {createWorkflow.isPending ? 'Creating...' : 'Create Workflow'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Workflow Steps
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add New Step */}
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-4">Add New Step</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="step-name">Step Name *</Label>
                <Input
                  id="step-name"
                  value={currentStep.name || ''}
                  onChange={(e) => setCurrentStep(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Design Review"
                />
              </div>
              
              <div>
                <Label htmlFor="step-assigned">Assign to</Label>
                <Select 
                  value={currentStep.assigned_to || ''} 
                  onValueChange={(value) => setCurrentStep(prev => ({ ...prev, assigned_to: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {teamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.first_name} {member.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="step-description">Description</Label>
                <Textarea
                  id="step-description"
                  value={currentStep.description || ''}
                  onChange={(e) => setCurrentStep(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what needs to be done in this step..."
                  rows={2}
                />
              </div>
              
              <div>
                <Label htmlFor="step-hours">Estimated Hours</Label>
                <Input
                  id="step-hours"
                  type="number"
                  min="0"
                  step="0.5"
                  value={currentStep.estimated_hours || ''}
                  onChange={(e) => setCurrentStep(prev => ({ ...prev, estimated_hours: e.target.value ? Number(e.target.value) : undefined }))}
                  placeholder="e.g., 8"
                />
              </div>
            </div>
            
            <Button onClick={addStep} disabled={!currentStep.name?.trim()} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Add Step
            </Button>
          </div>

          {/* Existing Steps */}
          {form.steps.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Workflow Steps ({form.steps.length})</h4>
              {form.steps.map((step, index) => (
                <div key={step.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {index + 1}
                        </span>
                        <div>
                          <h5 className="font-medium text-gray-900">{step.name}</h5>
                          {step.description && (
                            <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            {step.assigned_to && (
                              <span>Assigned to: {getTeamMemberName(step.assigned_to)}</span>
                            )}
                            {step.estimated_hours && (
                              <span>Est. {step.estimated_hours}h</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => moveStep(step.id, 'up')}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => moveStep(step.id, 'down')}
                        disabled={index === form.steps.length - 1}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeStep(step.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
