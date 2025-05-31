
import { Node, Edge } from '@xyflow/react';

export const initialNodes: Node[] = [
  {
    id: '1',
    type: 'workflow',
    position: { x: 250, y: 50 },
    data: {
      label: 'Start',
      stepType: 'start',
      description: 'Starting point of the workflow',
      assignedTo: null,
      estimatedHours: null,
    },
  },
];

export const initialEdges: Edge[] = [];
