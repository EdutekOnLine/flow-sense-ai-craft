
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Save, Loader2 } from 'lucide-react';

interface SaveWorkflowDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description?: string, isReusable?: boolean) => Promise<void>;
  initialName?: string;
  initialDescription?: string;
  initialIsReusable?: boolean;
  isLoading: boolean;
  isEditing: boolean;
}

export function SaveWorkflowDialog({
  isOpen,
  onClose,
  onSave,
  initialName = '',
  initialDescription = '',
  initialIsReusable = false,
  isLoading,
  isEditing
}: SaveWorkflowDialogProps) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [isReusable, setIsReusable] = useState(initialIsReusable);

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setDescription(initialDescription);
      setIsReusable(initialIsReusable);
    }
  }, [isOpen, initialName, initialDescription, initialIsReusable]);

  const handleSave = async () => {
    if (!name.trim()) return;
    
    try {
      await onSave(name.trim(), description.trim() || undefined, isReusable);
    } catch (error) {
      console.error('Failed to save workflow:', error);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Update Workflow' : 'Save Workflow'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="workflow-name">Workflow Name *</Label>
            <Input
              id="workflow-name"
              placeholder="Enter workflow name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="workflow-description">Description</Label>
            <Textarea
              id="workflow-description"
              placeholder="Enter workflow description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="workflow-reusable"
              checked={isReusable}
              onCheckedChange={setIsReusable}
              disabled={isLoading}
            />
            <Label htmlFor="workflow-reusable" className="text-sm">
              Make this workflow reusable
            </Label>
          </div>
          
          {isReusable && (
            <div className="text-xs text-gray-600 bg-blue-50 p-3 rounded-md">
              <p className="font-medium mb-1">Reusable Workflow</p>
              <p>Users can start multiple instances of this workflow. Each instance will be tracked separately with its own status and data.</p>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!name.trim() || isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isLoading ? 'Saving...' : (isEditing ? 'Update' : 'Save')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
