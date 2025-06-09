
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
import { Checkbox } from '@/components/ui/checkbox';
import { Node, Edge } from '@xyflow/react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';

interface SaveWorkflowDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description: string, isReusable: boolean) => Promise<void>;
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
  const [isReusable, setIsReusable] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: t('workflowBuilder.validationError'),
        description: t('workflowBuilder.enterWorkflowName'),
        variant: "destructive",
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      console.log('Starting save process with isReusable:', isReusable);
      await onSave(name.trim(), description.trim(), isReusable);
      console.log('Save completed successfully');
      
      // Reset form and close dialog
      setName('');
      setDescription('');
      setIsReusable(false);
      onClose();
      
      toast({
        title: t('workflowBuilder.saveSuccess'),
        description: t('workflowBuilder.saveSuccessMessage', { name: name.trim() }),
      });
    } catch (error) {
      console.error('Error saving workflow:', error);
      toast({
        title: t('workflowBuilder.saveFailed'),
        description: error instanceof Error ? error.message : t('workflowBuilder.saveFailedMessage'),
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
      setIsReusable(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('workflowBuilder.saveWorkflow')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="workflow-name">{t('workflowBuilder.workflowNameRequired')}</Label>
            <Input
              id="workflow-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('workflowBuilder.workflowNamePlaceholder')}
              disabled={isSaving || isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="workflow-description">{t('workflowBuilder.description')}</Label>
            <Textarea
              id="workflow-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('workflowBuilder.descriptionPlaceholder')}
              disabled={isSaving || isLoading}
              rows={3}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="workflow-reusable"
              checked={isReusable}
              onCheckedChange={(checked) => setIsReusable(checked as boolean)}
              disabled={isSaving || isLoading}
            />
            <Label htmlFor="workflow-reusable" className="text-sm">
              {t('workflowBuilder.makeReusable')}
            </Label>
          </div>
          <div className="text-xs text-gray-500">
            {t('workflowBuilder.reusableDescription')}
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={handleClose} 
            disabled={isSaving || isLoading}
          >
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!name.trim() || isSaving || isLoading}
          >
            {isSaving ? t('workflowBuilder.saving') : t('workflowBuilder.saveWorkflow')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
