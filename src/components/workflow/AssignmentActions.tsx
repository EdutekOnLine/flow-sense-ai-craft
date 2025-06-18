
import React, { useState } from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTranslation } from 'react-i18next';
import { getRTLAwareFlexDirection } from '@/utils/rtl';

type AssignmentStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';

interface Assignment {
  id: string;
  workflow_step_id: string;
  assigned_to: string;
  assigned_by: string;
  status: AssignmentStatus;
  due_date?: string;
  completed_at?: string;
  notes?: string;
  created_at: string;
  workflow_steps: {
    name: string;
    description?: string;
    workflow_id: string;
    step_order: number;
    workflows: {
      name: string;
    };
  };
  workflow_instance?: {
    id: string;
    status: string;
    current_step_id: string | null;
    started_by: string;
    created_at: string;
  };
}

interface AssignmentActionsProps {
  selectedAssignment: Assignment | null;
  isCompleteDialogOpen: boolean;
  isUpdateDialogOpen: boolean;
  isCompleting: boolean;
  notes: string;
  onNotesChange: (notes: string) => void;
  onCloseCompleteDialog: () => void;
  onCloseUpdateDialog: () => void;
  onCompleteStep: (assignment: Assignment) => void;
  onUpdateStatus: (status: AssignmentStatus) => void;
}

export function AssignmentActions({
  selectedAssignment,
  isCompleteDialogOpen,
  isUpdateDialogOpen,
  isCompleting,
  notes,
  onNotesChange,
  onCloseCompleteDialog,
  onCloseUpdateDialog,
  onCompleteStep,
  onUpdateStatus,
}: AssignmentActionsProps) {
  const { t } = useTranslation();

  return (
    <>
      {/* Complete Step Dialog */}
      <Dialog open={isCompleteDialogOpen} onOpenChange={onCloseCompleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Step</DialogTitle>
          </DialogHeader>
          {selectedAssignment && (
            <div className="space-y-4 pt-4">
              <div>
                <h4 className="font-medium mb-2">Step: {selectedAssignment.workflow_steps.name}</h4>
                <p className="text-sm text-muted-foreground">
                  Workflow: {selectedAssignment.workflow_steps.workflows.name}
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Completion Notes</label>
                <Textarea
                  value={notes}
                  onChange={(e) => onNotesChange(e.target.value)}
                  placeholder="Add notes about the completion of this step..."
                  rows={3}
                />
              </div>

              <div className={`flex gap-2 justify-end ${getRTLAwareFlexDirection()}`}>
                <Button
                  variant="outline"
                  onClick={onCloseCompleteDialog}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  className="bg-status-success hover:bg-status-success/90 text-primary-foreground"
                  onClick={() => onCompleteStep(selectedAssignment)}
                  disabled={isCompleting}
                >
                  <ArrowRight className="h-4 w-4 me-1" />
                  {isCompleting ? 'Completing...' : 'Complete & Advance Workflow'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={onCloseUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Assignment Status</DialogTitle>
          </DialogHeader>
          {selectedAssignment && (
            <div className="space-y-4 pt-4">
              <div>
                <h4 className="font-medium mb-2">Step: {selectedAssignment.workflow_steps.name}</h4>
                <p className="text-sm text-muted-foreground">
                  Workflow: {selectedAssignment.workflow_steps.workflows.name}
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes (optional)</label>
                <Textarea
                  value={notes}
                  onChange={(e) => onNotesChange(e.target.value)}
                  placeholder="Add any notes about this step..."
                  rows={3}
                />
              </div>

              <div className={`flex gap-2 ${getRTLAwareFlexDirection()}`}>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-secondary/10 hover:bg-secondary/20"
                  onClick={() => onUpdateStatus('in_progress')}
                >
                  Start Working
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onUpdateStatus('skipped')}
                >
                  Skip
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
