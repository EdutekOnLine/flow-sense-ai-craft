
import React, { useState } from 'react';
import { RefreshCw, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWorkflowAssignments } from '@/hooks/useWorkflowAssignments';
import { useTranslation } from 'react-i18next';
import { TaskStatsHeader } from './TaskStatsHeader';
import { TaskItem } from './TaskItem';

interface DashboardTasksProps {
  onViewAllTasks: () => void;
}

export function DashboardTasks({ onViewAllTasks }: DashboardTasksProps) {
  const { assignments, isLoading, updateAssignmentStatus, completeStep } = useWorkflowAssignments();
  const { t } = useTranslation();
  const [isCompleting, setIsCompleting] = useState(false);

  const handleCompleteStep = async (assignment: any, notes: string) => {
    setIsCompleting(true);
    try {
      await completeStep(assignment.id, notes);
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
      <TaskStatsHeader pendingCount={pendingCount} inProgressCount={inProgressCount} />

      {dashboardTasks.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-muted-foreground text-sm">{t('dashboard.noPendingTasks')}</p>
          <p className="text-muted-foreground text-xs mt-1">{t('dashboard.allCaughtUp')}</p>
        </div>
      ) : (
        <>
          {dashboardTasks.map((assignment) => (
            <TaskItem
              key={assignment.id}
              assignment={assignment}
              onUpdateStatus={updateAssignmentStatus}
              onCompleteStep={handleCompleteStep}
              isCompleting={isCompleting}
            />
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
