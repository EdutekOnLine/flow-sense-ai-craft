
import React, { memo } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import { 
  Play, 
  Square, 
  CheckCircle, 
  AlertCircle,
  Users,
  Clock,
  Trash2,
  GripVertical,
  Mail,
  Database,
  GitBranch,
  Webhook,
  FileText,
  Calendar,
  Filter,
  Timer,
  Send,
  Settings,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WorkflowNodeData extends Record<string, unknown> {
  label: string;
  stepType: string;
  description: string;
  assignedTo: string | null;
  estimatedHours: number | null;
}

const stepTypeConfig = {
  // Triggers
  trigger: { icon: Zap, color: 'border-green-500 bg-green-50', iconColor: 'text-green-600' },
  'form-submitted': { icon: FileText, color: 'border-green-500 bg-green-50', iconColor: 'text-green-600' },
  'schedule-trigger': { icon: Calendar, color: 'border-green-500 bg-green-50', iconColor: 'text-green-600' },
  'webhook-trigger': { icon: Webhook, color: 'border-green-500 bg-green-50', iconColor: 'text-green-600' },
  'record-created': { icon: Database, color: 'border-green-500 bg-green-50', iconColor: 'text-green-600' },
  
  // Actions
  action: { icon: Square, color: 'border-blue-500 bg-blue-50', iconColor: 'text-blue-600' },
  'send-email': { icon: Mail, color: 'border-blue-500 bg-blue-50', iconColor: 'text-blue-600' },
  'update-record': { icon: Database, color: 'border-blue-500 bg-blue-50', iconColor: 'text-blue-600' },
  'send-notification': { icon: Send, color: 'border-blue-500 bg-blue-50', iconColor: 'text-blue-600' },
  'create-task': { icon: CheckCircle, color: 'border-blue-500 bg-blue-50', iconColor: 'text-blue-600' },
  
  // Conditions
  condition: { icon: GitBranch, color: 'border-yellow-500 bg-yellow-50', iconColor: 'text-yellow-600' },
  'if-condition': { icon: GitBranch, color: 'border-yellow-500 bg-yellow-50', iconColor: 'text-yellow-600' },
  filter: { icon: Filter, color: 'border-yellow-500 bg-yellow-50', iconColor: 'text-yellow-600' },
  'switch-case': { icon: Settings, color: 'border-yellow-500 bg-yellow-50', iconColor: 'text-yellow-600' },
  
  // Utilities
  utility: { icon: Settings, color: 'border-purple-500 bg-purple-50', iconColor: 'text-purple-600' },
  wait: { icon: Clock, color: 'border-purple-500 bg-purple-50', iconColor: 'text-purple-600' },
  approval: { icon: Users, color: 'border-purple-500 bg-purple-50', iconColor: 'text-purple-600' },
  'webhook-call': { icon: Webhook, color: 'border-purple-500 bg-purple-50', iconColor: 'text-purple-600' },
  delay: { icon: Timer, color: 'border-purple-500 bg-purple-50', iconColor: 'text-purple-600' },
  'error-handler': { icon: AlertTriangle, color: 'border-red-500 bg-red-50', iconColor: 'text-red-600' },
  
  // Legacy
  start: { icon: Play, color: 'border-green-500 bg-green-50', iconColor: 'text-green-600' },
  task: { icon: Square, color: 'border-blue-500 bg-blue-50', iconColor: 'text-blue-600' },
  review: { icon: CheckCircle, color: 'border-purple-500 bg-purple-50', iconColor: 'text-purple-600' },
  decision: { icon: AlertCircle, color: 'border-yellow-500 bg-yellow-50', iconColor: 'text-yellow-600' },
  assignment: { icon: Users, color: 'border-orange-500 bg-orange-50', iconColor: 'text-orange-600' },
  deadline: { icon: Clock, color: 'border-red-500 bg-red-50', iconColor: 'text-red-600' },
};

export const WorkflowNode = memo(({ data, id }: NodeProps) => {
  const { setNodes, setEdges } = useReactFlow();
  const nodeData = data as WorkflowNodeData;
  const config = stepTypeConfig[nodeData.stepType as keyof typeof stepTypeConfig] || stepTypeConfig.task;
  const Icon = config.icon;

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    
    // Remove the node and its connected edges
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    setEdges((edges) => edges.filter((edge) => edge.source !== id && edge.target !== id));
  };

  return (
    <div className={`relative bg-white border-2 rounded-lg shadow-sm min-w-[200px] ${config.color} cursor-move`}>
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
          <div className="flex items-center gap-2 flex-1">
            <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
            <Icon className={`h-4 w-4 ${config.iconColor}`} />
            <span className="font-medium text-sm text-gray-900 flex-1">{nodeData.label}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="h-6 w-6 p-0 text-gray-400 hover:text-red-500 flex-shrink-0"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
        
        {/* Step Type Badge */}
        <div className="mb-2">
          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${config.color.replace('bg-', 'bg-').replace('border-', 'text-')}`}>
            {nodeData.stepType.charAt(0).toUpperCase() + nodeData.stepType.slice(1).replace('-', ' ')}
          </span>
        </div>
        
        {/* Description */}
        {nodeData.description && (
          <p className="text-xs text-gray-600 mb-2">{nodeData.description}</p>
        )}
        
        {/* Additional Info */}
        <div className="space-y-1">
          {nodeData.assignedTo && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Users className="h-3 w-3" />
              <span>{nodeData.assignedTo}</span>
            </div>
          )}
          {nodeData.estimatedHours && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>{nodeData.estimatedHours}h</span>
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
