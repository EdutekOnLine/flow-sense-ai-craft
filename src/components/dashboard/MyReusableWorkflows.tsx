
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMyReusableWorkflows } from '@/hooks/useMyReusableWorkflows';
import { useUsers } from '@/hooks/useUsers';
import { useTranslation } from 'react-i18next';
import { StartWorkflowDialog } from '@/components/workflow/StartWorkflowDialog';
import { Repeat, Calendar, User, Rocket, RefreshCw } from 'lucide-react';
import { formatLocalizedDistanceToNow } from '@/utils/localization';
import { StartableWorkflow } from '@/hooks/useWorkflowInstances';
import { getRTLAwareFlexDirection, getRTLAwareTextAlign } from '@/utils/rtl';

interface MyReusableWorkflowsProps {
  onStartWorkflow?: (workflowId: string, startData: any) => Promise<void>;
}

export function MyReusableWorkflows({ onStartWorkflow }: MyReusableWorkflowsProps) {
  const { workflows, isLoading } = useMyReusableWorkflows();
  const { data: users } = useUsers();
  const { t, i18n } = useTranslation();

  // Convert saved workflow to startable workflow format
  const convertToStartableWorkflow = (savedWorkflow: any): StartableWorkflow => {
    return {
      id: savedWorkflow.id,
      name: savedWorkflow.name,
      description: savedWorkflow.description,
      is_reusable: savedWorkflow.is_reusable || false,
      start_step: {
        id: 'start',
        name: 'Start Step',
        description: '',
        metadata: {}
      }
    };
  };

  // Get the assigned user name
  const getAssignedUserName = (workflow: any) => {
    const assignedUserId = workflow.assigned_to;
    
    if (!assignedUserId) {
      return t('workflow.unassigned');
    }
    
    const user = users?.find(u => u.id === assignedUserId);
    if (user) {
      const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ');
      return fullName || user.email;
    }
    
    return assignedUserId; // Fallback to ID if user not found
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {workflows.length === 0 ? (
        <div className={`text-center py-8 ${getRTLAwareTextAlign('center')}`}>
          <Repeat className="h-12 w-12 text-secondary mx-auto mb-4" />
          <p className="text-secondary mb-2">{t('dashboard.noReusableWorkflows')}</p>
          <p className="text-sm text-muted-foreground">{t('dashboard.reusableWorkflowsInfo')}</p>
        </div>
      ) : (
        workflows.map((workflow) => (
          <div
            key={workflow.id}
            className="border border-border rounded-lg p-4 bg-card hover:bg-muted/5 transition-colors"
          >
            <div className={`flex items-start justify-between mb-2 ${getRTLAwareFlexDirection()}`}>
              <div className="flex-1">
                <div className={`flex items-center gap-2 mb-1 ${getRTLAwareFlexDirection()}`}>
                  <h4 className={`font-medium text-sm text-card-foreground ${getRTLAwareTextAlign()}`}>{workflow.name}</h4>
                  <Badge className="bg-secondary/10 text-secondary border-secondary/20">
                    <Repeat className="h-3 w-3 me-1" />
                    {t('workflow.reusable')}
                  </Badge>
                </div>
                {workflow.description && (
                  <p className={`text-xs text-muted-foreground mb-2 ${getRTLAwareTextAlign()}`}>{workflow.description}</p>
                )}
                <div className={`flex items-center gap-4 text-xs text-muted-foreground rtl-aware-flex`}>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {t('workflow.updated')} {formatLocalizedDistanceToNow(new Date(workflow.updated_at), i18n.language)}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {t('workflow.assignedTo')}: {getAssignedUserName(workflow)}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {workflow.status}
                  </Badge>
                </div>
              </div>
              <div className={`flex items-center gap-2 ms-4`}>
                {onStartWorkflow && (
                  <StartWorkflowDialog
                    workflow={convertToStartableWorkflow(workflow)}
                    onStartWorkflow={onStartWorkflow}
                    trigger={
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground rtl-button-reverse"
                      >
                        <Rocket className="h-3 w-3 me-1" />
                        {t('workflow.launch')}
                      </Button>
                    }
                  />
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
