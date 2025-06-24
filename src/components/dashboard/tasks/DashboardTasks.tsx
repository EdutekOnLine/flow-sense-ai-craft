
import React, { useState } from 'react';
import { RefreshCw, Inbox, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWorkflowAssignments } from '@/hooks/useWorkflowAssignments';
import { useRootPermissions } from '@/hooks/useRootPermissions';
import { useTranslation } from 'react-i18next';
import { TaskStatsHeader } from './TaskStatsHeader';
import { TaskItem } from './TaskItem';

interface DashboardTasksProps {
  onViewAllTasks: () => void;
}

export function DashboardTasks({ onViewAllTasks }: DashboardTasksProps) {
  const { assignments, isLoading, updateAssignmentStatus, completeStep } = useWorkflowAssignments();
  const { isRootUser } = useRootPermissions();
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

  // Root users see all tasks, others see only their assigned tasks
  const dashboardTasks = assignments
    .filter(assignment => {
      if (isRootUser) return true; // Root users see all tasks
      return assignment.status === 'pending' || assignment.status === 'in_progress';
    })
    .slice(0, isRootUser ? 10 : 5); // Root users see more tasks

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
      {isRootUser && (
        <div className="flex items-center gap-2 mb-4">
          <Crown className="h-4 w-4 text-amber-600" />
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs">
            System-Wide View
          </Badge>
        </div>
      )}
      
      <TaskStatsHeader 
        pendingCount={pendingCount} 
        inProgressCount={inProgressCount}
        isSystemWide={isRootUser}
      />

      {dashboardTasks.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-muted-foreground text-sm">
            {isRootUser ? t('dashboard.noSystemTasks') : t('dashboard.noPendingTasks')}
          </p>
          <p className="text-muted-foreground text-xs mt-1">
            {isRootUser ? t('dashboard.systemAllCaughtUp') : t('dashboard.allCaughtUp')}
          </p>
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
              showWorkspaceInfo={isRootUser}
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
              {isRootUser 
                ? `View All System Tasks (${assignments.length})`
                : `${t('tasks.viewAllTasks')} (${assignments.length})`
              }
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
