import { useCallback, useState } from 'react';
import { Node, Edge, addEdge, Connection, useNodesState, useEdgesState, OnNodesChange, OnEdgesChange, OnConnect, MarkerType, OnSelectionChangeFunc } from '@xyflow/react';
import { useToast } from '@/hooks/use-toast';
import { useWorkflowPermissions } from '@/hooks/useWorkflowPermissions';
import { useStepSuggestions } from '@/hooks/useStepSuggestions';

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

interface UseWorkflowActionsProps {
  generatePersistentNodeId: () => string;
  reactFlowInstance: any;
  setContextualSuggestionsPosition: (position: { x: number; y: number } | null) => void;
  setShowAssistant: (show: boolean) => void;
  aiAssistantEnabled: boolean;
}

export function useWorkflowActions({
  generatePersistentNodeId,
  reactFlowInstance,
  setContextualSuggestionsPosition,
  setShowAssistant,
  aiAssistantEnabled,
}: UseWorkflowActionsProps) {
  const { toast } = useToast();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isNodeEditorOpen, setIsNodeEditorOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { canCreateWorkflows, canEditWorkflows, canDeleteWorkflows } = useWorkflowPermissions();
  const { suggestions, isLoading: isSuggestionsLoading, generateSuggestions } = useStepSuggestions();

  const availableFields = ['name', 'email', 'status', 'date', 'amount']; // Mock data
  const selectedNodeLabel: string = (selectedNode?.data as WorkflowNodeData)?.label || '';

  const generatePersistentEdgeId = useCallback((sourceId: string, targetId: string) => {
    return `edge-${sourceId}-${targetId}-${Date.now()}`;
  }, []);

  const handleOpenNodeConfiguration = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setSelectedNode(node);
      setIsNodeEditorOpen(true);
    }
  }, [nodes]);

  const onConnect: OnConnect = useCallback(
    (params: Connection) => {
      console.log('Connecting nodes:', params);
      
      if (!canCreateWorkflows) {
        toast({
          title: "Permission Denied",
          description: "You don't have permission to connect nodes.",
          variant: "destructive",
        });
        return;
      }

      const sourceNode = nodes.find(node => node.id === params.source);
      const sourceNodeData = sourceNode?.data as WorkflowNodeData;
      
      let edgeType = 'default';
      let edgeLabel = '';
      
      if (sourceNodeData?.stepType === 'if-condition' || 
          sourceNodeData?.stepType === 'condition' || 
          sourceNodeData?.stepType === 'decision' ||
          sourceNodeData?.stepType === 'switch-case' ||
          sourceNodeData?.stepType === 'filter') {
        edgeType = 'conditional';
        edgeLabel = 'Yes';
      }

      const newEdge: Edge = {
        ...params,
        id: generatePersistentEdgeId(params.source!, params.target!),
        type: edgeType,
        data: { label: edgeLabel },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
        },
        style: {
          strokeWidth: 2,
          stroke: edgeType === 'conditional' ? '#6366f1' : '#64748b',
        },
      };

      setEdges((eds) => addEdge(newEdge, eds));
      console.log('Edge created:', newEdge);
    },
    [setEdges, nodes, generatePersistentEdgeId, canCreateWorkflows, toast]
  );

  const onSelectionChange: OnSelectionChangeFunc<Node, Edge> = useCallback(
    ({ nodes: selectedNodes }) => {
      const node = selectedNodes[0] || null;
      setSelectedNode(node);
      
      if (node && aiAssistantEnabled) {
        const nodeElement = document.querySelector(`[data-id="${node.id}"]`);
        if (nodeElement) {
          const rect = nodeElement.getBoundingClientRect();
          setContextualSuggestionsPosition({
            x: rect.right + 20,
            y: rect.top,
          });
          setShowAssistant(true);
          generateSuggestions(node, nodes, edges);
        }
      } else {
        setContextualSuggestionsPosition(null);
        setShowAssistant(false);
      }
    },
    [aiAssistantEnabled, setContextualSuggestionsPosition, setShowAssistant, generateSuggestions, nodes, edges]
  );

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    
    if (!canCreateWorkflows) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to add nodes to workflows.",
        variant: "destructive",
      });
      return;
    }

    const type = event.dataTransfer.getData('application/reactflow');
    const label = event.dataTransfer.getData('application/reactflow-label');
    const description = event.dataTransfer.getData('application/reactflow-description');

    if (typeof type === 'undefined' || !type) {
      return;
    }

    if (reactFlowInstance) {
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const persistentId = generatePersistentNodeId();
      const newNode: Node = {
        id: persistentId,
        type: 'workflowStep',
        position,
        data: {
          label: label || 'New Step',
          stepType: type,
          description: description || '',
          assignedTo: null,
          estimatedHours: null,
          onConfigure: () => handleOpenNodeConfiguration(persistentId),
        } as WorkflowNodeData,
        draggable: true,
      };

      setNodes((nds) => nds.concat(newNode));
    }
  }, [reactFlowInstance, generatePersistentNodeId, setNodes, canCreateWorkflows, toast, handleOpenNodeConfiguration]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

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

  const onAddSuggestedStep = useCallback((suggestion: any) => {
    onAddNode(suggestion.type, suggestion.label, suggestion.description);
  }, [onAddNode]);

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onSelectionChange,
    onDrop,
    onDragOver,
    onUpdateNodeData,
    onAddNode,
    suggestions,
    isSuggestionsLoading,
    onAddSuggestedStep,
    isSaving,
    availableFields,
    canDeleteWorkflows,
    canEditWorkflows,
    canCreateWorkflows,
    selectedNodeLabel,
  };
}
