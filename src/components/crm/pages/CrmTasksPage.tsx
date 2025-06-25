
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCrmData } from '@/hooks/useCrmData';
import { useCrmTasks } from '@/hooks/useCrmTasks';
import { 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal,
  CheckSquare,
  Calendar,
  User,
  Building2,
  Clock,
  AlertCircle,
  Edit,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CreateTaskDialog } from '@/components/crm/CreateTaskDialog';
import { EditTaskDialog } from '@/components/crm/EditTaskDialog';
import type { CrmTask } from '@/modules/neura-crm';

export function CrmTasksPage() {
  const { tasks, isLoading } = useCrmData();
  const { updateTaskStatus, deleteTask, isUpdatingStatus, isDeleting } = useCrmTasks();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<CrmTask | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<CrmTask | null>(null);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = searchTerm === '' || 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const groupedTasks = {
    pending: filteredTasks.filter(task => task.status === 'pending'),
    in_progress: filteredTasks.filter(task => task.status === 'in_progress'),
    completed: filteredTasks.filter(task => task.status === 'completed'),
    cancelled: filteredTasks.filter(task => task.status === 'cancelled'),
  };

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const handleEditTask = (task: CrmTask) => {
    setEditingTask(task);
    setShowEditDialog(true);
  };

  const handleMarkComplete = async (task: CrmTask) => {
    try {
      await updateTaskStatus({ 
        taskId: task.id, 
        status: task.status === 'completed' ? 'pending' : 'completed' 
      });
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    
    try {
      await deleteTask(taskToDelete.id);
      setTaskToDelete(null);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const TaskCard = ({ task }: { task: typeof tasks[0] }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base">{task.title}</CardTitle>
            {task.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEditTask(task)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Task
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleMarkComplete(task)}
                disabled={isUpdatingStatus}
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                {task.status === 'completed' ? 'Mark Incomplete' : 'Mark Complete'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => setTaskToDelete(task)}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant={
            task.priority === 'urgent' ? 'destructive' :
            task.priority === 'high' ? 'secondary' :
            task.priority === 'medium' ? 'outline' : 'default'
          }>
            {task.priority}
          </Badge>
          <Badge variant={
            task.status === 'completed' ? 'default' :
            task.status === 'in_progress' ? 'secondary' : 'outline'
          }>
            {task.status.replace('_', ' ')}
          </Badge>
        </div>

        {task.crm_contacts && (
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{task.crm_contacts.first_name} {task.crm_contacts.last_name}</span>
          </div>
        )}

        {task.companies && (
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span>{task.companies.name}</span>
          </div>
        )}

        {task.due_date && (
          <div className={`flex items-center gap-2 text-sm ${
            isOverdue(task.due_date) ? 'text-destructive' : 'text-muted-foreground'
          }`}>
            {isOverdue(task.due_date) ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <Calendar className="h-4 w-4" />
            )}
            <span>
              {isOverdue(task.due_date) ? 'Overdue: ' : 'Due: '}
              {new Date(task.due_date).toLocaleDateString()}
            </span>
          </div>
        )}

        {task.profiles && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>Assigned to: {task.profiles.first_name} {task.profiles.last_name}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Created {new Date(task.created_at).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-muted rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-48 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">CRM Tasks</h1>
          <p className="text-muted-foreground">Manage tasks related to contacts and companies</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Task
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Kanban Board */}
      <Tabs defaultValue="kanban" className="w-full">
        <TabsList>
          <TabsTrigger value="kanban">Kanban View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="kanban" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pending Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Pending</h3>
                <Badge variant="outline">{groupedTasks.pending.length}</Badge>
              </div>
              <div className="space-y-3">
                {groupedTasks.pending.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>

            {/* In Progress Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">In Progress</h3>
                <Badge variant="outline">{groupedTasks.in_progress.length}</Badge>
              </div>
              <div className="space-y-3">
                {groupedTasks.in_progress.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>

            {/* Completed Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Completed</h3>
                <Badge variant="outline">{groupedTasks.completed.length}</Badge>
              </div>
              <div className="space-y-3">
                {groupedTasks.completed.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>

            {/* Cancelled Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Cancelled</h3>
                <Badge variant="outline">{groupedTasks.cancelled.length}</Badge>
              </div>
              <div className="space-y-3">
                {groupedTasks.cancelled.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <div className="space-y-3">
            {filteredTasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {filteredTasks.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'No tasks match your current filters.' 
                : 'Get started by creating your first task.'}
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <CreateTaskDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog}
      />
      
      <EditTaskDialog 
        task={editingTask}
        open={showEditDialog} 
        onOpenChange={setShowEditDialog}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!taskToDelete} onOpenChange={() => setTaskToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task
              "{taskToDelete?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteTask}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Task
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
