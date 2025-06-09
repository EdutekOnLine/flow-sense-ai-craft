
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

export interface WorkflowStep {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
  stepType: string;
}

export const getWorkflowSteps = (t: (key: string) => string) => ({
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
});

export function getIconBackgroundColor(stepType: string): string {
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

export function getIconColor(stepType: string): string {
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
