
import React from 'react';
import { PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { formatLocalizedDistanceToNow } from '@/utils/localization';
import { TaskStatusIcon } from './TaskStatusIcon';
import { CompleteTaskDialog } from './CompleteTaskDialog';

interface TaskItemProps {
  assignment: any;
  onUpdateStatus: (assignmentId: string, status: string) => void;
  onCompleteStep: (assignment: any, notes: string) => Promise<void>;
  isCompleting: boolean;
  showWorkspaceInfo?: boolean;
}

export function TaskItem({ assignment, onUpdateStatus, onCompleteStep, isCompleting, showWorkspaceInfo }: TaskItemProps) {
  const { t, i18n } = useTranslation();

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

  return (
    <div className="bg-gradient-theme-primary/60 backdrop-blur-sm border border-border rounded-lg p-4 hover:bg-gradient-theme-primary/80 transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <TaskStatusIcon status={assignment.status} />
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate text-foreground">
              {assignment.workflow_steps.name}
            </h4>
            <p className="text-xs text-muted-foreground truncate">
              {assignment.workflow_steps.workflows.name}
            </p>
            {showWorkspaceInfo && assignment.workspace && (
              <p className="text-xs text-muted-foreground truncate">
                Workspace: {assignment.workspace.name}
              </p>
            )}
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
            onClick={() => onUpdateStatus(assignment.id, 'in_progress')}
          >
            <PlayCircle className="h-3 w-3 mr-1" />
            {t('common.start')}
          </Button>
        )}
        
        {assignment.status !== 'completed' && (
          <CompleteTaskDialog
            assignment={assignment}
            onCompleteStep={onCompleteStep}
            isCompleting={isCompleting}
          />
        )}
      </div>
    </div>
  );
}
