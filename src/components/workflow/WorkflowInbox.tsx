import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, PlayCircle, XCircle, Calendar, User, ArrowRight, Workflow, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWorkflowAssignments } from '@/hooks/useWorkflowAssignments';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { formatLocalizedDistanceToNow } from '@/utils/localization';
import { getRTLAwareFlexDirection, getRTLAwareTextAlign } from '@/utils/rtl';

type AssignmentStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';

export function WorkflowInbox() {
  const { assignments, isLoading, updateAssignmentStatus, completeStep, refetch } = useWorkflowAssignments();
  const { t, i18n } = useTranslation();
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCompleting, setIsCompleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Set up real-time subscription for new assignments
  useEffect(() => {
    const channel = supabase
      .channel('workflow-assignments-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'workflow_step_assignments'
        },
        (payload) => {
          console.log('New assignment created:', payload);
          // Refresh assignments when a new one is created
          refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'workflow_step_assignments'
        },
        (payload) => {
          console.log('Assignment updated:', payload);
          // Refresh assignments when one is updated
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'in_progress':
        return <PlayCircle className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'skipped':
        return <XCircle className="h-4 w-4 text-gray-500" />;
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
      case 'skipped':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusUpdate = async (newStatus: AssignmentStatus) => {
    if (!selectedAssignment) return;
    
    await updateAssignmentStatus(selectedAssignment.id, newStatus, notes);
    setSelectedAssignment(null);
    setNotes('');
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

  const filteredAssignments = assignments.filter(assignment => {
    if (statusFilter === 'all') return true;
    return assignment.status === statusFilter;
  });

  const pendingCount = assignments.filter(a => a.status === 'pending').length;
  const inProgressCount = assignments.filter(a => a.status === 'in_progress').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={`flex items-center justify-between ${getRTLAwareFlexDirection()}`}>
        <div>
          <h2 className={`text-2xl font-bold text-gray-900 ${getRTLAwareTextAlign()}`}>{t('workflow.myActiveTasks')}</h2>
          <p className={`text-gray-600 ${getRTLAwareTextAlign()}`}>{t('workflow.myActiveTasksDescription')}</p>
        </div>
        <div className={`flex items-center gap-4 ${getRTLAwareFlexDirection()}`}>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`flex items-center gap-2 ${getRTLAwareFlexDirection()}`}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {t('workflow.refresh')}
          </Button>
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            {pendingCount} {t('workflow.pending')}
          </Badge>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {inProgressCount} {t('workflow.inProgress')}
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t('workflow.filterByStatus')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('workflow.allAssignments')}</SelectItem>
            <SelectItem value="pending">{t('workflow.pending')}</SelectItem>
            <SelectItem value="in_progress">{t('workflow.inProgress')}</SelectItem>
            <SelectItem value="completed">{t('workflow.completed')}</SelectItem>
            <SelectItem value="skipped">{t('workflow.skipped')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredAssignments.length === 0 ? (
          <Card>
            <CardContent className={`p-8 text-center ${getRTLAwareTextAlign('center')}`}>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('workflow.noActiveTasks')}</h3>
              <p className="text-gray-600">
                {statusFilter === 'all' 
                  ? t('workflow.noActiveTasksMessage')
                  : `${t('workflow.filterByStatus')} "${t(`workflow.${statusFilter}`)}"`
                }
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`flex items-center gap-2 mt-4 mx-auto ${getRTLAwareFlexDirection()}`}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {t('workflow.checkForNewTasks')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredAssignments.map((assignment) => (
            <Card key={assignment.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className={`flex items-start justify-between ${getRTLAwareFlexDirection()}`}>
                  <div className="space-y-1 flex-1">
                    <CardTitle className={`text-lg ${getRTLAwareTextAlign()}`}>
                      {assignment.workflow_steps.name}
                    </CardTitle>
                    <p className={`text-sm text-gray-600 ${getRTLAwareTextAlign()}`}>
                      Workflow: {assignment.workflow_steps.workflows.name}
                    </p>
                    {assignment.workflow_instance && (
                      <div className={`flex items-center gap-2 text-xs text-blue-600 ${getRTLAwareFlexDirection()}`}>
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
                  <p className={`text-sm text-gray-700 ${getRTLAwareTextAlign()}`}>
                    {assignment.workflow_steps.description}
                  </p>
                )}
                
                <div className={`flex items-center gap-4 text-xs text-gray-500 ${getRTLAwareFlexDirection()}`}>
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
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className={`text-sm text-gray-700 ${getRTLAwareTextAlign()}`}>{assignment.notes}</p>
                  </div>
                )}

                <div className={`flex items-center gap-2 pt-2 border-t ${getRTLAwareFlexDirection()}`}>
                  {assignment.status !== 'completed' && (
                    <>
                      {assignment.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className={`bg-blue-50 hover:bg-blue-100 ${getRTLAwareFlexDirection()}`}
                          onClick={() => updateAssignmentStatus(assignment.id, 'in_progress')}
                        >
                          <PlayCircle className="h-4 w-4 me-1" />
                          Start Working
                        </Button>
                      )}
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            className={`bg-green-600 hover:bg-green-700 ${getRTLAwareFlexDirection()}`}
                            disabled={isCompleting}
                          >
                            <CheckCircle className="h-4 w-4 me-1" />
                            {isCompleting ? 'Completing...' : 'Mark as Done'}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Complete Step</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 pt-4">
                            <div>
                              <h4 className="font-medium mb-2">Step: {assignment.workflow_steps.name}</h4>
                              <p className="text-sm text-gray-600">
                                Workflow: {assignment.workflow_steps.workflows.name}
                              </p>
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Completion Notes</label>
                              <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add notes about the completion of this step..."
                                rows={3}
                              />
                            </div>

                            <div className={`flex gap-2 justify-end ${getRTLAwareFlexDirection()}`}>
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
                                <ArrowRight className="h-4 w-4 me-1" />
                                {isCompleting ? 'Completing...' : 'Complete & Advance Workflow'}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedAssignment(assignment);
                              setNotes(assignment.notes || '');
                            }}
                          >
                            Update Status
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Update Assignment Status</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 pt-4">
                            <div>
                              <h4 className="font-medium mb-2">Step: {selectedAssignment?.workflow_steps.name}</h4>
                              <p className="text-sm text-gray-600">
                                Workflow: {selectedAssignment?.workflow_steps.workflows.name}
                              </p>
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Notes (optional)</label>
                              <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add any notes about this step..."
                                rows={3}
                              />
                            </div>

                            <div className={`flex gap-2 ${getRTLAwareFlexDirection()}`}>
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-blue-50 hover:bg-blue-100"
                                onClick={() => handleStatusUpdate('in_progress')}
                              >
                                Start Working
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleStatusUpdate('skipped')}
                              >
                                Skip
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </>
                  )}
                  
                  {assignment.status === 'completed' && assignment.completed_at && (
                    <div className={`flex items-center gap-2 text-sm text-green-600 ${getRTLAwareFlexDirection()}`}>
                      <CheckCircle className="h-4 w-4" />
                      Completed {formatLocalizedDistanceToNow(new Date(assignment.completed_at), i18n.language, { addSuffix: true })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
