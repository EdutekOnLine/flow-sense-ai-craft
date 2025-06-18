
import { useState, useCallback, useEffect } from 'react';
import { Node, Edge, Connection, addEdge, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import { ReactFlowInstance } from '@xyflow/react';
import { useWorkflowPermissions } from '@/hooks/useWorkflowPermissions';

interface UseWorkflowActionsProps {
  generatePersistentNodeId: () => string;
  reactFlowInstance: ReactFlowInstance | null;
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
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedNodeLabel, setSelectedNodeLabel] = useState<string>('');

  const { canDeleteWorkflows, canEditWorkflows, canCreateWorkflows } = useWorkflowPermissions();

  const availableFields = ['email', 'name', 'status', 'date', 'priority'];

  const onNodesChange = useCallback(
    (changes: any) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    []
  );

  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes }: { nodes: Node[] }) => {
      if (selectedNodes.length > 0) {
        setSelectedNodeLabel(selectedNodes[0].data?.label || '');
      } else {
        setSelectedNodeLabel('');
      }
    },
    []
  );

  const onAddNode = useCallback(
    (type: string, label: string, description: string) => {
      const newNode: Node = {
        id: generatePersistentNodeId(),
        type: 'workflowStep',
        position: { x: Math.random() * 400, y: Math.random() * 400 },
        data: {
          label,
          description,
          stepType: type,
        },
      };
      
      setNodes((nds) => [...nds, newNode]);
    },
    [generatePersistentNodeId]
  );

  const onUpdateNodeData = useCallback((nodeId: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...newData } }
          : node
      )
    );
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      
      if (!reactFlowInstance) return;

      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');
      
      if (!type) return;

      const stepData = JSON.parse(type);
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode: Node = {
        id: generatePersistentNodeId(),
        type: 'workflowStep',
        position,
        data: stepData,
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [reactFlowInstance, generatePersistentNodeId]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

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
