
import React, { useRef, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  ConnectionMode,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  OnSelectionChangeFunc,
  ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { WorkflowNode } from '@/components/workflow-builder/WorkflowNode';
import { ConditionalEdge } from '@/components/workflow-builder/ConditionalEdge';
import { NodeEditor } from '@/components/workflow-builder/NodeEditor';
import { NodeSuggestions } from '@/components/workflow-builder/NodeSuggestions';
import { FloatingAssistant } from '@/components/workflow-builder/FloatingAssistant';

const nodeTypes = {
  workflowStep: WorkflowNode,
};

const edgeTypes = {
  conditional: ConditionalEdge,
};

interface WorkflowCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  onSelectionChange: OnSelectionChangeFunc<Node, Edge>;
  onInit: (instance: ReactFlowInstance) => void;
  onDrop: (event: React.DragEvent) => void;
  onDragOver: (event: React.DragEvent) => void;
  selectedNode: Node | null;
  isNodeEditorOpen: boolean;
  onCloseNodeEditor: () => void;
  onUpdateNodeData: (nodeId: string, newData: any) => void;
  availableFields: string[];
  canDeleteWorkflows: boolean;
  canEditWorkflows: boolean;
  canCreateWorkflows: boolean;
  isSaving: boolean;
  aiAssistantEnabled: boolean;
  contextualSuggestionsPosition: { x: number; y: number } | null;
  suggestions: any[];
  showAssistant: boolean;
  isSuggestionsLoading: boolean;
  onAddSuggestedStep: (suggestion: any) => void;
  onCloseAssistant: () => void;
  selectedNodeLabel?: string;
}

export function WorkflowCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onSelectionChange,
  onInit,
  onDrop,
  onDragOver,
  selectedNode,
  isNodeEditorOpen,
  onCloseNodeEditor,
  onUpdateNodeData,
  availableFields,
  canDeleteWorkflows,
  canEditWorkflows,
  canCreateWorkflows,
  isSaving,
  aiAssistantEnabled,
  contextualSuggestionsPosition,
  suggestions,
  showAssistant,
  isSuggestionsLoading,
  onAddSuggestedStep,
  onCloseAssistant,
  selectedNodeLabel,
}: WorkflowCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  return (
    <div className="flex-1 relative" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        onInit={onInit}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        snapToGrid={true}
        snapGrid={[15, 15]}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        minZoom={0.2}
        maxZoom={2}
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }}
        connectionMode={ConnectionMode.Loose}
        deleteKeyCode={canDeleteWorkflows ? ['Backspace', 'Delete'] : []}
        nodesDraggable={canEditWorkflows}
        nodesConnectable={canCreateWorkflows}
        elementsSelectable={true}
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={15} 
          size={1}
          className="bg-background"
        />
        <Controls 
          position="top-right"
          showZoom={true}
          showFitView={true}
          showInteractive={true}
        />
        <MiniMap 
          position="bottom-right"
          nodeStrokeWidth={3}
          zoomable
          pannable
          className="bg-card border border-border rounded"
        />
      </ReactFlow>
      
      {/* Show saving indicator overlay */}
      {isSaving && (
        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 shadow-lg flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="text-sm font-medium text-card-foreground">Processing workflow steps...</span>
          </div>
        </div>
      )}
      
      {/* Contextual suggestions near selected node - only show if AI Assistant is enabled */}
      {aiAssistantEnabled && contextualSuggestionsPosition && suggestions.length > 0 && (
        <NodeSuggestions
          suggestions={suggestions}
          position={contextualSuggestionsPosition}
          onAddSuggestion={onAddSuggestedStep}
          onDismiss={() => {}}
        />
      )}
      
      <NodeEditor
        selectedNode={selectedNode}
        isOpen={isNodeEditorOpen}
        onClose={onCloseNodeEditor}
        onUpdateNode={onUpdateNodeData}
        availableFields={availableFields}
      />
      
      {/* Floating AI Assistant Panel - only show if AI Assistant is enabled */}
      {aiAssistantEnabled && (
        <FloatingAssistant
          suggestions={suggestions}
          isLoading={isSuggestionsLoading}
          isVisible={showAssistant}
          onClose={onCloseAssistant}
          onAddSuggestion={onAddSuggestedStep}
          selectedNodeLabel={selectedNodeLabel}
        />
      )}
    </div>
  );
}
