
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  FileText, 
  Save, 
  Eye, 
  Sparkles,
  Bot,
  BotOff
} from 'lucide-react';
import { Node, Edge } from '@xyflow/react';

interface WorkflowToolbarProps {
  onAddNode: (type: string, label: string, description: string) => void;
  onNewWorkflow: () => void;
  onOpenGenerator: () => void;
  onOpenReview: () => void;
  onSaveWorkflow: () => void;
  nodes: Node[];
  edges: Edge[];
  aiAssistantEnabled: boolean;
  onToggleAIAssistant: (enabled: boolean) => void;
  isSaving: boolean;
}

export function WorkflowToolbar({
  onAddNode,
  onNewWorkflow,
  onOpenGenerator,
  onOpenReview,
  onSaveWorkflow,
  nodes,
  edges,
  aiAssistantEnabled,
  onToggleAIAssistant,
  isSaving,
}: WorkflowToolbarProps) {
  const { t } = useTranslation();

  const handleAddBasicStep = () => {
    onAddNode('action', 'New Step', 'A new workflow step');
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
      <div className="flex items-center space-x-3">
        <Button variant="outline" size="sm" onClick={onNewWorkflow}>
          <FileText className="h-4 w-4 mr-2" />
          {t('workflowBuilder.newWorkflow')}
        </Button>
        
        <Button variant="outline" size="sm" onClick={handleAddBasicStep}>
          <Plus className="h-4 w-4 mr-2" />
          {t('workflowBuilder.addStep')}
        </Button>
        
        <Button variant="outline" size="sm" onClick={onOpenGenerator}>
          <Sparkles className="h-4 w-4 mr-2" />
          {t('workflowBuilder.generateWorkflow')}
        </Button>
      </div>

      <div className="flex items-center space-x-3">
        <Button
          variant={aiAssistantEnabled ? "default" : "outline"}
          size="sm"
          onClick={() => onToggleAIAssistant(!aiAssistantEnabled)}
        >
          {aiAssistantEnabled ? (
            <>
              <Bot className="h-4 w-4 mr-2" />
              AI Assistant On
            </>
          ) : (
            <>
              <BotOff className="h-4 w-4 mr-2" />
              AI Assistant Off
            </>
          )}
        </Button>
        
        <Button variant="outline" size="sm" onClick={onOpenReview}>
          <Eye className="h-4 w-4 mr-2" />
          {t('workflowBuilder.reviewWorkflow')}
        </Button>
        
        <Button 
          variant="default" 
          size="sm" 
          onClick={onSaveWorkflow}
          disabled={isSaving || nodes.length === 0}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? t('workflowBuilder.saving') : t('workflowBuilder.saveWorkflow')}
        </Button>
      </div>
    </div>
  );
}
