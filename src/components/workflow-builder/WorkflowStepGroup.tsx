
import React from 'react';
import { WorkflowStep } from './workflowSteps';
import { WorkflowStepItem } from './WorkflowStepItem';

interface WorkflowStepGroupProps {
  title: string;
  steps: WorkflowStep[];
  colorClass: string;
  onStepClick: (step: WorkflowStep) => void;
  onDragStart: (event: React.DragEvent, step: WorkflowStep) => void;
}

export function WorkflowStepGroup({ 
  title, 
  steps, 
  colorClass, 
  onStepClick, 
  onDragStart 
}: WorkflowStepGroupProps) {
  return (
    <div className="mb-6">
      <h3 className={`text-xs font-semibold uppercase tracking-wide mb-3 px-2 ${colorClass}`}>
        {title}
      </h3>
      <div className="space-y-1">
        {steps.map((step) => (
          <WorkflowStepItem
            key={step.id}
            step={step}
            onStepClick={onStepClick}
            onDragStart={onDragStart}
          />
        ))}
      </div>
    </div>
  );
}
