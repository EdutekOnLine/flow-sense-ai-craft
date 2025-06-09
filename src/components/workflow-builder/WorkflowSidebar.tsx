
import React from 'react';
import {
  Play,
  Mail,
  Database,
  GitBranch,
  Clock,
  CheckCircle,
  Webhook,
  FileText,
  Calendar,
  AlertTriangle,
  Zap,
  Settings,
  Users,
  Filter,
  Timer,
  Send,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface WorkflowStep {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
  stepType: string;
}

interface WorkflowSidebarProps {
  onAddNode: (type: string, label: string, description: string) => void;
}

export function WorkflowSidebar({ onAddNode }: WorkflowSidebarProps) {
  const { t } = useTranslation();

  const workflowSteps = {
    triggers: [
      {
        id: 'form-submitted',
        label: t('workflowBuilder.steps.formSubmitted'),
        description: t('workflowBuilder.steps.formSubmittedDesc'),
        icon: FileText,
        stepType: 'trigger',
      },
      {
        id: 'schedule-trigger',
        label: t('workflowBuilder.steps.schedule'),
        description: t('workflowBuilder.steps.scheduleDesc'),
        icon: Calendar,
        stepType: 'trigger',
      },
      {
        id: 'webhook-trigger',
        label: t('workflowBuilder.steps.webhook'),
        description: t('workflowBuilder.steps.webhookDesc'),
        icon: Webhook,
        stepType: 'trigger',
      },
      {
        id: 'record-created',
        label: t('workflowBuilder.steps.recordCreated'),
        description: t('workflowBuilder.steps.recordCreatedDesc'),
        icon: Database,
        stepType: 'trigger',
      },
    ] as WorkflowStep[],
    actions: [
      {
        id: 'send-email',
        label: t('workflowBuilder.steps.sendEmail'),
        description: t('workflowBuilder.steps.sendEmailDesc'),
        icon: Mail,
        stepType: 'action',
      },
      {
        id: 'update-record',
        label: t('workflowBuilder.steps.updateRecord'),
        description: t('workflowBuilder.steps.updateRecordDesc'),
        icon: Database,
        stepType: 'action',
      },
      {
        id: 'send-notification',
        label: t('workflowBuilder.steps.sendNotification'),
        description: t('workflowBuilder.steps.sendNotificationDesc'),
        icon: Send,
        stepType: 'action',
      },
      {
        id: 'create-task',
        label: t('workflowBuilder.steps.createTask'),
        description: t('workflowBuilder.steps.createTaskDesc'),
        icon: CheckCircle,
        stepType: 'action',
      },
    ] as WorkflowStep[],
    conditions: [
      {
        id: 'if-condition',
        label: t('workflowBuilder.steps.ifCondition'),
        description: t('workflowBuilder.steps.ifConditionDesc'),
        icon: GitBranch,
        stepType: 'condition',
      },
      {
        id: 'filter',
        label: t('workflowBuilder.steps.filter'),
        description: t('workflowBuilder.steps.filterDesc'),
        icon: Filter,
        stepType: 'condition',
      },
      {
        id: 'switch-case',
        label: t('workflowBuilder.steps.switchCase'),
        description: t('workflowBuilder.steps.switchCaseDesc'),
        icon: Settings,
        stepType: 'condition',
      },
    ] as WorkflowStep[],
    utilities: [
      {
        id: 'wait',
        label: t('workflowBuilder.steps.wait'),
        description: t('workflowBuilder.steps.waitDesc'),
        icon: Clock,
        stepType: 'utility',
      },
      {
        id: 'approval',
        label: t('workflowBuilder.steps.approval'),
        description: t('workflowBuilder.steps.approvalDesc'),
        icon: Users,
        stepType: 'utility',
      },
      {
        id: 'webhook-call',
        label: t('workflowBuilder.steps.webhookCall'),
        description: t('workflowBuilder.steps.webhookCallDesc'),
        icon: Webhook,
        stepType: 'utility',
      },
      {
        id: 'delay',
        label: t('workflowBuilder.steps.delay'),
        description: t('workflowBuilder.steps.delayDesc'),
        icon: Timer,
        stepType: 'utility',
      },
      {
        id: 'error-handler',
        label: t('workflowBuilder.steps.errorHandler'),
        description: t('workflowBuilder.steps.errorHandlerDesc'),
        icon: AlertTriangle,
        stepType: 'utility',
      },
    ] as WorkflowStep[],
  };

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

  const renderStepGroup = (title: string, steps: WorkflowStep[], colorClass: string) => (
    <div key={title} className="mb-6">
      <h3 className={`text-xs font-semibold uppercase tracking-wide mb-3 px-2 ${colorClass}`}>
        {title}
      </h3>
      <div className="space-y-1">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <button
              key={step.id}
              onClick={() => handleStepClick(step)}
              draggable
              onDragStart={(e) => handleDragStart(e, step)}
              className="w-full cursor-grab active:cursor-grabbing hover:bg-gray-50 p-3 group rounded-lg text-left transition-colors"
              title={step.description}
            >
              <div className="flex items-center gap-3 w-full">
                <div className={`p-2 rounded-lg ${getIconBackgroundColor(step.stepType)}`}>
                  <Icon className={`h-4 w-4 ${getIconColor(step.stepType)}`} />
                </div>
                <div className="flex flex-col items-start text-left min-w-0 flex-1">
                  <span className="font-medium text-sm text-gray-900 truncate">
                    {step.label}
                  </span>
                  <span className="text-xs text-gray-500 truncate w-full">
                    {step.description}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="w-80 border-r border-gray-200 bg-white">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">{t('workflowBuilder.workflowSteps')}</h2>
        <p className="text-sm text-gray-500 mt-1">
          {t('workflowBuilder.dragAndDrop')}
        </p>
      </div>
      <div className="px-2 py-4 space-y-6 overflow-y-auto h-full">
        {renderStepGroup(t('workflowBuilder.triggers'), workflowSteps.triggers, 'text-green-700')}
        {renderStepGroup(t('workflowBuilder.actions'), workflowSteps.actions, 'text-blue-700')}
        {renderStepGroup(t('workflowBuilder.conditions'), workflowSteps.conditions, 'text-yellow-700')}
        {renderStepGroup(t('workflowBuilder.utilities'), workflowSteps.utilities, 'text-purple-700')}
      </div>
    </div>
  );
}

function getIconBackgroundColor(stepType: string): string {
  switch (stepType) {
    case 'trigger':
      return 'bg-green-100';
    case 'action':
      return 'bg-blue-100';
    case 'condition':
      return 'bg-yellow-100';
    case 'utility':
      return 'bg-purple-100';
    default:
      return 'bg-gray-100';
  }
}

function getIconColor(stepType: string): string {
  switch (stepType) {
    case 'trigger':
      return 'text-green-600';
    case 'action':
      return 'text-blue-600';
    case 'condition':
      return 'text-yellow-600';
    case 'utility':
      return 'text-purple-600';
    default:
      return 'text-gray-600';
  }
}
