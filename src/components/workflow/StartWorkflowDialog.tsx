
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Rocket, Loader2 } from 'lucide-react';
import { StartableWorkflow } from '@/hooks/useWorkflowInstances';

interface StartWorkflowDialogProps {
  workflow: StartableWorkflow;
  onStartWorkflow: (workflowId: string, startData: any) => Promise<void>;
  trigger?: React.ReactNode;
}

export function StartWorkflowDialog({ workflow, onStartWorkflow, trigger }: StartWorkflowDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  // Check if the start step requires inputs
  const requiredInputs = workflow.start_step.metadata?.inputs || [];
  const hasInputs = requiredInputs.length > 0;

  const handleStart = async () => {
    setIsStarting(true);
    try {
      await onStartWorkflow(workflow.id, hasInputs ? formData : {});
      setIsOpen(false);
      setFormData({});
    } catch (error) {
      console.error('Failed to launch workflow:', error);
    } finally {
      setIsStarting(false);
    }
  };

  const handleInputChange = (inputName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [inputName]: value
    }));
  };

  const renderInputField = (input: any) => {
    const { name, type, label, required, placeholder } = input;

    switch (type) {
      case 'textarea':
        return (
          <div key={name} className="space-y-2">
            <Label htmlFor={name}>
              {label || name} {required && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id={name}
              placeholder={placeholder}
              value={formData[name] || ''}
              onChange={(e) => handleInputChange(name, e.target.value)}
              required={required}
            />
          </div>
        );
      case 'number':
        return (
          <div key={name} className="space-y-2">
            <Label htmlFor={name}>
              {label || name} {required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={name}
              type="number"
              placeholder={placeholder}
              value={formData[name] || ''}
              onChange={(e) => handleInputChange(name, e.target.valueAsNumber)}
              required={required}
            />
          </div>
        );
      default:
        return (
          <div key={name} className="space-y-2">
            <Label htmlFor={name}>
              {label || name} {required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={name}
              type="text"
              placeholder={placeholder}
              value={formData[name] || ''}
              onChange={(e) => handleInputChange(name, e.target.value)}
              required={required}
            />
          </div>
        );
    }
  };

  // Default trigger if none provided
  const defaultTrigger = (
    <Button
      className="bg-purple-600 hover:bg-purple-700"
      size="sm"
      disabled={isStarting}
    >
      {isStarting ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Rocket className="h-4 w-4 mr-2" />
      )}
      {isStarting ? 'Launching...' : 'Launch Workflow'}
    </Button>
  );

  // If no inputs required, show simple launch button
  if (!hasInputs) {
    return trigger ? (
      <div onClick={handleStart} style={{ cursor: 'pointer', display: 'inline-block' }}>
        {trigger}
      </div>
    ) : (
      <Button
        onClick={handleStart}
        disabled={isStarting}
        className="bg-purple-600 hover:bg-purple-700"
        size="sm"
      >
        {isStarting ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Rocket className="h-4 w-4 mr-2" />
        )}
        {isStarting ? 'Launching...' : 'Launch Workflow'}
      </Button>
    );
  }

  // If inputs required, show dialog with form
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Launch {workflow.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          <div className="text-sm text-gray-600">
            {workflow.description && <p className="mb-4">{workflow.description}</p>}
            <p><strong>First Step:</strong> {workflow.start_step.name}</p>
            {workflow.start_step.description && (
              <p className="text-xs mt-1">{workflow.start_step.description}</p>
            )}
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Required Information</h4>
            {requiredInputs.map(renderInputField)}
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isStarting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStart}
              disabled={isStarting}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isStarting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Rocket className="h-4 w-4 mr-2" />
              )}
              {isStarting ? 'Launching...' : 'Launch Workflow'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
