
import React from 'react';
import { RefreshCw, Inbox } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { getRTLAwareFlexDirection, getRTLAwareTextAlign } from '@/utils/rtl';
import { useWorkflowInbox } from '@/hooks/useWorkflowInbox';
import { AssignmentCard } from './AssignmentCard';
import { AssignmentActions } from './AssignmentActions';
import { AssignmentFilters } from './AssignmentFilters';

export function WorkflowInbox() {
  const { t } = useTranslation();
  const {
    assignments,
    isLoading,
    isRefreshing,
    isCompleting,
    pendingCount,
    inProgressCount,
    selectedAssignment,
    isCompleteDialogOpen,
    isUpdateDialogOpen,
    notes,
    statusFilter,
    handleRefresh,
    handleStartWorking,
    handleOpenCompleteDialog,
    handleOpenUpdateDialog,
    handleCloseCompleteDialog,
    handleCloseUpdateDialog,
    handleCompleteStep,
    handleUpdateStatus,
    setNotes,
    setStatusFilter,
  } = useWorkflowInbox();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Gradient Header */}
      <div className="relative bg-gradient-theme-primary border border-border rounded-xl p-8">
        <div className="absolute inset-0 bg-gradient-theme-card rounded-xl"></div>
        <div className="relative">
          <div className={`flex items-start justify-between ${getRTLAwareFlexDirection()}`}>
            <div className={`flex items-start gap-4 ${getRTLAwareTextAlign('start')}`}>
              <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
                <Inbox className="h-8 w-8 text-primary-foreground" />
              </div>
              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-foreground">{t('workflow.myActiveTasks')}</h1>
                <p className="text-lg text-muted-foreground">{t('workflow.myActiveTasksDescription')}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-status-pending-bg text-status-pending px-3 py-1">
                    {pendingCount} {t('workflow.pending')}
                  </Badge>
                  <Badge variant="secondary" className="bg-status-active-bg text-status-active px-3 py-1">
                    {inProgressCount} {t('workflow.inProgress')}
                  </Badge>
                  <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                    LIVE
                  </span>
                </div>
              </div>
            </div>
            <div className={`flex items-center gap-4 ${getRTLAwareFlexDirection()}`}>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`bg-card/80 backdrop-blur-sm border-border hover:bg-muted flex items-center gap-2 ${getRTLAwareFlexDirection()}`}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {t('workflow.refresh')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Filter Controls */}
        <AssignmentFilters 
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />

        {/* Tasks Grid */}
        <div className="grid gap-4">
          {assignments.length === 0 ? (
            <Card className="bg-gradient-theme-card border-border">
              <CardContent className={`p-8 text-center ${getRTLAwareTextAlign('center')}`}>
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Inbox className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">{t('workflow.noActiveTasks')}</h3>
                <p className="text-muted-foreground mb-4">
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
                  className={`bg-card/80 backdrop-blur-sm border-border hover:bg-muted flex items-center gap-2 mx-auto ${getRTLAwareFlexDirection()}`}
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {t('workflow.checkForNewTasks')}
                </Button>
              </CardContent>
            </Card>
          ) : (
            assignments.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                onStartWorking={handleStartWorking}
                onOpenCompleteDialog={handleOpenCompleteDialog}
                onOpenUpdateDialog={handleOpenUpdateDialog}
              />
            ))
          )}
        </div>
      </div>

      {/* Action Dialogs */}
      <AssignmentActions
        selectedAssignment={selectedAssignment}
        isCompleteDialogOpen={isCompleteDialogOpen}
        isUpdateDialogOpen={isUpdateDialogOpen}
        isCompleting={isCompleting}
        notes={notes}
        onNotesChange={setNotes}
        onCloseCompleteDialog={handleCloseCompleteDialog}
        onCloseUpdateDialog={handleCloseUpdateDialog}
        onCompleteStep={handleCompleteStep}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}
