
import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar';
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

const workflowSteps = {
  triggers: [
    {
      id: 'form-submitted',
      label: 'Form Submitted',
      description: 'When a form is submitted',
      icon: FileText,
      stepType: 'trigger',
    },
    {
      id: 'schedule-trigger',
      label: 'Schedule',
      description: 'Run on a schedule',
      icon: Calendar,
      stepType: 'trigger',
    },
    {
      id: 'webhook-trigger',
      label: 'Webhook',
      description: 'When webhook is called',
      icon: Webhook,
      stepType: 'trigger',
    },
    {
      id: 'record-created',
      label: 'Record Created',
      description: 'When a new record is created',
      icon: Database,
      stepType: 'trigger',
    },
  ] as WorkflowStep[],
  actions: [
    {
      id: 'send-email',
      label: 'Send Email',
      description: 'Send an email notification',
      icon: Mail,
      stepType: 'action',
    },
    {
      id: 'update-record',
      label: 'Update Record',
      description: 'Update a database record',
      icon: Database,
      stepType: 'action',
    },
    {
      id: 'send-notification',
      label: 'Send Notification',
      description: 'Send a push notification',
      icon: Send,
      stepType: 'action',
    },
    {
      id: 'create-task',
      label: 'Create Task',
      description: 'Create a new task',
      icon: CheckCircle,
      stepType: 'action',
    },
  ] as WorkflowStep[],
  conditions: [
    {
      id: 'if-condition',
      label: 'If Condition',
      description: 'Branch based on condition',
      icon: GitBranch,
      stepType: 'condition',
    },
    {
      id: 'filter',
      label: 'Filter',
      description: 'Filter records by criteria',
      icon: Filter,
      stepType: 'condition',
    },
    {
      id: 'switch-case',
      label: 'Switch Case',
      description: 'Multiple condition branches',
      icon: Settings,
      stepType: 'condition',
    },
  ] as WorkflowStep[],
  utilities: [
    {
      id: 'wait',
      label: 'Wait',
      description: 'Pause workflow execution',
      icon: Clock,
      stepType: 'utility',
    },
    {
      id: 'approval',
      label: 'Approval',
      description: 'Wait for approval',
      icon: Users,
      stepType: 'utility',
    },
    {
      id: 'webhook-call',
      label: 'Call Webhook',
      description: 'Make HTTP request',
      icon: Webhook,
      stepType: 'utility',
    },
    {
      id: 'delay',
      label: 'Delay',
      description: 'Add time delay',
      icon: Timer,
      stepType: 'utility',
    },
    {
      id: 'error-handler',
      label: 'Error Handler',
      description: 'Handle errors',
      icon: AlertTriangle,
      stepType: 'utility',
    },
  ] as WorkflowStep[],
};

export function WorkflowSidebar({ onAddNode }: WorkflowSidebarProps) {
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
    <SidebarGroup key={title}>
      <SidebarGroupLabel className={`text-xs font-semibold uppercase tracking-wide ${colorClass}`}>
        {title}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <SidebarMenuItem key={step.id}>
                <SidebarMenuButton
                  onClick={() => handleStepClick(step)}
                  draggable
                  onDragStart={(e) => handleDragStart(e, step)}
                  className="cursor-grab active:cursor-grabbing hover:bg-gray-50 p-3 group"
                  size="lg"
                  tooltip={step.description}
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
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <div className="w-80 border-r border-gray-200 bg-white">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Workflow Steps</h2>
        <p className="text-sm text-gray-500 mt-1">
          Drag and drop steps onto the canvas
        </p>
      </div>
      <Sidebar className="w-full">
        <SidebarContent className="px-2 py-4 space-y-6">
          {renderStepGroup('Triggers', workflowSteps.triggers, 'text-green-700')}
          {renderStepGroup('Actions', workflowSteps.actions, 'text-blue-700')}
          {renderStepGroup('Conditions', workflowSteps.conditions, 'text-yellow-700')}
          {renderStepGroup('Utilities', workflowSteps.utilities, 'text-purple-700')}
        </SidebarContent>
      </Sidebar>
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
