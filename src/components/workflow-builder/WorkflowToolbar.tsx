
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Save, Download, Upload, Play, FolderOpen, Edit } from 'lucide-react';
import { SaveWorkflowDialog } from './SaveWorkflowDialog';
import { LoadWorkflowDialog } from './LoadWorkflowDialog';

interface WorkflowToolbarProps {
  onAddNode: (type: string, label: string, description: string) => void;
  onSave: (name: string, description?: string) => void;
  onLoad: (workflowId: string) => void;
  onNewWorkflow: () => void;
  isSaving: boolean;
  currentWorkflowName?: string;
  currentWorkflowDescription?: string;
  hasUnsavedChanges: boolean;
  isCurrentWorkflowSaved: boolean;
}

export function WorkflowToolbar({ 
  onAddNode, 
  onSave, 
  onLoad, 
  onNewWorkflow,
  isSaving, 
  currentWorkflowName,
  currentWorkflowDescription,
  hasUnsavedChanges,
  isCurrentWorkflowSaved
}: WorkflowToolbarProps) {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);

  const handleSave = (name: string, description?: string) => {
    onSave(name, description);
    setShowSaveDialog(false);
  };

  const handleNewWorkflow = () => {
    if (hasUnsavedChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to create a new workflow?')) {
        onNewWorkflow();
      }
    } else {
      onNewWorkflow();
    }
  };

  return (
    <>
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold text-gray-900">
            Workflow Builder
            {currentWorkflowName && (
              <span className="text-sm font-normal text-gray-600 ml-2">
                - {currentWorkflowName}
                {hasUnsavedChanges && '*'}
              </span>
            )}
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleNewWorkflow}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New
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
            onClick={() => onAddNode('start', 'Start', 'Start of the workflow')}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Start
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSaveDialog(true)}
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            {isCurrentWorkflowSaved ? <Edit className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {isCurrentWorkflowSaved ? 'Update' : 'Save'}
            {hasUnsavedChanges && '*'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Import
          </Button>
          
          <Button
            size="sm"
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <Play className="h-4 w-4" />
            Run
          </Button>
        </div>
      </div>

      <SaveWorkflowDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        onSave={handleSave}
        isLoading={isSaving}
        initialName={currentWorkflowName}
        initialDescription={currentWorkflowDescription}
        isEditing={isCurrentWorkflowSaved}
      />

      <LoadWorkflowDialog
        isOpen={showLoadDialog}
        onClose={() => setShowLoadDialog(false)}
        onLoad={onLoad}
      />
    </>
  );
}
