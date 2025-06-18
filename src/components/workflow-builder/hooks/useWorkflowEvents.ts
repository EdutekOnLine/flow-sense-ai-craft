
import { useCallback } from 'react';
import { Node, Edge, OnSelectionChangeFunc } from '@xyflow/react';
import { useToast } from '@/hooks/use-toast';
import { useWorkflowPermissions } from '@/hooks/useWorkflowPermissions';

interface WorkflowNodeData extends Record<string, unknown> {
  label: string;
  stepType: string;
  description: string;
  assignedTo: string | null;
  estimatedHours: number | null;
  onConfigure?: () => void;
}

interface UseWorkflowEventsProps {
  reactFlowInstance: any;
  generatePersistentNodeId: () => string;
  handleOpenNodeConfiguration: (nodeId: string) => void;
  setNodes: (nodes: Node[] | ((nodes: Node[]) => Node[])) => void;
  setSelectedNode: (node: Node | null) => void;
  setContextualSuggestionsPosition: (position: { x: number; y: number } | null) => void;
  setShowAssistant: (show: boolean) => void;
  aiAssistantEnabled: boolean;
  generateSuggestions: (selectedNode: Node, allNodes: Node[], allEdges: Edge[]) => Promise<void>;
  nodes: Node[];
  edges: Edge[];
}

export function useWorkflowEvents({
  reactFlowInstance,
  generatePersistentNodeId,
  handleOpenNodeConfiguration,
  setNodes,
  setSelectedNode,
  setContextualSuggestionsPosition,
  setShowAssistant,
  aiAssistantEnabled,
  generateSuggestions,
  nodes,
  edges,
}: UseWorkflowEventsProps) {
  const { toast } = useToast();
  const { canCreateWorkflows } = useWorkflowPermissions();

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
    [aiAssistantEnabled, setContextualSuggestionsPosition, setShowAssistant, generateSuggestions, nodes, edges, setSelectedNode]
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

  return {
    onSelectionChange,
    onDrop,
    onDragOver,
  };
}
