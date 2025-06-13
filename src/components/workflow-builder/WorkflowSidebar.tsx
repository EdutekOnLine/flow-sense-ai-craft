
import React from 'react';
import { useTranslation } from 'react-i18next';
import { WorkflowStep, getWorkflowSteps } from './workflowSteps';
import { WorkflowStepGroup } from './WorkflowStepGroup';

interface WorkflowSidebarProps {
  onAddNode: (type: string, label: string, description: string) => void;
}

export function WorkflowSidebar({ onAddNode }: WorkflowSidebarProps) {
  const { t } = useTranslation();
  const workflowSteps = getWorkflowSteps(t);

  const handleStepClick = (step: WorkflowStep) => {
    onAddNode(step.stepType, step.label, step.description);
  };

  const handleDragStart = (event: React.DragEvent, step: WorkflowStep) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({
      type: step.stepType,
      label: step.label,
      description: step.description,
    }));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-80 border-r border-border bg-card">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-card-foreground">{t('workflowBuilder.workflowSteps')}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t('workflowBuilder.dragAndDrop')}
        </p>
      </div>
      <div className="px-2 py-4 space-y-6 overflow-y-auto h-full">
        <WorkflowStepGroup
          title={t('workflowBuilder.triggers')}
          steps={workflowSteps.triggers}
          colorClass="text-primary"
          onStepClick={handleStepClick}
          onDragStart={handleDragStart}
        />
        <WorkflowStepGroup
          title={t('workflowBuilder.actions')}
          steps={workflowSteps.actions}
          colorClass="text-secondary"
          onStepClick={handleStepClick}
          onDragStart={handleDragStart}
        />
        <WorkflowStepGroup
          title={t('workflowBuilder.conditions')}
          steps={workflowSteps.conditions}
          colorClass="text-accent"
          onStepClick={handleStepClick}
          onDragStart={handleDragStart}
        />
        <WorkflowStepGroup
          title={t('workflowBuilder.utilities')}
          steps={workflowSteps.utilities}
          colorClass="text-muted-foreground"
          onStepClick={handleStepClick}
          onDragStart={handleDragStart}
        />
      </div>
    </div>
  );
}
