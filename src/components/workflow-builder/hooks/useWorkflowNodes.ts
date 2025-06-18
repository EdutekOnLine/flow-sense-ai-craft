
import { useCallback, useState } from 'react';
import { Node, useNodesState, OnNodesChange } from '@xyflow/react';
import { useToast } from '@/hooks/use-toast';
import { useWorkflowPermissions } from '@/hooks/useWorkflowPermissions';

interface WorkflowNodeData extends Record<string, unknown> {
  label: string;
  stepType: string;
  description: string;
  assignedTo: string | null;
  estimatedHours: number | null;
  onConfigure?: () => void;
  emailConfig?: {
    to?: string;
    subject?: string;
    body?: string;
  };
  webhookConfig?: {
    url?: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
  };
  conditionConfig?: {
    field?: string;
    operator?: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
    value?: string;
  };
  delayConfig?: {
    duration?: number;
    unit?: 'minutes' | 'hours' | 'days';
  };
}

interface UseWorkflowNodesProps {
  generatePersistentNodeId: () => string;
  handleOpenNodeConfiguration: (nodeId: string) => void;
}

export function useWorkflowNodes({
  generatePersistentNodeId,
  handleOpenNodeConfiguration,
}: UseWorkflowNodesProps) {
  const { toast } = useToast();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const { canCreateWorkflows, canEditWorkflows } = useWorkflowPermissions();

  const onUpdateNodeData = useCallback((nodeId: string, newData: Partial<WorkflowNodeData>) => {
    if (!canEditWorkflows) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to edit workflow nodes.",
        variant: "destructive",
      });
      return;
    }

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          const updatedNode = { 
            ...node, 
            data: { 
              ...node.data, 
              ...newData,
              onConfigure: () => handleOpenNodeConfiguration(nodeId),
            } 
          };
          if (selectedNode?.id === nodeId) {
            setSelectedNode(updatedNode);
          }
          return updatedNode;
        }
        return node;
      })
    );
  }, [setNodes, selectedNode, canEditWorkflows, toast, handleOpenNodeConfiguration]);

  const onAddNode = useCallback((type: string, label: string, description: string = '') => {
    if (!canCreateWorkflows) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to add nodes to workflows.",
        variant: "destructive",
      });
      return;
    }

    const persistentId = generatePersistentNodeId();
    
    const newNode: Node = {
      id: persistentId,
      type: 'workflowStep',
      position: { x: 250, y: 100 + nodes.length * 150 },
      data: { 
        label: label,
        stepType: type,
        description: description,
        assignedTo: null,
        estimatedHours: null,
        onConfigure: () => handleOpenNodeConfiguration(persistentId),
      } as WorkflowNodeData,
      draggable: true,
    };
    
    setNodes((nds) => nds.concat(newNode));
  }, [nodes.length, setNodes, generatePersistentNodeId, canCreateWorkflows, toast, handleOpenNodeConfiguration]);

  return {
    nodes,
    setNodes,
    onNodesChange,
    selectedNode,
    setSelectedNode,
    onUpdateNodeData,
    onAddNode,
  };
}
