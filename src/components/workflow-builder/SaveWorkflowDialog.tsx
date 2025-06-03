
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Node, Edge } from '@xyflow/react';
import { useToast } from '@/hooks/use-toast';

interface SaveWorkflowDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description: string) => Promise<void>;
  nodes: Node[];
  edges: Edge[];
  isLoading?: boolean;
}

export function SaveWorkflowDialog({
  isOpen,
  onClose,
  onSave,
  isLoading = false,
}: SaveWorkflowDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a workflow name.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      console.log('Starting save process...');
      await onSave(name.trim(), description.trim());
      console.log('Save completed successfully');
      
      // Reset form and close dialog
      setName('');
      setDescription('');
      onClose();
      
      toast({
        title: "Success",
        description: `Workflow "${name.trim()}" has been saved successfully.`,
      });
    } catch (error) {
      console.error('Error saving workflow:', error);
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save workflow. Please try again.",
        variant: "destructive",
      });
    } finally {
      console.log('Resetting saving state...');
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      setName('');
      setDescription('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Workflow</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="workflow-name">Workflow Name *</Label>
            <Input
              id="workflow-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter workflow name..."
              disabled={isSaving || isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="workflow-description">Description</Label>
            <Textarea
              id="workflow-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter workflow description..."
              disabled={isSaving || isLoading}
              rows={3}
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={handleClose} 
            disabled={isSaving || isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!name.trim() || isSaving || isLoading}
          >
            {isSaving ? 'Saving...' : 'Save Workflow'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
