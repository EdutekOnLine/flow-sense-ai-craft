
import { useCallback, useState } from 'react';
import { useStepSuggestions } from '@/hooks/useStepSuggestions';
import { useWorkflowPermissions } from '@/hooks/useWorkflowPermissions';
import { useWorkflowNodes } from './useWorkflowNodes';
import { useWorkflowEdges } from './useWorkflowEdges';
import { useWorkflowEvents } from './useWorkflowEvents';

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
  const [isNodeEditorOpen, setIsNodeEditorOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { canDeleteWorkflows, canEditWorkflows, canCreateWorkflows } = useWorkflowPermissions();
  const { suggestions, isLoading: isSuggestionsLoading, generateSuggestions } = useStepSuggestions();

  const availableFields = ['name', 'email', 'status', 'date', 'amount']; // Mock data

  const handleOpenNodeConfiguration = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setSelectedNode(node);
      setIsNodeEditorOpen(true);
    }
  }, []);

  const {
    nodes,
    setNodes,
    onNodesChange,
    selectedNode,
    setSelectedNode,
    onUpdateNodeData,
    onAddNode,
  } = useWorkflowNodes({
    generatePersistentNodeId,
    handleOpenNodeConfiguration,
  });

  const {
    edges,
    setEdges,
    onEdgesChange,
    onConnect,
  } = useWorkflowEdges({ nodes });

  const {
    onSelectionChange,
    onDrop,
    onDragOver,
  } = useWorkflowEvents({
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
  });

  const onAddSuggestedStep = useCallback((suggestion: any) => {
    onAddNode(suggestion.type, suggestion.label, suggestion.description);
  }, [onAddNode]);

  const selectedNodeLabel: string = (selectedNode?.data as any)?.label || '';

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
