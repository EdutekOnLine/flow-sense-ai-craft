
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ReactFlowInstance } from '@xyflow/react';
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

  const handleNewWorkflow = useCallback(() => {
    // Clear the current workflow
    console.log('Creating new workflow');
  }, []);

  return (
    <WorkflowPermissionGuard>
      <div className="flex flex-col h-screen bg-background">
        <WorkflowToolbar
          onAddNode={onAddNode}
          onNewWorkflow={handleNewWorkflow}
          onOpenGenerator={() => setIsGeneratorOpen(true)}
          onSaveWorkflow={() => setIsSaveDialogOpen(true)}
          nodes={nodes}
          edges={edges}
          aiAssistantEnabled={aiAssistantEnabled}
          onToggleAIAssistant={setAiAssistantEnabled}
          isSaving={isSaving}
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
