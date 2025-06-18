
import React from 'react';
import { Clock, CheckCircle, PlayCircle, XCircle, Calendar, User, Workflow } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { formatLocalizedDistanceToNow } from '@/utils/localization';
import { getRTLAwareFlexDirection, getRTLAwareTextAlign } from '@/utils/rtl';

interface Assignment {
  id: string;
  workflow_step_id: string;
  assigned_to: string;
  assigned_by: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
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

interface AssignmentCardProps {
  assignment: Assignment;
  onStartWorking: (assignmentId: string) => void;
  onOpenCompleteDialog: (assignment: Assignment) => void;
  onOpenUpdateDialog: (assignment: Assignment) => void;
}

export function AssignmentCard({ 
  assignment, 
  onStartWorking, 
  onOpenCompleteDialog, 
  onOpenUpdateDialog 
}: AssignmentCardProps) {
  const { t, i18n } = useTranslation();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-status-pending" />;
      case 'in_progress':
        return <PlayCircle className="h-4 w-4 text-status-active" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-status-success" />;
      case 'skipped':
        return <XCircle className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Clock className="h-4 w-4" />;
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
      case 'skipped':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="bg-gradient-theme-card border-border hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className={`flex items-start justify-between ${getRTLAwareFlexDirection()}`}>
          <div className="space-y-1 flex-1">
            <CardTitle className={`text-lg ${getRTLAwareTextAlign()}`}>
              {assignment.workflow_steps.name}
            </CardTitle>
            <p className={`text-sm text-muted-foreground ${getRTLAwareTextAlign()}`}>
              Workflow: {assignment.workflow_steps.workflows.name}
            </p>
            {assignment.workflow_instance && (
              <div className={`flex items-center gap-2 text-xs text-primary ${getRTLAwareFlexDirection()}`}>
                <Workflow className="h-3 w-3" />
                Instance started {formatLocalizedDistanceToNow(new Date(assignment.workflow_instance.created_at), i18n.language, { addSuffix: true })}
              </div>
            )}
          </div>
          <div className={`flex items-center gap-2 ${getRTLAwareFlexDirection()}`}>
            {getStatusIcon(assignment.status)}
            <Badge className={getStatusColor(assignment.status)}>
              {t(`workflow.${assignment.status.replace('_', '')}`) || assignment.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {assignment.workflow_steps.description && (
          <p className={`text-sm text-foreground ${getRTLAwareTextAlign()}`}>
            {assignment.workflow_steps.description}
          </p>
        )}
        
        <div className={`flex items-center gap-4 text-xs text-muted-foreground ${getRTLAwareFlexDirection()}`}>
          <div className={`flex items-center gap-1 ${getRTLAwareFlexDirection()}`}>
            <Calendar className="h-3 w-3" />
            Assigned {formatLocalizedDistanceToNow(new Date(assignment.created_at), i18n.language, { addSuffix: true })}
          </div>
          {assignment.due_date && (
            <div className={`flex items-center gap-1 ${getRTLAwareFlexDirection()}`}>
              <Clock className="h-3 w-3" />
              Due {formatLocalizedDistanceToNow(new Date(assignment.due_date), i18n.language, { addSuffix: true })}
            </div>
          )}
        </div>

        {assignment.notes && (
          <div className="bg-muted p-3 rounded-md">
            <p className={`text-sm text-foreground ${getRTLAwareTextAlign()}`}>{assignment.notes}</p>
          </div>
        )}

        <div className={`flex items-center gap-2 pt-2 border-t border-border ${getRTLAwareFlexDirection()}`}>
          {assignment.status !== 'completed' && (
            <>
              {assignment.status === 'pending' && (
                <button
                  className={`px-3 py-1.5 text-sm bg-secondary/10 hover:bg-secondary/20 text-secondary rounded-md transition-colors flex items-center gap-1 ${getRTLAwareFlexDirection()}`}
                  onClick={() => onStartWorking(assignment.id)}
                >
                  <PlayCircle className="h-4 w-4" />
                  Start Working
                </button>
              )}
              
              <button
                className={`px-3 py-1.5 text-sm bg-status-success hover:bg-status-success/90 text-primary-foreground rounded-md transition-colors flex items-center gap-1 ${getRTLAwareFlexDirection()}`}
                onClick={() => onOpenCompleteDialog(assignment)}
              >
                <CheckCircle className="h-4 w-4" />
                Mark as Done
              </button>

              <button 
                className="px-3 py-1.5 text-sm border border-border bg-background hover:bg-muted rounded-md transition-colors"
                onClick={() => onOpenUpdateDialog(assignment)}
              >
                Update Status
              </button>
            </>
          )}
          
          {assignment.status === 'completed' && assignment.completed_at && (
            <div className={`flex items-center gap-2 text-sm text-status-success ${getRTLAwareFlexDirection()}`}>
              <CheckCircle className="h-4 w-4" />
              Completed {formatLocalizedDistanceToNow(new Date(assignment.completed_at), i18n.language, { addSuffix: true })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
