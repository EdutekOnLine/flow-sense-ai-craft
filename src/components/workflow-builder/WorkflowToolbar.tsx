
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Play, 
  Square, 
  CheckCircle, 
  AlertCircle,
  Users,
  Clock
} from 'lucide-react';

interface WorkflowToolbarProps {
  onAddNode: (type: string) => void;
}

export function WorkflowToolbar({ onAddNode }: WorkflowToolbarProps) {
  const stepTypes = [
    { type: 'start', label: 'Start', icon: Play, color: 'bg-green-100 text-green-700' },
    { type: 'task', label: 'Task', icon: Square, color: 'bg-blue-100 text-blue-700' },
    { type: 'review', label: 'Review', icon: CheckCircle, color: 'bg-purple-100 text-purple-700' },
    { type: 'decision', label: 'Decision', icon: AlertCircle, color: 'bg-yellow-100 text-yellow-700' },
    { type: 'assignment', label: 'Assignment', icon: Users, color: 'bg-orange-100 text-orange-700' },
    { type: 'deadline', label: 'Deadline', icon: Clock, color: 'bg-red-100 text-red-700' },
  ];

  return (
    <div className="p-4 border-b border-gray-200 bg-gray-50">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-gray-700 mr-4">Add Step:</span>
        {stepTypes.map((stepType) => {
          const Icon = stepType.icon;
          return (
            <Button
              key={stepType.type}
              variant="outline"
              size="sm"
              onClick={() => onAddNode(stepType.type)}
              className={`flex items-center gap-2 ${stepType.color} border-gray-300 hover:border-gray-400`}
            >
              <Icon className="h-4 w-4" />
              {stepType.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
