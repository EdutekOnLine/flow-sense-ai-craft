
import React, { useState } from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useTranslation } from 'react-i18next';

interface CompleteTaskDialogProps {
  assignment: any;
  onCompleteStep: (assignment: any, notes: string) => Promise<void>;
  isCompleting: boolean;
}

export function CompleteTaskDialog({ assignment, onCompleteStep, isCompleting }: CompleteTaskDialogProps) {
  const { t } = useTranslation();
  const [notes, setNotes] = useState('');

  const handleComplete = async () => {
    await onCompleteStep(assignment, notes);
    setNotes('');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="h-7 text-xs bg-gradient-to-r from-status-success to-status-success/80 hover:from-status-success/90 hover:to-status-success/70 text-white"
          disabled={isCompleting}
        >
          <CheckCircle className="h-3 w-3 mr-1" />
          {t('common.done')}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gradient-theme-primary border-border">
        <DialogHeader>
          <DialogTitle>{t('tasks.completeTask')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div>
            <h4 className="font-medium mb-1">{assignment.workflow_steps.name}</h4>
            <p className="text-sm text-muted-foreground">
              {assignment.workflow_steps.workflows.name}
            </p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('tasks.completionNotes')}</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('tasks.completionNotesPlaceholder')}
              rows={3}
              className="bg-card/80 border-border"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setNotes('')}
              className="bg-card/60 hover:bg-card/80"
            >
              {t('common.cancel')}
            </Button>
            <Button
              className="bg-gradient-to-r from-status-success to-status-success/80 hover:from-status-success/90 hover:to-status-success/70 text-white"
              onClick={handleComplete}
              disabled={isCompleting}
            >
              <ArrowRight className="h-4 w-4 mr-1" />
              {isCompleting ? t('common.completing') : t('tasks.completeTaskAction')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
