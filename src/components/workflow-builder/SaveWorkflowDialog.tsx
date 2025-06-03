
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

  const handleSave = async () => {
    if (!name.trim()) return;
    
    try {
      await onSave(name.trim(), description.trim());
      setName('');
      setDescription('');
      onClose();
    } catch (error) {
      console.error('Error saving workflow:', error);
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    onClose();
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
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="workflow-description">Description</Label>
            <Textarea
              id="workflow-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter workflow description..."
              disabled={isLoading}
              rows={3}
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!name.trim() || isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Workflow'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
