
import { useCallback } from 'react';
import { Edge, addEdge, Connection, useEdgesState, OnEdgesChange, MarkerType } from '@xyflow/react';
import { useToast } from '@/hooks/use-toast';
import { useWorkflowPermissions } from '@/hooks/useWorkflowPermissions';

interface WorkflowNodeData extends Record<string, unknown> {
  label: string;
  stepType: string;
  description: string;
  assignedTo: string | null;
  estimatedHours: number | null;
}

interface UseWorkflowEdgesProps {
  nodes: any[];
}

export function useWorkflowEdges({ nodes }: UseWorkflowEdgesProps) {
  const { toast } = useToast();
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { canCreateWorkflows } = useWorkflowPermissions();

  const generatePersistentEdgeId = useCallback((sourceId: string, targetId: string) => {
    return `edge-${sourceId}-${targetId}-${Date.now()}`;
  }, []);

  const onConnect = useCallback(
    (params: Connection) => {
      console.log('Connecting nodes:', params);
      
      if (!canCreateWorkflows) {
        toast({
          title: "Permission Denied",
          description: "You don't have permission to connect nodes.",
          variant: "destructive",
        });
        return;
      }

      const sourceNode = nodes.find(node => node.id === params.source);
      const sourceNodeData = sourceNode?.data as WorkflowNodeData;
      
      let edgeType = 'default';
      let edgeLabel = '';
      
      if (sourceNodeData?.stepType === 'if-condition' || 
          sourceNodeData?.stepType === 'condition' || 
          sourceNodeData?.stepType === 'decision' ||
          sourceNodeData?.stepType === 'switch-case' ||
          sourceNodeData?.stepType === 'filter') {
        edgeType = 'conditional';
        edgeLabel = 'Yes';
      }

      const newEdge: Edge = {
        ...params,
        id: generatePersistentEdgeId(params.source!, params.target!),
        type: edgeType,
        data: { label: edgeLabel },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
        },
        style: {
          strokeWidth: 2,
          stroke: edgeType === 'conditional' ? '#6366f1' : '#64748b',
        },
      };

      setEdges((eds) => addEdge(newEdge, eds));
      console.log('Edge created:', newEdge);
    },
    [setEdges, nodes, generatePersistentEdgeId, canCreateWorkflows, toast]
  );

  return {
    edges,
    setEdges,
    onEdgesChange,
    onConnect,
  };
}
