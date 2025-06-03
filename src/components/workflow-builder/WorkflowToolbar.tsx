import React, { useState } from 'react';
import { 
  Save, 
  FolderOpen, 
  Plus, 
  FileText, 
  Sparkles,
  AlertCircle,
  MessageSquare,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SaveWorkflowDialog } from './SaveWorkflowDialog';
import { LoadWorkflowDialog } from './LoadWorkflowDialog';
import { WorkflowExplanation } from './WorkflowExplanation';
import { useWorkflowExplainer } from '@/hooks/useWorkflowExplainer';
import { Node, Edge } from '@xyflow/react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface WorkflowToolbarProps {
  onAddNode: (type: string, label: string, description?: string) => void;
  onSave: (name: string, description?: string, isReusable?: boolean) => void;
  onLoad: (workflowId: string) => void;
  onNewWorkflow: () => void;
  onOpenGenerator: () => void;
  onOpenReview: () => void;
  isSaving: boolean;
  currentWorkflowName?: string;
  currentWorkflowDescription?: string;
  currentWorkflowIsReusable?: boolean;
  hasUnsavedChanges: boolean;
  isCurrentWorkflowSaved: boolean;
  nodes: Node[];
  edges: Edge[];
  aiAssistantEnabled?: boolean;
  onToggleAIAssistant?: (enabled: boolean) => void;
}

export function WorkflowToolbar({
  onAddNode,
  onSave,
  onLoad,
  onNewWorkflow,
  onOpenGenerator,
  isSaving,
  currentWorkflowName,
  currentWorkflowDescription,
  currentWorkflowIsReusable,
  hasUnsavedChanges,
  isCurrentWorkflowSaved,
  nodes,
  edges,
  aiAssistantEnabled = true,
  onToggleAIAssistant,
}: WorkflowToolbarProps) {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const { explainWorkflow } = useWorkflowExplainer();

  const handleSave = async (name: string, description?: string, isReusable?: boolean) => {
    await onSave(name, description, isReusable);
    setShowSaveDialog(false);
  };

  const handleLoad = async (workflowId: string) => {
    await onLoad(workflowId);
    setShowLoadDialog(false);
  };

  const handleExplain = () => {
    setShowExplanation(true);
  };

  const explanation = explainWorkflow(nodes, edges);

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSaveDialog(true)}
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save
            {hasUnsavedChanges && !isSaving && (
              <AlertCircle className="h-3 w-3 text-orange-500" />
            )}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLoadDialog(true)}
            className="flex items-center gap-2"
          >
            <FolderOpen className="h-4 w-4" />
            Load
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onNewWorkflow}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New
          </Button>

          <div className="h-6 w-px bg-gray-200 mx-2" />

          <Button
            variant="outline"
            size="sm"
            onClick={onOpenGenerator}
            className="flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            AI Generate
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExplain}
            className="flex items-center gap-2"
            disabled={nodes.length === 0}
          >
            <MessageSquare className="h-4 w-4" />
            Explain Workflow
          </Button>
        </div>

        <div className="flex items-center space-x-6">
          {/* AI Assistant Toggle */}
          <div className="flex items-center space-x-2">
            <Label htmlFor="ai-assistant-toggle" className="text-sm font-medium">
              AI Assistant
            </Label>
            <Switch
              id="ai-assistant-toggle"
              checked={aiAssistantEnabled}
              onCheckedChange={onToggleAIAssistant}
            />
          </div>

          <div className="flex items-center space-x-2">
            {currentWorkflowName && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">{currentWorkflowName}</span>
                {hasUnsavedChanges && <span className="text-orange-500 ml-1">*</span>}
              </div>
            )}
          </div>
        </div>
      </div>

      <SaveWorkflowDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        onSave={handleSave}
        initialName={currentWorkflowName}
        initialDescription={currentWorkflowDescription}
        initialIsReusable={currentWorkflowIsReusable}
        isLoading={isSaving}
        isEditing={isCurrentWorkflowSaved}
      />

      <LoadWorkflowDialog
        isOpen={showLoadDialog}
        onClose={() => setShowLoadDialog(false)}
        onLoad={handleLoad}
      />

      <WorkflowExplanation
        isOpen={showExplanation}
        onClose={() => setShowExplanation(false)}
        explanation={explanation}
        workflowName={currentWorkflowName}
      />
    </div>
  );
}
