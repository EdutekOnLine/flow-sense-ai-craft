
import { useState, useCallback } from 'react';
import { ReactFlowInstance, Node } from '@xyflow/react';

export function useWorkflowState() {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isNodeEditorOpen, setIsNodeEditorOpen] = useState(false);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  const closeNodeEditor = useCallback(() => {
    setIsNodeEditorOpen(false);
    setSelectedNode(null);
  }, []);

  const generatePersistentNodeId = useCallback(() => {
    return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  return {
    selectedNode,
    setSelectedNode,
    isNodeEditorOpen,
    setIsNodeEditorOpen,
    closeNodeEditor,
    reactFlowInstance,
    setReactFlowInstance,
    generatePersistentNodeId,
  };
}
