
import { useState, useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';
import { supabase } from '@/integrations/supabase/client';

interface StepSuggestion {
  id: string;
  label: string;
  description: string;
  stepType: string;
  reason: string;
  confidence: number;
}

interface WorkflowNodeData {
  label: string;
  stepType: string;
  description: string;
  assignedTo: string | null;
  estimatedHours: number | null;
}

export function useStepSuggestions() {
  const [suggestions, setSuggestions] = useState<StepSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateSuggestions = useCallback(async (
    selectedNode: Node | null,
    allNodes: Node[],
    allEdges: Edge[]
  ) => {
    if (!selectedNode) return;

    setIsLoading(true);
    try {
      // Analyze workflow context
      const nodeData = selectedNode.data as WorkflowNodeData;
      const nextNodes = allEdges
        .filter(edge => edge.source === selectedNode.id)
        .map(edge => allNodes.find(node => node.id === edge.target))
        .filter(Boolean);

      const workflowContext = {
        currentStep: {
          type: nodeData.stepType,
          label: nodeData.label,
          description: nodeData.description
        },
        existingNextSteps: nextNodes.map(node => ({
          type: (node?.data as WorkflowNodeData)?.stepType,
          label: (node?.data as WorkflowNodeData)?.label
        })),
        workflowSize: allNodes.length,
        totalConnections: allEdges.length
      };

      const { data, error } = await supabase.functions.invoke('suggest-next-steps', {
        body: { workflowContext }
      });

      if (error) throw error;

      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Error generating step suggestions:', error);
      // Fallback to rule-based suggestions
      const fallbackSuggestions = generateFallbackSuggestions(selectedNode, allNodes, allEdges);
      setSuggestions(fallbackSuggestions);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateFallbackSuggestions = (
    selectedNode: Node,
    allNodes: Node[],
    allEdges: Edge[]
  ): StepSuggestion[] => {
    const nodeData = selectedNode.data as WorkflowNodeData;
    const suggestions: StepSuggestion[] = [];

    // Rule-based suggestions based on step type
    switch (nodeData.stepType) {
      case 'trigger':
        suggestions.push(
          {
            id: 'form-validation',
            label: 'Form Validation',
            description: 'Validate submitted form data',
            stepType: 'if-condition',
            reason: 'Forms typically need validation after trigger',
            confidence: 0.9
          },
          {
            id: 'send-notification',
            label: 'Send Notification',
            description: 'Notify relevant parties of the trigger',
            stepType: 'send-email',
            reason: 'Common to notify after a trigger event',
            confidence: 0.8
          }
        );
        break;

      case 'send-email':
        suggestions.push(
          {
            id: 'wait-response',
            label: 'Wait for Response',
            description: 'Wait for email response or timeout',
            stepType: 'delay',
            reason: 'Emails often require waiting for responses',
            confidence: 0.85
          },
          {
            id: 'check-delivery',
            label: 'Check Delivery Status',
            description: 'Verify email was delivered successfully',
            stepType: 'if-condition',
            reason: 'Good practice to verify email delivery',
            confidence: 0.7
          }
        );
        break;

      case 'if-condition':
        suggestions.push(
          {
            id: 'approval-path',
            label: 'Manual Approval',
            description: 'Route to human for approval',
            stepType: 'manual-approval',
            reason: 'Conditions often lead to approval processes',
            confidence: 0.8
          },
          {
            id: 'update-record',
            label: 'Update Record',
            description: 'Update database record based on condition',
            stepType: 'update-record',
            reason: 'Conditions typically trigger data updates',
            confidence: 0.75
          }
        );
        break;

      case 'manual-approval':
        suggestions.push(
          {
            id: 'approved-notification',
            label: 'Approval Notification',
            description: 'Notify stakeholders of approval decision',
            stepType: 'send-email',
            reason: 'Approvals should be communicated',
            confidence: 0.9
          },
          {
            id: 'process-next',
            label: 'Process Next Step',
            description: 'Continue workflow based on approval',
            stepType: 'if-condition',
            reason: 'Approvals branch the workflow',
            confidence: 0.85
          }
        );
        break;

      default:
        suggestions.push(
          {
            id: 'end-workflow',
            label: 'End Workflow',
            description: 'Complete the workflow process',
            stepType: 'end',
            reason: 'All workflows need an end point',
            confidence: 0.6
          }
        );
    }

    return suggestions.slice(0, 3); // Limit to top 3 suggestions
  };

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  return {
    suggestions,
    isLoading,
    generateSuggestions,
    clearSuggestions
  };
}
