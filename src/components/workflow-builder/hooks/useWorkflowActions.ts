
import { useCallback } from 'react';
import { Node, Edge, addEdge, Connection, MarkerType } from '@xyflow/react';
import { useToast } from '@/hooks/use-toast';

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
  nodes: Node[];
  setNodes: (nodes: Node[] | ((nodes: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void;
  selectedNode: Node | null;
  setSelectedNode: (node: Node | null) => void;
  setIsNodeEditorOpen: (open: boolean) => void;
  setNodeIdCounter: (counter: number | ((counter: number) => number)) => void;
  generatePersistentNodeId: () => string;
  generatePersistentEdgeId: (sourceId: string, targetId: string) => string;
  handleOpenNodeConfiguration: (nodeId: string) => void;
  canCreateWorkflows: boolean;
  canEditWorkflows: boolean;
  canDeleteWorkflows: boolean;
}

export function useWorkflowActions({
  nodes,
  setNodes,
  setEdges,
  selectedNode,
  setSelectedNode,
  setIsNodeEditorOpen,
  setNodeIdCounter,
  generatePersistentNodeId,
  generatePersistentEdgeId,
  handleOpenNodeConfiguration,
  canCreateWorkflows,
  canEditWorkflows,
  canDeleteWorkflows,
}: UseWorkflowActionsProps) {
  const { toast } = useToast();

  const onConnect = useCallback(
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

      // Determine edge type based on source node type
      const sourceNode = nodes.find(node => node.id === params.source);
      const sourceNodeData = sourceNode?.data as WorkflowNodeData;
      
      let edgeType = 'default';
      let edgeLabel = '';
      
      // Use conditional edge for decision nodes
      if (sourceNodeData?.stepType === 'if-condition' || 
          sourceNodeData?.stepType === 'condition' || 
          sourceNodeData?.stepType === 'decision' ||
          sourceNodeData?.stepType === 'switch-case' ||
          sourceNodeData?.stepType === 'filter') {
        edgeType = 'conditional';
        edgeLabel = 'Yes'; // Default label for conditional branches
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

  const addNode = useCallback((type: string, label: string, description: string = '') => {
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
    setNodeIdCounter((counter) => counter + 1);
  }, [nodes.length, setNodes, generatePersistentNodeId, canCreateWorkflows, toast, handleOpenNodeConfiguration]);

  const deleteNode = useCallback((nodeId: string) => {
    if (!canDeleteWorkflows) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to delete nodes from workflows.",
        variant: "destructive",
      });
      return;
    }

    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    
    // Close editor if deleted node was selected
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
      setIsNodeEditorOpen(false);
    }
  }, [setNodes, setEdges, selectedNode, canDeleteWorkflows, toast]);

  const updateNodeData = useCallback((nodeId: string, newData: Partial<WorkflowNodeData>) => {
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
          // Update selected node if it's the same
          if (selectedNode?.id === nodeId) {
            setSelectedNode(updatedNode);
          }
          return updatedNode;
        }
        return node;
      })
    );
  }, [setNodes, selectedNode, canEditWorkflows, toast, handleOpenNodeConfiguration]);

  return {
    onConnect,
    addNode,
    deleteNode,
    updateNodeData,
  };
}
