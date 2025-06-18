
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Node, Edge, ReactFlowInstance, OnNodesChange, OnEdgesChange, OnConnect } from '@xyflow/react';
import { WorkflowSidebar } from './WorkflowSidebar';
import { WorkflowCanvas } from './WorkflowCanvas';
import { WorkflowToolbar } from './WorkflowToolbar';
import { WorkflowPermissionGuard } from './WorkflowPermissionGuard';
import { useWorkflowState } from './hooks/useWorkflowState';
import { useWorkflowDialogs } from './hooks/useWorkflowDialogs';
import { useWorkflowActions } from './hooks/useWorkflowActions';

export default function WorkflowBuilder() {
  const { t } = useTranslation();
  const {
    selectedNode,
    isNodeEditorOpen,
    closeNodeEditor,
    reactFlowInstance,
    setReactFlowInstance,
    generatePersistentNodeId,
  } = useWorkflowState();

  const {
    isGeneratorOpen,
    setIsGeneratorOpen,
    isSaveDialogOpen,
    setIsSaveDialogOpen,
    showReview,
    setShowReview,
    aiAssistantEnabled,
    setAiAssistantEnabled,
    showAssistant,
    setShowAssistant,
    contextualSuggestionsPosition,
    setContextualSuggestionsPosition,
  } = useWorkflowDialogs();

  const {
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
  } = useWorkflowActions({
    generatePersistentNodeId,
    reactFlowInstance,
    setContextualSuggestionsPosition,
    setShowAssistant,
    aiAssistantEnabled,
  });

  const onInit = useCallback((instance: ReactFlowInstance) => {
    setReactFlowInstance(instance);
  }, [setReactFlowInstance]);

  const onCloseAssistant = useCallback(() => {
    setShowAssistant(false);
  }, [setShowAssistant]);

  return (
    <WorkflowPermissionGuard>
      <div className="flex flex-col h-screen bg-background">
        <WorkflowToolbar
          onGenerateWorkflow={() => setIsGeneratorOpen(true)}
          onSaveWorkflow={() => setIsSaveDialogOpen(true)}
          onShowReview={() => setShowReview(true)}
          aiAssistantEnabled={aiAssistantEnabled}
          onToggleAiAssistant={setAiAssistantEnabled}
          canCreateWorkflows={canCreateWorkflows}
          canEditWorkflows={canEditWorkflows}
        />
        
        <div className="flex flex-1 overflow-hidden">
          <WorkflowSidebar onAddNode={onAddNode} />
          
          <WorkflowCanvas
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onSelectionChange={onSelectionChange}
            onInit={onInit}
            onDrop={onDrop}
            onDragOver={onDragOver}
            selectedNode={selectedNode}
            isNodeEditorOpen={isNodeEditorOpen}
            onCloseNodeEditor={closeNodeEditor}
            onUpdateNodeData={onUpdateNodeData}
            availableFields={availableFields}
            canDeleteWorkflows={canDeleteWorkflows}
            canEditWorkflows={canEditWorkflows}
            canCreateWorkflows={canCreateWorkflows}
            isSaving={isSaving}
            aiAssistantEnabled={aiAssistantEnabled}
            contextualSuggestionsPosition={contextualSuggestionsPosition}
            suggestions={suggestions}
            showAssistant={showAssistant}
            isSuggestionsLoading={isSuggestionsLoading}
            onAddSuggestedStep={onAddSuggestedStep}
            onCloseAssistant={onCloseAssistant}
            selectedNodeLabel={selectedNodeLabel}
          />
        </div>
      </div>
    </WorkflowPermissionGuard>
  );
}
