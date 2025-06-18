
import React, { useState } from 'react';
import { Clock, CheckCircle, PlayCircle, ArrowRight, Inbox, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useWorkflowAssignments } from '@/hooks/useWorkflowAssignments';
import { useTranslation } from 'react-i18next';
import { formatLocalizedDistanceToNow } from '@/utils/localization';

interface DashboardTasksProps {
  onViewAllTasks: () => void;
}

export function DashboardTasks({ onViewAllTasks }: DashboardTasksProps) {
  const { assignments, isLoading, updateAssignmentStatus, completeStep } = useWorkflowAssignments();
  const { t, i18n } = useTranslation();
  const [notes, setNotes] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <div className="w-8 h-8 bg-gradient-to-br from-status-pending to-status-pending/70 rounded-lg flex items-center justify-center">
            <Clock className="h-4 w-4 text-white" />
          </div>
        );
      case 'in_progress':
        return (
          <div className="w-8 h-8 bg-gradient-to-br from-status-active to-status-active/70 rounded-lg flex items-center justify-center">
            <PlayCircle className="h-4 w-4 text-white" />
          </div>
        );
      case 'completed':
        return (
          <div className="w-8 h-8 bg-gradient-to-br from-status-success to-status-success/70 rounded-lg flex items-center justify-center">
            <CheckCircle className="h-4 w-4 text-white" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gradient-to-br from-muted to-muted/70 rounded-lg flex items-center justify-center">
            <Clock className="h-4 w-4 text-white" />
          </div>
        );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-status-pending-bg text-status-pending';
      case 'in_progress':
        return 'bg-status-active-bg text-status-active';
      case 'completed':
        return 'bg-status-success-bg text-status-success';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusTranslation = (status: string) => {
    switch (status) {
      case 'pending':
        return t('status.pending');
      case 'in_progress':
        return t('status.inProgress');
      case 'completed':
        return t('status.completed');
      case 'skipped':
        return t('status.skipped');
      default:
        return status;
    }
  };

  const handleCompleteStep = async (assignment: any) => {
    setIsCompleting(true);
    try {
      await completeStep(assignment.id, notes);
      setNotes('');
    } finally {
      setIsCompleting(false);
    }
  };

  // Show only pending and in_progress tasks, limit to 5
  const dashboardTasks = assignments
    .filter(assignment => assignment.status === 'pending' || assignment.status === 'in_progress')
    .slice(0, 5);

  const pendingCount = assignments.filter(a => a.status === 'pending').length;
  const inProgressCount = assignments.filter(a => a.status === 'in_progress').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <RefreshCw className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-status-pending-bg text-status-pending text-xs">
            {pendingCount} {t('status.pending')}
          </Badge>
          <Badge variant="secondary" className="bg-status-active-bg text-status-active text-xs">
            {inProgressCount} {t('status.active')}
          </Badge>
        </div>
      </div>

      {dashboardTasks.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-muted-foreground text-sm">{t('dashboard.noPendingTasks')}</p>
          <p className="text-muted-foreground text-xs mt-1">{t('dashboard.allCaughtUp')}</p>
        </div>
      ) : (
        <>
          {dashboardTasks.map((assignment) => (
            <div key={assignment.id} className="bg-gradient-theme-primary/60 backdrop-blur-sm border border-border rounded-lg p-4 hover:bg-gradient-theme-primary/80 transition-all duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {getStatusIcon(assignment.status)}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate text-foreground">
                      {assignment.workflow_steps.name}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate">
                      {assignment.workflow_steps.workflows.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('common.assigned')} {formatLocalizedDistanceToNow(new Date(assignment.created_at), i18n.language)}
                    </p>
                  </div>
                </div>
                <Badge className={`text-xs ${getStatusColor(assignment.status)}`}>
                  {getStatusTranslation(assignment.status)}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                {assignment.status === 'pending' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs bg-gradient-to-r from-secondary/10 to-secondary/5 hover:from-secondary/20 hover:to-secondary/10 border-secondary/30 text-secondary-foreground"
                    onClick={() => updateAssignmentStatus(assignment.id, 'in_progress')}
                  >
                    <PlayCircle className="h-3 w-3 mr-1" />
                    {t('common.start')}
                  </Button>
                )}
                
                {assignment.status !== 'completed' && (
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
                            onClick={() => handleCompleteStep(assignment)}
                            disabled={isCompleting}
                          >
                            <ArrowRight className="h-4 w-4 mr-1" />
                            {isCompleting ? t('common.completing') : t('tasks.completeTaskAction')}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
          ))}
          
          <div className="pt-2 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={onViewAllTasks}
              className="w-full bg-gradient-theme-secondary/60 hover:bg-gradient-theme-secondary/80 border-border"
            >
              <Inbox className="h-4 w-4 mr-2" />
              {t('tasks.viewAllTasks')} ({assignments.length})
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
