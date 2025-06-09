
import React from 'react';
import { WorkflowStep, getIconBackgroundColor, getIconColor } from './workflowSteps';

interface WorkflowStepItemProps {
  step: WorkflowStep;
  onStepClick: (step: WorkflowStep) => void;
  onDragStart: (event: React.DragEvent, step: WorkflowStep) => void;
}

export function WorkflowStepItem({ step, onStepClick, onDragStart }: WorkflowStepItemProps) {
  const Icon = step.icon;

  return (
    <button
      key={step.id}
      onClick={() => onStepClick(step)}
      draggable
      onDragStart={(e) => onDragStart(e, step)}
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
}
