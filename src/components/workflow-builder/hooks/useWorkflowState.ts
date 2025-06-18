
import { useState, useCallback } from 'react';
import { Node, Edge, ReactFlowInstance } from '@xyflow/react';

export function useWorkflowState() {
  const [nodeIdCounter, setNodeIdCounter] = useState(1);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isNodeEditorOpen, setIsNodeEditorOpen] = useState(false);
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  // Helper functions for generating persistent IDs
  const generatePersistentNodeId = useCallback(() => {
    const id = `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return id;
  }, []);

  const generatePersistentEdgeId = useCallback((sourceId: string, targetId: string) => {
    return `edge-${sourceId}-${targetId}-${Date.now()}`;
  }, []);

  const closeNodeEditor = useCallback(() => {
    setIsNodeEditorOpen(false);
    setSelectedNode(null);
  }, []);

  return {
    nodeIdCounter,
    setNodeIdCounter,
    selectedNode,
    setSelectedNode,
    isNodeEditorOpen,
    setIsNodeEditorOpen,
    currentWorkflowId,
    setCurrentWorkflowId,
    reactFlowInstance,
    setReactFlowInstance,
    generatePersistentNodeId,
    generatePersistentEdgeId,
    closeNodeEditor,
  };
}
