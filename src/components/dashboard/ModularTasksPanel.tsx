
import React from 'react';
import { useModulePermissions } from '@/hooks/useModulePermissions';
import { DashboardTasks } from './tasks/DashboardTasks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckSquare, 
  Users, 
  FileText, 
  BookOpen,
  Inbox
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ModularTasksPanelProps {
  onViewAllTasks: () => void;
}

export function ModularTasksPanel({ onViewAllTasks }: ModularTasksPanelProps) {
  const { canAccessModule, getAccessibleModules } = useModulePermissions();
  const { t } = useTranslation();
  const accessibleModules = getAccessibleModules();

  // If user has NeuraFlow access, show workflow tasks
  if (canAccessModule('neura-flow')) {
    return <DashboardTasks onViewAllTasks={onViewAllTasks} />;
  }

  // For other modules, show placeholder tasks
  const getModuleTasks = () => {
    const tasks = [];

    if (canAccessModule('neura-crm')) {
      tasks.push({
        id: 'crm-1',
        title: 'Follow up with new leads',
        description: 'Review and contact recent lead submissions',
        module: 'NeuraCRM',
        icon: Users,
        count: 3
      });
    }

    if (canAccessModule('neura-forms')) {
      tasks.push({
        id: 'forms-1',
        title: 'Review form submissions',
        description: 'Process pending form responses',
        module: 'NeuraForms',
        icon: FileText,
        count: 7
      });
    }

    if (canAccessModule('neura-edu')) {
      tasks.push({
        id: 'edu-1',
        title: 'Grade assignments',
        description: 'Review student submissions',
        module: 'NeuraEdu',
        icon: BookOpen,
        count: 12
      });
    }

    return tasks;
  };

  const moduleTasks = getModuleTasks();

  if (moduleTasks.length === 0) {
    return (
      <div className="text-center py-6">
        <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground text-sm">{t('dashboard.noTasks')}</p>
        <p className="text-muted-foreground text-xs mt-1">All caught up!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {moduleTasks.map((task) => {
        const Icon = task.icon;
        return (
          <Card key={task.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-medium text-sm">{task.title}</h4>
                    <p className="text-xs text-muted-foreground">{task.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{task.count}</Badge>
                  <Badge variant="outline" className="text-xs">{task.module}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
