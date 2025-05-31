
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Save, FolderOpen, Plus, Loader2, FileText, Wand2 } from 'lucide-react';
import { SaveWorkflowDialog } from './SaveWorkflowDialog';
import { LoadWorkflowDialog } from './LoadWorkflowDialog';

interface WorkflowToolbarProps {
  onAddNode: (type: string, label: string, description?: string) => void;
  onSave: (name: string, description?: string) => Promise<void>;
  onLoad: (workflowId: string) => Promise<void>;
  onNewWorkflow: () => void;
  onOpenGenerator: () => void;
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
  onOpenGenerator,
  isSaving,
  currentWorkflowName,
  currentWorkflowDescription,
  hasUnsavedChanges,
  isCurrentWorkflowSaved,
}: WorkflowToolbarProps) {
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isLoadDialogOpen, setIsLoadDialogOpen] = useState(false);

  const handleSave = async (name: string, description?: string) => {
    await onSave(name, description);
    setIsSaveDialogOpen(false);
  };

  const handleLoad = async (workflowId: string) => {
    await onLoad(workflowId);
    setIsLoadDialogOpen(false);
  };

  return (
    <>
      <div className="border-b border-gray-200 p-4 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900">
              {currentWorkflowName || 'Untitled Workflow'}
              {hasUnsavedChanges && <span className="text-orange-500 ml-1">*</span>}
            </h2>
            {currentWorkflowDescription && (
              <span className="text-sm text-gray-500">- {currentWorkflowDescription}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenGenerator}
              className="text-purple-600 border-purple-200 hover:bg-purple-50"
            >
              <Wand2 className="h-4 w-4 mr-2" />
              AI Generate
            </Button>
            
            <Separator orientation="vertical" className="h-6" />

            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddNode('manual-task', 'New Task', 'Task description')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Step
            </Button>

            <Separator orientation="vertical" className="h-6" />

            <Button
              variant="outline"
              size="sm"
              onClick={onNewWorkflow}
            >
              <FileText className="h-4 w-4 mr-2" />
              New
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLoadDialogOpen(true)}
            >
              <FolderOpen className="h-4 w-4 mr-2" />
              Open
            </Button>

            <Button
              size="sm"
              onClick={() => setIsSaveDialogOpen(true)}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <SaveWorkflowDialog
        isOpen={isSaveDialogOpen}
        onClose={() => setIsSaveDialogOpen(false)}
        onSave={handleSave}
        initialName={currentWorkflowName}
        initialDescription={currentWorkflowDescription}
        isEditing={isCurrentWorkflowSaved}
        isLoading={isSaving}
      />

      <LoadWorkflowDialog
        isOpen={isLoadDialogOpen}
        onClose={() => setIsLoadDialogOpen(false)}
        onLoad={handleLoad}
      />
    </>
  );
}
