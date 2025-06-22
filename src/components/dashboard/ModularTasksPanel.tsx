
import React from 'react';
import { useModulePermissions } from '@/hooks/useModulePermissions';
import { DashboardTasks } from './tasks/DashboardTasks';
import { Badge } from '@/components/ui/badge';
import { Inbox, CheckSquare, Users, FileText, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ModularTasksPanelProps {
  onViewAllTasks: () => void;
}

export function ModularTasksPanel({ onViewAllTasks }: ModularTasksPanelProps) {
  const { getAccessibleModules, canAccessModule } = useModulePermissions();
  const { t } = useTranslation();
  
  const accessibleModules = getAccessibleModules();
  const hasMultipleModules = accessibleModules.length > 1;

  const getTasksPanelTitle = () => {
    if (hasMultipleModules) {
      return 'My Tasks & Assignments';
    }
    if (canAccessModule('neura-flow')) return t('dashboard.myAssignedTasks');
    if (canAccessModule('neura-crm')) return 'My CRM Tasks';
    if (canAccessModule('neura-forms')) return 'My Form Reviews';
    if (canAccessModule('neura-edu')) return 'My Teaching Tasks';
    return 'My Tasks';
  };

  const getTasksPanelDescription = () => {
    if (hasMultipleModules) {
      return 'Tasks and assignments from all your active modules';
    }
    if (canAccessModule('neura-flow')) return t('dashboard.myAssignedTasksDescription');
    if (canAccessModule('neura-crm')) return 'Follow-ups, meetings, and customer tasks';
    if (canAccessModule('neura-forms')) return 'Form submissions requiring your review';
    if (canAccessModule('neura-edu')) return 'Assignments to grade and course updates';
    return 'Your pending tasks and assignments';
  };

  const getTasksIcon = () => {
    if (hasMultipleModules) return CheckSquare;
    if (canAccessModule('neura-flow')) return Inbox;
    if (canAccessModule('neura-crm')) return Users;
    if (canAccessModule('neura-forms')) return FileText;
    if (canAccessModule('neura-edu')) return BookOpen;
    return Inbox;
  };

  const TasksIcon = getTasksIcon();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-primary to-primary/70 rounded-xl shadow-card">
          <TasksIcon className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold text-foreground">{getTasksPanelTitle()}</h2>
            {hasMultipleModules && (
              <Badge className="bg-gradient-to-r from-accent to-accent/80 text-accent-foreground">
                Multi-Module
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">{getTasksPanelDescription()}</p>
        </div>
      </div>
      <div className="bg-gradient-theme-primary p-6 rounded-xl border border-border">
        {canAccessModule('neura-flow') ? (
          <DashboardTasks onViewAllTasks={onViewAllTasks} />
        ) : (
          <div className="text-center py-6">
            <p className="text-muted-foreground text-sm">No tasks available for your active modules</p>
            <p className="text-muted-foreground text-xs mt-1">Tasks will appear here based on your module permissions</p>
          </div>
        )}
      </div>
    </div>
  );
}
