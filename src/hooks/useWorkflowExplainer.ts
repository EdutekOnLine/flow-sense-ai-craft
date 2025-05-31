
import { useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';

interface WorkflowNodeData {
  label: string;
  stepType: string;
  description: string;
  assignedTo: string | null;
  estimatedHours: number | null;
  delayConfig?: {
    duration?: number;
    unit?: 'minutes' | 'hours' | 'days';
  };
  conditionConfig?: {
    field?: string;
    operator?: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
    value?: string;
  };
  emailConfig?: {
    to?: string;
    subject?: string;
    body?: string;
  };
}

export function useWorkflowExplainer() {
  const explainWorkflow = useCallback((nodes: Node[], edges: Edge[]): string => {
    if (nodes.length === 0) {
      return "This workflow is empty. Add some steps to get started.";
    }

    // Find the starting node (trigger or first node)
    const triggerNodes = nodes.filter(node => {
      const data = node.data as unknown as WorkflowNodeData;
      return data.stepType === 'trigger' || 
             data.stepType === 'form-submitted' || 
             data.stepType === 'webhook-trigger' ||
             data.stepType === 'schedule-trigger' ||
             data.stepType === 'record-created';
    });

    const startNode = triggerNodes.length > 0 ? triggerNodes[0] : nodes[0];
    
    if (!startNode) {
      return "This workflow doesn't have a clear starting point.";
    }

    const explanation: string[] = [];
    const visitedNodes = new Set<string>();
    
    // Build explanation by following the workflow path
    const explainFromNode = (currentNode: Node, depth: number = 0): void => {
      if (visitedNodes.has(currentNode.id) || depth > 20) {
        return; // Prevent infinite loops and excessive depth
      }
      
      visitedNodes.add(currentNode.id);
      const nodeData = currentNode.data as unknown as WorkflowNodeData;
      
      // Generate description for current node
      const nodeDescription = getNodeDescription(nodeData);
      explanation.push(nodeDescription);
      
      // Find next nodes
      const outgoingEdges = edges.filter(edge => edge.source === currentNode.id);
      
      if (outgoingEdges.length === 0) {
        explanation.push("The workflow ends here.");
        return;
      }
      
      // Handle multiple paths (conditions)
      if (outgoingEdges.length > 1) {
        explanation.push("Then the workflow branches:");
        outgoingEdges.forEach((edge, index) => {
          const nextNode = nodes.find(node => node.id === edge.target);
          if (nextNode && !visitedNodes.has(nextNode.id)) {
            const edgeLabel = edge.data?.label || `Path ${index + 1}`;
            explanation.push(`• If ${edgeLabel.toLowerCase()}:`);
            explainFromNode(nextNode, depth + 1);
          }
        });
      } else {
        // Single path - continue
        const nextNode = nodes.find(node => node.id === outgoingEdges[0].target);
        if (nextNode && !visitedNodes.has(nextNode.id)) {
          explainFromNode(nextNode, depth + 1);
        }
      }
    };

    explainFromNode(startNode);
    
    // Join explanations into a coherent narrative
    let narrative = "This workflow ";
    
    if (explanation.length > 0) {
      narrative += explanation.join(" Then, ").toLowerCase();
      // Capitalize first letter
      narrative = narrative.charAt(0).toUpperCase() + narrative.slice(1);
      // Clean up formatting
      narrative = narrative.replace(/\. then,/g, ". Then,");
      narrative = narrative.replace(/\bthen, then,/g, "then");
    }
    
    return narrative;
  }, []);

  const getNodeDescription = (nodeData: WorkflowNodeData): string => {
    const { stepType, label, delayConfig, conditionConfig, emailConfig, estimatedHours, assignedTo } = nodeData;
    
    switch (stepType) {
      case 'trigger':
      case 'form-submitted':
        return `starts when a form is submitted`;
      
      case 'webhook-trigger':
        return `starts when a webhook is received`;
      
      case 'schedule-trigger':
        return `starts on a scheduled basis`;
      
      case 'record-created':
        return `starts when a new record is created`;
      
      case 'send-email':
        const emailTo = emailConfig?.to ? ` to ${emailConfig.to}` : '';
        const emailSubject = emailConfig?.subject ? ` with subject "${emailConfig.subject}"` : '';
        return `sends an email${emailTo}${emailSubject}`;
      
      case 'delay':
      case 'wait':
        const duration = delayConfig?.duration || 1;
        const unit = delayConfig?.unit || 'hours';
        return `waits for ${duration} ${unit}`;
      
      case 'if-condition':
      case 'condition':
        const field = conditionConfig?.field || 'a field';
        const operator = conditionConfig?.operator || 'equals';
        const value = conditionConfig?.value || 'a value';
        const operatorText = {
          'equals': 'equals',
          'not_equals': 'does not equal',
          'contains': 'contains',
          'greater_than': 'is greater than',
          'less_than': 'is less than'
        }[operator] || 'matches';
        return `checks if ${field} ${operatorText} ${value}`;
      
      case 'manual-approval':
      case 'approval':
        const approver = assignedTo ? ` from ${assignedTo}` : '';
        return `requires manual approval${approver}`;
      
      case 'send-notification':
        return `sends a notification`;
      
      case 'update-record':
        return `updates a database record`;
      
      case 'create-task':
        const taskAssignee = assignedTo ? ` assigned to ${assignedTo}` : '';
        const taskDuration = estimatedHours ? ` (estimated ${estimatedHours}h)` : '';
        return `creates a task${taskAssignee}${taskDuration}`;
      
      case 'webhook-call':
        return `makes a webhook call to an external service`;
      
      case 'filter':
        return `filters data based on conditions`;
      
      case 'switch-case':
        return `evaluates multiple conditions`;
      
      case 'error-handler':
        return `handles errors that may occur`;
      
      case 'end':
        return `completes the workflow`;
      
      default:
        return `performs "${label}" action`;
    }
  };

  return { explainWorkflow };
}
