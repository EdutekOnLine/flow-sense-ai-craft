
import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { 
  Play, 
  Square, 
  CheckCircle, 
  AlertCircle,
  Users,
  Clock,
  Trash2,
  GripVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WorkflowNodeData {
  label: string;
  stepType: string;
  description: string;
  assignedTo: string | null;
  estimatedHours: number | null;
}

const stepTypeConfig = {
  start: { icon: Play, color: 'border-green-500 bg-green-50', iconColor: 'text-green-600' },
  task: { icon: Square, color: 'border-blue-500 bg-blue-50', iconColor: 'text-blue-600' },
  review: { icon: CheckCircle, color: 'border-purple-500 bg-purple-50', iconColor: 'text-purple-600' },
  decision: { icon: AlertCircle, color: 'border-yellow-500 bg-yellow-50', iconColor: 'text-yellow-600' },
  assignment: { icon: Users, color: 'border-orange-500 bg-orange-50', iconColor: 'text-orange-600' },
  deadline: { icon: Clock, color: 'border-red-500 bg-red-50', iconColor: 'text-red-600' },
};

export const WorkflowNode = memo(({ data, id }: NodeProps<WorkflowNodeData>) => {
  const config = stepTypeConfig[data.stepType as keyof typeof stepTypeConfig] || stepTypeConfig.task;
  const Icon = config.icon;

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    // Delete functionality will be implemented when we add the delete callback
    console.log('Delete node:', id);
  };

  return (
    <div className={`relative bg-white border-2 rounded-lg shadow-sm min-w-[200px] ${config.color}`}>
      {/* Top Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-gray-400 border-2 border-white"
      />
      
      {/* Node Content */}
      <div className="p-3">
        {/* Header with drag handle and delete button */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-gray-400 drag-handle cursor-move" />
            <Icon className={`h-4 w-4 ${config.iconColor}`} />
            <span className="font-medium text-sm text-gray-900">{data.label}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
        
        {/* Step Type Badge */}
        <div className="mb-2">
          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${config.color.replace('bg-', 'bg-').replace('border-', 'text-')}`}>
            {data.stepType.charAt(0).toUpperCase() + data.stepType.slice(1)}
          </span>
        </div>
        
        {/* Description */}
        {data.description && (
          <p className="text-xs text-gray-600 mb-2">{data.description}</p>
        )}
        
        {/* Additional Info */}
        <div className="space-y-1">
          {data.assignedTo && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Users className="h-3 w-3" />
              <span>{data.assignedTo}</span>
            </div>
          )}
          {data.estimatedHours && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>{data.estimatedHours}h</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Bottom Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-gray-400 border-2 border-white"
      />
    </div>
  );
});

WorkflowNode.displayName = 'WorkflowNode';
