
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
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'in_progress':
        return <PlayCircle className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
          <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
            {pendingCount} {t('status.pending')}
          </Badge>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
            {inProgressCount} {t('status.active')}
          </Badge>
        </div>
      </div>

      {dashboardTasks.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-gray-600 text-sm">{t('dashboard.noPendingTasks')}</p>
          <p className="text-gray-500 text-xs mt-1">{t('dashboard.allCaughtUp')}</p>
        </div>
      ) : (
        <>
          {dashboardTasks.map((assignment) => (
            <div key={assignment.id} className="border border-blue-200 bg-white rounded-lg p-3 hover:bg-blue-25 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate text-blue-800">
                    {assignment.workflow_steps.name}
                  </h4>
                  <p className="text-xs text-blue-600 truncate">
                    {assignment.workflow_steps.workflows.name}
                  </p>
                  <p className="text-xs text-blue-500 mt-1">
                    {t('common.assigned')} {formatLocalizedDistanceToNow(new Date(assignment.created_at), i18n.language)}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  {getStatusIcon(assignment.status)}
                  <Badge className={`text-xs ${getStatusColor(assignment.status)}`}>
                    {getStatusTranslation(assignment.status)}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {assignment.status === 'pending' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs bg-blue-50 hover:bg-blue-100"
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
                        className="h-7 text-xs bg-green-600 hover:bg-green-700"
                        disabled={isCompleting}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {t('common.done')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t('tasks.completeTask')}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div>
                          <h4 className="font-medium mb-1">{assignment.workflow_steps.name}</h4>
                          <p className="text-sm text-gray-600">
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
                          />
                        </div>

                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            onClick={() => setNotes('')}
                          >
                            {t('common.cancel')}
                          </Button>
                          <Button
                            className="bg-green-600 hover:bg-green-700"
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
          
          <div className="pt-2 border-t border-blue-200">
            <Button
              variant="outline"
              size="sm"
              onClick={onViewAllTasks}
              className="w-full"
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
