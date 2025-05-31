
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

interface SaveWorkflowDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description?: string) => void;
  isLoading: boolean;
  initialName?: string;
  initialDescription?: string;
  isEditing?: boolean;
}

export function SaveWorkflowDialog({
  isOpen,
  onClose,
  onSave,
  isLoading,
  initialName = '',
  initialDescription = '',
  isEditing = false
}: SaveWorkflowDialogProps) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim(), description.trim() || undefined);
    }
  };

  const handleClose = () => {
    setName(initialName);
    setDescription(initialDescription);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Update Workflow' : 'Save Workflow'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the workflow details and save your changes.'
              : 'Give your workflow a name and description to save it.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter workflow name"
              disabled={isLoading}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter workflow description (optional)"
              disabled={isLoading}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!name.trim() || isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Update' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
