import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';

interface WorkflowStep {
  id?: string;
  name: string;
  description: string;
  step_order: number;
  status: string;
  estimated_hours: number | null;
  assigned_to: string | null;
  dependencies: string[] | null;
}

interface WorkflowStepEditorProps {
  steps: WorkflowStep[];
  onStepsChange: (steps: WorkflowStep[]) => void;
  profiles: Array<{ id: string; first_name: string; last_name: string }> | undefined;
}

export default function WorkflowStepEditor({ steps, onStepsChange, profiles }: WorkflowStepEditorProps) {
  const [newStep, setNewStep] = useState<Partial<WorkflowStep>>({
    name: '',
    description: '',
    estimated_hours: null,
    assigned_to: 'unassigned',
    status: 'pending'
  });

  // Simplified clean steps function - just validate and re-order
  const cleanSteps = useCallback((stepsArray: WorkflowStep[]): WorkflowStep[] => {
    console.log('Cleaning steps. Input:', stepsArray.length, stepsArray);
    
    if (!stepsArray || stepsArray.length === 0) {
      console.log('No steps to clean, returning empty array');
      return [];
    }

    // Filter out invalid steps only
    const validSteps = stepsArray.filter(step => {
      const isValid = step && 
        step.name && 
        typeof step.name === 'string' && 
        step.name.trim().length > 0;
      
      if (!isValid) {
        console.log('Filtering out invalid step:', step);
      }
      return isValid;
    });

    console.log('Valid steps after filtering:', validSteps.length);

    // Just re-order the valid steps without deduplication
    const reorderedSteps = validSteps.map((step, index) => ({
      ...step,
      name: step.name.trim(),
      description: step.description?.trim() || '',
      step_order: index + 1
    }));

    console.log('Final cleaned steps:', reorderedSteps.length, reorderedSteps);
    return reorderedSteps;
  }, []);

  const addStep = useCallback(() => {
    if (!newStep.name?.trim()) {
      console.log('Cannot add step: name is empty');
      return;
    }

    const step: WorkflowStep = {
      name: newStep.name.trim(),
      description: newStep.description?.trim() || '',
      step_order: steps.length + 1,
      status: newStep.status || 'pending',
      estimated_hours: newStep.estimated_hours,
      assigned_to: newStep.assigned_to === 'unassigned' ? null : newStep.assigned_to || null,
      dependencies: null
    };

    console.log('Adding new step:', step);
    const updatedSteps = [...steps, step];
    const finalSteps = cleanSteps(updatedSteps);
    console.log('Steps after add and clean:', finalSteps.length);
    onStepsChange(finalSteps);
    
    setNewStep({
      name: '',
      description: '',
      estimated_hours: null,
      assigned_to: 'unassigned',
      status: 'pending'
    });
  }, [newStep, steps, cleanSteps, onStepsChange]);

  const removeStep = useCallback((index: number) => {
    console.log('Removing step at index:', index);
    if (index < 0 || index >= steps.length) {
      console.warn('Invalid index for step removal:', index);
      return;
    }
    
    const updatedSteps = steps.filter((_, i) => i !== index);
    const finalSteps = cleanSteps(updatedSteps);
    console.log('Steps after remove and clean:', finalSteps.length);
    onStepsChange(finalSteps);
  }, [steps, cleanSteps, onStepsChange]);

  const updateStep = useCallback((index: number, field: keyof WorkflowStep, value: any) => {
    console.log('Updating step at index:', index, 'field:', field, 'value:', value);
    
    if (index < 0 || index >= steps.length) {
      console.warn('Invalid index for step update:', index);
      return;
    }
    
    const updatedSteps = steps.map((step, i) => {
      if (i === index) {
        return {
          ...step,
          [field]: field === 'assigned_to' && value === 'unassigned' ? null : value
        };
      }
      return step;
    });
    
    const finalSteps = cleanSteps(updatedSteps);
    console.log('Steps after update and clean:', finalSteps.length);
    onStepsChange(finalSteps);
  }, [steps, cleanSteps, onStepsChange]);

  const moveStep = useCallback((index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === steps.length - 1)) {
      return;
    }

    console.log('Moving step at index:', index, 'direction:', direction);
    
    const updatedSteps = [...steps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    [updatedSteps[index], updatedSteps[targetIndex]] = [updatedSteps[targetIndex], updatedSteps[index]];
    
    const finalSteps = cleanSteps(updatedSteps);
    console.log('Steps after move and clean:', finalSteps.length);
    onStepsChange(finalSteps);
  }, [steps, cleanSteps, onStepsChange]);

  const getAssignedUserName = (userId: string | null) => {
    if (!userId || !profiles) return 'Unassigned';
    const profile = profiles.find(p => p.id === userId);
    return profile ? `${profile.first_name} ${profile.last_name}` : 'Unknown User';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'blocked': return 'bg-red-500';
      case 'cancelled': return 'bg-gray-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  // Use the steps directly without additional cleaning for rendering
  console.log('Rendering with steps:', steps.length, steps);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Workflow Steps</h4>
        <Badge variant="outline">{steps.length} steps</Badge>
      </div>

      {/* Existing Steps */}
      <div className="space-y-3">
        {steps.map((step, index) => (
          <Card key={`step-${index}-${step.name}`} className="border">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center gap-1 mt-1">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium">
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
                      ↑
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveStep(index, 'down')}
                      disabled={index === steps.length - 1}
                      className="h-6 w-6 p-0"
                    >
                      ↓
                    </Button>
                  </div>
                </div>
                
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium">Step Name</label>
                      <Input
                        value={step.name}
                        onChange={(e) => updateStep(index, 'name', e.target.value)}
                        placeholder="Step name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Status</label>
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

                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={step.description}
                      onChange={(e) => updateStep(index, 'description', e.target.value)}
                      placeholder="Step description"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium">Assigned To</label>
                      <Select
                        value={step.assigned_to || 'unassigned'}
                        onValueChange={(value) => updateStep(index, 'assigned_to', value)}
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
                      <label className="text-sm font-medium">Estimated Hours</label>
                      <Input
                        type="number"
                        value={step.estimated_hours || ''}
                        onChange={(e) => updateStep(index, 'estimated_hours', e.target.value ? Number(e.target.value) : null)}
                        placeholder="Hours"
                      />
                    </div>
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
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add New Step */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Step
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Step Name</label>
              <Input
                value={newStep.name || ''}
                onChange={(e) => setNewStep(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter step name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select
                value={newStep.status || 'pending'}
                onValueChange={(value) => setNewStep(prev => ({ ...prev, status: value }))}
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

          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={newStep.description || ''}
              onChange={(e) => setNewStep(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Step description"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Assigned To</label>
              <Select
                value={newStep.assigned_to || 'unassigned'}
                onValueChange={(value) => setNewStep(prev => ({ ...prev, assigned_to: value }))}
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
              <label className="text-sm font-medium">Estimated Hours</label>
              <Input
                type="number"
                value={newStep.estimated_hours || ''}
                onChange={(e) => setNewStep(prev => ({ ...prev, estimated_hours: e.target.value ? Number(e.target.value) : null }))}
                placeholder="Hours"
              />
            </div>
          </div>

          <Button onClick={addStep} disabled={!newStep.name?.trim()} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Step
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
