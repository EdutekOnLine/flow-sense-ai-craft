
import { useState, useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';
import { supabase } from '@/integrations/supabase/client';

export interface WorkflowSuggestion {
  id: string;
  type: 'redundancy' | 'missing_branch' | 'performance' | 'optimization' | 'best_practice';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  nodeIds: string[];
  edgeIds: string[];
  suggestedAction: {
    type: 'remove' | 'combine' | 'add' | 'modify' | 'reorganize';
    details: string;
    changes?: {
      nodesToRemove?: string[];
      nodesToAdd?: any[];
      edgesToRemove?: string[];
      edgesToAdd?: any[];
      nodesToModify?: { id: string; changes: any }[];
    };
  };
  reasoning: string;
  confidence: number;
}

interface WorkflowNodeData {
  label: string;
  stepType: string;
  description: string;
  assignedTo: string | null;
  estimatedHours: number | null;
}

export function useWorkflowReviewer() {
  const [suggestions, setSuggestions] = useState<WorkflowSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const reviewWorkflow = useCallback(async (
    nodes: Node[],
    edges: Edge[],
    workflowName?: string
  ) => {
    if (nodes.length === 0) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      // Prepare workflow context for AI analysis
      const workflowContext = {
        name: workflowName || 'Untitled Workflow',
        nodeCount: nodes.length,
        edgeCount: edges.length,
        nodes: nodes.map(node => {
          const data = node.data as unknown as WorkflowNodeData;
          return {
            id: node.id,
            type: data.stepType,
            label: data.label,
            position: node.position
          };
        }),
        edges: edges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: edge.type,
          label: (edge.data as any)?.label
        })),
        connectivity: analyzeConnectivity(nodes, edges),
        patterns: identifyPatterns(nodes, edges)
      };

      const { data, error } = await supabase.functions.invoke('review-workflow', {
        body: { workflowContext }
      });

      if (error) throw error;

      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Error reviewing workflow:', error);
      // Fallback to rule-based analysis
      const fallbackSuggestions = generateRuleBasedSuggestions(nodes, edges);
      setSuggestions(fallbackSuggestions);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const analyzeConnectivity = (nodes: Node[], edges: Edge[]) => {
    const nodeConnections = new Map<string, { incoming: number; outgoing: number }>();
    
    nodes.forEach(node => {
      nodeConnections.set(node.id, { incoming: 0, outgoing: 0 });
    });

    edges.forEach(edge => {
      const source = nodeConnections.get(edge.source);
      const target = nodeConnections.get(edge.target);
      if (source) source.outgoing++;
      if (target) target.incoming++;
    });

    return {
      isolatedNodes: Array.from(nodeConnections.entries())
        .filter(([_, conn]) => conn.incoming === 0 && conn.outgoing === 0)
        .map(([id]) => id),
      deadEnds: Array.from(nodeConnections.entries())
        .filter(([_, conn]) => conn.outgoing === 0)
        .map(([id]) => id),
      startNodes: Array.from(nodeConnections.entries())
        .filter(([_, conn]) => conn.incoming === 0)
        .map(([id]) => id),
      nodeConnections: nodeConnections
    };
  };

  const identifyPatterns = (nodes: Node[], edges: Edge[]) => {
    const patterns = {
      sequentialChains: [] as string[][],
      conditionalBranches: [] as string[],
      parallelPaths: [] as string[][],
      loops: [] as string[][]
    };

    // Identify conditional nodes
    nodes.forEach(node => {
      const data = node.data as unknown as WorkflowNodeData;
      if (data.stepType === 'if-condition' || data.stepType === 'condition') {
        patterns.conditionalBranches.push(node.id);
      }
    });

    return patterns;
  };

  const generateRuleBasedSuggestions = (
    nodes: Node[],
    edges: Edge[]
  ): WorkflowSuggestion[] => {
    const suggestions: WorkflowSuggestion[] = [];
    const connectivity = analyzeConnectivity(nodes, edges);

    // Check for isolated nodes
    connectivity.isolatedNodes.forEach(nodeId => {
      const node = nodes.find(n => n.id === nodeId);
      if (node) {
        suggestions.push({
          id: `isolated-${nodeId}`,
          type: 'redundancy',
          title: 'Isolated Node Detected',
          description: `Node "${(node.data as any).label}" is not connected to any other nodes.`,
          severity: 'medium',
          nodeIds: [nodeId],
          edgeIds: [],
          suggestedAction: {
            type: 'remove',
            details: 'Consider removing this isolated node or connecting it to the workflow.',
            changes: { nodesToRemove: [nodeId] }
          },
          reasoning: 'Isolated nodes serve no purpose in the workflow execution.',
          confidence: 0.9
        });
      }
    });

    // Check for missing end nodes
    if (connectivity.deadEnds.length === 0 && nodes.length > 1) {
      suggestions.push({
        id: 'no-end-node',
        type: 'missing_branch',
        title: 'Missing End Node',
        description: 'Workflow has no clear ending point.',
        severity: 'high',
        nodeIds: [],
        edgeIds: [],
        suggestedAction: {
          type: 'add',
          details: 'Add an "End" node to clearly mark workflow completion.',
          changes: {
            nodesToAdd: [{
              type: 'workflowStep',
              data: { label: 'End Workflow', stepType: 'end' }
            }]
          }
        },
        reasoning: 'Workflows should have clear end points for better understanding and execution.',
        confidence: 0.85
      });
    }

    // Check for conditional nodes without both branches
    connectivity.nodeConnections.forEach((connections, nodeId) => {
      const node = nodes.find(n => n.id === nodeId);
      const data = node?.data as unknown as WorkflowNodeData;
      
      if (data?.stepType === 'if-condition' && connections.outgoing < 2) {
        suggestions.push({
          id: `incomplete-condition-${nodeId}`,
          type: 'missing_branch',
          title: 'Incomplete Conditional Branch',
          description: `Condition "${data.label}" only has one output path.`,
          severity: 'medium',
          nodeIds: [nodeId],
          edgeIds: [],
          suggestedAction: {
            type: 'add',
            details: 'Add both "Yes" and "No" paths to handle all possible outcomes.',
            changes: {
              edgesToAdd: [{
                type: 'conditional',
                data: { label: 'No' }
              }]
            }
          },
          reasoning: 'Conditional nodes should handle both true and false cases.',
          confidence: 0.8
        });
      }
    });

    // Check for redundant sequential steps
    const sequentialPairs = findSequentialPairs(nodes, edges);
    sequentialPairs.forEach(pair => {
      const [node1, node2] = pair;
      const data1 = node1.data as unknown as WorkflowNodeData;
      const data2 = node2.data as unknown as WorkflowNodeData;

      if (data1.stepType === data2.stepType && data1.stepType === 'send-email') {
        suggestions.push({
          id: `redundant-emails-${node1.id}-${node2.id}`,
          type: 'redundancy',
          title: 'Consecutive Email Steps',
          description: `Two email steps "${data1.label}" and "${data2.label}" are executed consecutively.`,
          severity: 'low',
          nodeIds: [node1.id, node2.id],
          edgeIds: [],
          suggestedAction: {
            type: 'combine',
            details: 'Consider combining these emails into a single comprehensive message.',
            changes: {
              nodesToRemove: [node2.id],
              nodesToModify: [{
                id: node1.id,
                changes: { label: `${data1.label} + ${data2.label}` }
              }]
            }
          },
          reasoning: 'Multiple consecutive emails can overwhelm recipients and reduce effectiveness.',
          confidence: 0.7
        });
      }
    });

    return suggestions;
  };

  const findSequentialPairs = (nodes: Node[], edges: Edge[]): [Node, Node][] => {
    const pairs: [Node, Node][] = [];
    
    edges.forEach(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      
      if (sourceNode && targetNode) {
        // Check if source has only one outgoing edge and target has only one incoming edge
        const sourceOutgoing = edges.filter(e => e.source === sourceNode.id).length;
        const targetIncoming = edges.filter(e => e.target === targetNode.id).length;
        
        if (sourceOutgoing === 1 && targetIncoming === 1) {
          pairs.push([sourceNode, targetNode]);
        }
      }
    });
    
    return pairs;
  };

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  return {
    suggestions,
    isLoading,
    reviewWorkflow,
    clearSuggestions
  };
}
