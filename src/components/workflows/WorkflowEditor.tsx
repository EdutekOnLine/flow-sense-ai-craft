import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Save, X, Plus, Trash2, ArrowUp, ArrowDown, ArrowLeft } from 'lucide-react';

interface WorkflowStep {
  name: string;
  description: string;
  status: string;
  estimated_hours: number | null;
  assigned_to: string | null;
}

interface WorkflowEditorProps {
  workflow?: any;
  profiles?: Array<{ id: string; first_name: string; last_name: string }>;
  onSave: () => void;
  onCancel: () => void;
}

export default function WorkflowEditor({ workflow, profiles, onSave, onCancel }: WorkflowEditorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: 'medium',
    due_date: '',
    assigned_to: '',
    tags: [],
    steps: []
  });

  const [newTag, setNewTag] = useState('');

  // Initialize form data when workflow prop changes
  useEffect(() => {
    console.log('=== FORM INITIALIZATION ===');
    console.log('useEffect triggered with workflow:', workflow);
    if (workflow) {
      console.log('Initializing form with workflow steps:', workflow.workflow_steps);
      const initialSteps = workflow.workflow_steps?.map((step: any) => ({
        name: step.name,
        description: step.description || '',
        status: step.status,
        estimated_hours: step.estimated_hours,
        assigned_to: step.assigned_to
      })) || [];
      
      console.log('Processed initial steps:', initialSteps);
      
      setFormData({
        name: workflow.name || '',
        description: workflow.description || '',
        priority: workflow.priority || 'medium',
        due_date: workflow.due_date ? new Date(workflow.due_date).toISOString().split('T')[0] : '',
        assigned_to: workflow.assigned_to || '',
        tags: workflow.tags || [],
        steps: initialSteps
      });
    } else {
      // Reset form for new workflow
      console.log('Resetting form for new workflow');
      setFormData({
        name: '',
        description: '',
        priority: 'medium',
        due_date: '',
        assigned_to: '',
        tags: [],
        steps: []
      });
    }
  }, [workflow]);

  const saveWorkflowMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('=== SAVE MUTATION START ===');
      console.log('Saving workflow with data:', data);
      console.log('Current form steps count:', data.steps.length);
      console.log('Form steps:', data.steps);
      
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      if (workflow?.id) {
        console.log('=== UPDATING EXISTING WORKFLOW ===');
        console.log('Workflow ID:', workflow.id);
        
        // Update existing workflow
        const { error: workflowError } = await supabase
          .from('workflows')
          .update({
            name: data.name,
            description: data.description || null,
            priority: data.priority,
            assigned_to: data.assigned_to || null,
            due_date: data.due_date || null,
            tags: data.tags.length > 0 ? data.tags : null,
            updated_at: new Date().toISOString()
          })
          .eq('id', workflow.id);

        if (workflowError) {
          console.error('Workflow update error:', workflowError);
          throw workflowError;
        }
        console.log('✅ Workflow updated successfully');

        // STEP 1: Delete ALL existing steps for this workflow
        console.log('=== CLEARING ALL EXISTING STEPS ===');
        const { error: deleteError } = await supabase
          .from('workflow_steps')
          .delete()
          .eq('workflow_id', workflow.id);

        if (deleteError) {
          console.error('❌ Step deletion error:', deleteError);
          throw deleteError;
        }
        console.log('✅ Successfully deleted all existing steps');

        // STEP 2: Insert ONLY the current form steps as completely new entries
        if (data.steps && data.steps.length > 0) {
          console.log('=== INSERTING NEW STEPS ===');
          console.log('Steps to insert count:', data.steps.length);
          
          const newStepsToInsert = data.steps.map((step: WorkflowStep, index: number) => ({
            workflow_id: workflow.id,
            name: step.name,
            description: step.description || null,
            step_order: index + 1,
            status: step.status,
            estimated_hours: step.estimated_hours,
            assigned_to: step.assigned_to || null
          }));

          console.log('New steps to insert:', newStepsToInsert);

          const { error: stepsError } = await supabase
            .from('workflow_steps')
            .insert(newStepsToInsert);

          if (stepsError) {
            console.error('❌ Steps insertion error:', stepsError);
            throw stepsError;
          }
          
          console.log('✅ Successfully inserted', newStepsToInsert.length, 'new steps');
        } else {
          console.log('ℹ️ No steps to insert - workflow will have 0 steps');
        }
      } else {
        console.log('=== CREATING NEW WORKFLOW ===');
        
        // Create new workflow
        const { data: newWorkflow, error: workflowError } = await supabase
          .from('workflows')
          .insert({
            name: data.name,
            description: data.description || null,
            priority: data.priority,
            assigned_to: data.assigned_to || null,
            due_date: data.due_date || null,
            tags: data.tags.length > 0 ? data.tags : null,
            created_by: user.id,
            status: 'draft'
          })
          .select()
          .single();

        if (workflowError) {
          console.error('❌ New workflow creation error:', workflowError);
          throw workflowError;
        }

        console.log('✅ New workflow created:', newWorkflow);

        // Insert steps for new workflow
        if (data.steps.length > 0) {
          console.log('=== INSERTING STEPS FOR NEW WORKFLOW ===');
          console.log('Steps to insert:', data.steps);
          const stepsToInsert = data.steps.map((step: WorkflowStep, index: number) => ({
            workflow_id: newWorkflow.id,
            name: step.name,
            description: step.description || null,
            step_order: index + 1,
            status: step.status,
            estimated_hours: step.estimated_hours,
            assigned_to: step.assigned_to || null
          }));

          const { error: stepsError } = await supabase
            .from('workflow_steps')
            .insert(stepsToInsert);

          if (stepsError) {
            console.error('❌ New workflow steps insertion error:', stepsError);
            throw stepsError;
          }
          
          console.log('✅ Successfully inserted', stepsToInsert.length, 'steps for new workflow');
        }
      }
      
      console.log('=== SAVE MUTATION END ===');
    },
    onSuccess: () => {
      console.log('✅ Workflow saved successfully');
      toast({
        title: "Success",
        description: `Workflow ${workflow?.id ? 'updated' : 'created'} successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      queryClient.invalidateQueries({ queryKey: ['workflow', workflow?.id] });
      onSave();
    },
    onError: (error) => {
      console.error('❌ Save error:', error);
      toast({
        title: "Error",
        description: `Failed to ${workflow?.id ? 'update' : 'create'} workflow: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Workflow name is required",
        variant: "destructive",
      });
      return;
    }
    console.log('=== HANDLE SAVE START ===');
    console.log('Current form data before save:', formData);
    console.log('Current steps count:', formData.steps.length);
    console.log('Steps being saved:', formData.steps);
    saveWorkflowMutation.mutate(formData);
  };

  const addStep = () => {
    console.log('=== ADD STEP ===');
    console.log('Current steps before add:', formData.steps);
    const newStep = {
      name: '',
      description: '',
      status: 'pending',
      estimated_hours: null,
      assigned_to: null
    };
    console.log('Adding new step:', newStep);
    setFormData(prev => {
      const newSteps = [...prev.steps, newStep];
      console.log('New steps array after add:', newSteps);
      return {
        ...prev,
        steps: newSteps
      };
    });
  };

  const removeStep = (index: number) => {
    console.log('=== REMOVE STEP ===');
    console.log('Removing step at index:', index);
    console.log('Current steps before remove:', formData.steps);
    setFormData(prev => {
      const newSteps = prev.steps.filter((_, i) => i !== index);
      console.log('New steps after remove:', newSteps);
      return {
        ...prev,
        steps: newSteps
      };
    });
  };

  const updateStep = (index: number, field: keyof WorkflowStep, value: any) => {
    console.log('=== UPDATE STEP ===');
    console.log('Updating step', index, 'field:', field, 'value:', value);
    console.log('Current steps before update:', formData.steps);
    setFormData(prev => {
      const newSteps = prev.steps.map((step, i) => 
        i === index ? { ...step, [field]: value } : step
      );
      console.log('New steps after update:', newSteps);
      return {
        ...prev,
        steps: newSteps
      };
    });
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === formData.steps.length - 1)) {
      return;
    }

    const newSteps = [...formData.steps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    
    setFormData(prev => ({ ...prev, steps: newSteps }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  console.log('=== RENDER ===');
  console.log('Current form data in render:', formData);
  console.log('Current steps count in render:', formData.steps.length);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={onCancel}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h2 className="text-2xl font-bold">
            {workflow?.id ? 'Edit Workflow' : 'Create Workflow'}
          </h2>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleSave} 
            disabled={saveWorkflowMutation.isPending}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saveWorkflowMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
          <Button variant="outline" onClick={onCancel} className="flex items-center gap-2">
            <X className="h-4 w-4" />
            Cancel
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workflow Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Name *</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Workflow name"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Workflow description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Priority</label>
              <Select 
                value={formData.priority} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
              >
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
              <Select 
                value={formData.assigned_to || 'unassigned'} 
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  assigned_to: value === 'unassigned' ? null : value 
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
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
                value={formData.due_date}
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  {tag}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} disabled={!newTag.trim()}>
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Workflow Steps
            <Badge variant="outline">{formData.steps.length} steps</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.steps.map((step, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveStep(index, 'up')}
                      disabled={index === 0}
                      className="h-6 w-6 p-0"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveStep(index, 'down')}
                      disabled={index === formData.steps.length - 1}
                      className="h-6 w-6 p-0"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Input
                        value={step.name}
                        onChange={(e) => updateStep(index, 'name', e.target.value)}
                        placeholder="Step name"
                      />
                    </div>
                    <div>
                      <Select
                        value={step.status}
                        onValueChange={(value) => updateStep(index, 'status', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="blocked">Blocked</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Textarea
                    value={step.description}
                    onChange={(e) => updateStep(index, 'description', e.target.value)}
                    placeholder="Step description"
                    rows={2}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Select
                      value={step.assigned_to || 'unassigned'}
                      onValueChange={(value) => updateStep(index, 'assigned_to', value === 'unassigned' ? null : value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
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
                    <Input
                      type="number"
                      value={step.estimated_hours || ''}
                      onChange={(e) => updateStep(index, 'estimated_hours', e.target.value ? Number(e.target.value) : null)}
                      placeholder="Estimated hours"
                    />
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeStep(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          <Button onClick={addStep} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Step
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
