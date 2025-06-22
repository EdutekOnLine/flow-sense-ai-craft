
import React from 'react';
import { useModulePermissions } from '@/hooks/useModulePermissions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Inbox, CheckSquare, Users, FileText, BookOpen, Plus, Calendar, User } from 'lucide-react';

interface ModularTasksPanelProps {
  onViewAllTasks: () => void;
}

export function ModularTasksPanel({ onViewAllTasks }: ModularTasksPanelProps) {
  const { getAccessibleModules, canAccessModule } = useModulePermissions();
  
  const accessibleModules = getAccessibleModules();
  const hasMultipleModules = accessibleModules.length > 1;

  const getTasksPanelTitle = () => {
    if (hasMultipleModules) {
      return 'My Tasks & Assignments';
    }
    if (canAccessModule('neura-flow')) return 'My Assigned Tasks';
    if (canAccessModule('neura-crm')) return 'My CRM Tasks';
    if (canAccessModule('neura-forms')) return 'My Form Reviews';
    if (canAccessModule('neura-edu')) return 'My Teaching Tasks';
    return 'My Tasks';
  };

  const getTasksPanelDescription = () => {
    if (hasMultipleModules) {
      return 'Tasks and assignments from all your active modules';
    }
    if (canAccessModule('neura-flow')) return 'Tasks assigned specifically to you';
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

  const getPlaceholderTasks = () => {
    if (hasMultipleModules) {
      return [
        { id: 1, title: 'Review CRM leads', module: 'CRM', type: 'follow-up', priority: 'high' },
        { id: 2, title: 'Grade assignment submissions', module: 'Education', type: 'review', priority: 'medium' },
        { id: 3, title: 'Process form responses', module: 'Forms', type: 'data-entry', priority: 'low' }
      ];
    }
    
    if (canAccessModule('neura-crm')) {
      return [
        { id: 1, title: 'Follow up with John Smith', module: 'CRM', type: 'call', priority: 'high' },
        { id: 2, title: 'Prepare sales presentation', module: 'CRM', type: 'preparation', priority: 'medium' },
        { id: 3, title: 'Update customer records', module: 'CRM', type: 'data-entry', priority: 'low' }
      ];
    }
    
    if (canAccessModule('neura-forms')) {
      return [
        { id: 1, title: 'Review customer feedback forms', module: 'Forms', type: 'review', priority: 'high' },
        { id: 2, title: 'Approve registration submissions', module: 'Forms', type: 'approval', priority: 'medium' }
      ];
    }
    
    if (canAccessModule('neura-edu')) {
      return [
        { id: 1, title: 'Grade Math Assignment #5', module: 'Education', type: 'grading', priority: 'high' },
        { id: 2, title: 'Prepare next week\'s lesson plan', module: 'Education', type: 'preparation', priority: 'medium' },
        { id: 3, title: 'Update student progress reports', module: 'Education', type: 'reporting', priority: 'low' }
      ];
    }
    
    return [];
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const TasksIcon = getTasksIcon();
  const placeholderTasks = getPlaceholderTasks();

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
        {accessibleModules.length > 0 ? (
          <div className="space-y-4">
            {/* Stats header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-red-100 text-red-800 text-xs">
                  {placeholderTasks.filter(t => t.priority === 'high').length} High Priority
                </Badge>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                  {placeholderTasks.filter(t => t.priority === 'medium').length} Medium Priority
                </Badge>
              </div>
            </div>

            {placeholderTasks.length > 0 ? (
              <>
                {placeholderTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="bg-gradient-theme-primary/60 backdrop-blur-sm border border-border rounded-lg p-4 hover:bg-gradient-theme-primary/80 transition-all duration-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
                          <CheckSquare className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate text-foreground">
                            {task.title}
                          </h4>
                          <p className="text-xs text-muted-foreground truncate">
                            {task.module} • {task.type}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Assigned 2 hours ago
                          </p>
                        </div>
                      </div>
                      <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs bg-gradient-to-r from-secondary/10 to-secondary/5 hover:from-secondary/20 hover:to-secondary/10 border-secondary/30 text-secondary-foreground"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Start
                      </Button>
                      <Button
                        size="sm"
                        className="h-7 text-xs bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                      >
                        <CheckSquare className="h-3 w-3 mr-1" />
                        Complete
                      </Button>
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
                    View All Tasks ({placeholderTasks.length})
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <TasksIcon className="h-12 w-12 text-primary/40 mx-auto mb-4" />
                <p className="text-primary mb-2">No pending tasks</p>
                <p className="text-sm text-muted-foreground">All caught up! New tasks will appear here.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <TasksIcon className="h-12 w-12 text-primary/40 mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">No tasks available</p>
            <p className="text-muted-foreground text-xs mt-1">Tasks will appear here based on your module permissions</p>
          </div>
        )}
      </div>
    </div>
  );
}
