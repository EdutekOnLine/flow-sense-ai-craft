
import React, { useState } from 'react';
import { 
  Plus, 
  FileText, 
  Sparkles,
  MessageSquare,
  Search,
  Save,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorkflowExplanation } from './WorkflowExplanation';
import { useWorkflowExplainer } from '@/hooks/useWorkflowExplainer';
import { Node, Edge } from '@xyflow/react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface WorkflowToolbarProps {
  onAddNode: (type: string, label: string, description?: string) => void;
  onNewWorkflow: () => void;
  onOpenGenerator: () => void;
  onOpenReview: () => void;
  onSaveWorkflow: () => void;
  nodes: Node[];
  edges: Edge[];
  aiAssistantEnabled?: boolean;
  onToggleAIAssistant?: (enabled: boolean) => void;
  isSaving?: boolean;
}

export function WorkflowToolbar({
  onAddNode,
  onNewWorkflow,
  onOpenGenerator,
  onSaveWorkflow,
  nodes,
  edges,
  aiAssistantEnabled = false,
  onToggleAIAssistant,
  isSaving = false,
}: WorkflowToolbarProps) {
  const [showExplanation, setShowExplanation] = useState(false);
  const { explainWorkflow } = useWorkflowExplainer();

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
            onClick={onNewWorkflow}
            className="flex items-center gap-2"
            disabled={isSaving}
          >
            <Plus className="h-4 w-4" />
            New
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onSaveWorkflow}
            className="flex items-center gap-2"
            disabled={nodes.length === 0 || isSaving}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSaving ? 'Saving...' : 'Save'}
          </Button>

          <div className="h-6 w-px bg-gray-200 mx-2" />

          <Button
            variant="outline"
            size="sm"
            onClick={onOpenGenerator}
            className="flex items-center gap-2"
            disabled={isSaving}
          >
            <Sparkles className="h-4 w-4" />
            AI Generate
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExplain}
            className="flex items-center gap-2"
            disabled={nodes.length === 0 || isSaving}
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
              disabled={isSaving}
            />
          </div>
        </div>
      </div>

      <WorkflowExplanation
        isOpen={showExplanation}
        onClose={() => setShowExplanation(false)}
        explanation={explanation}
        workflowName="Current Workflow"
      />
    </div>
  );
}
