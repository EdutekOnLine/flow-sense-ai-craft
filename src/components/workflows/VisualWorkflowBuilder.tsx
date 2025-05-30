import { useState, useCallback, useRef } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeTypes,
  Panel,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Save, Download, Upload } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import WorkflowStepNode from './WorkflowStepNode';

interface StepNodeData extends Record<string, unknown> {
  label: string;
  description: string;
  estimatedHours: number;
  assignedTo: string;
  teamMembers: Array<{
    id: string;
    first_name: string;
    last_name: string;
    role: string;
  }>;
}

const nodeTypes: NodeTypes = {
  workflowStep: WorkflowStepNode,
};

interface WorkflowBuilderProps {
  onSave?: (workflowData: any) => void;
}

export default function VisualWorkflowBuilder({ onSave }: WorkflowBuilderProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  // Fetch team members for assignment
  const { data: teamMembers = [] } = useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, role')
        .order('first_name');
      
      if (error) throw error;
      return data;
    },
  });

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current || !reactFlowInstance) {
        return;
      }

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      // Use screenToFlowPosition instead of project
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNodeData: StepNodeData = {
        label: 'New Step',
        description: '',
        estimatedHours: 0,
        assignedTo: 'unassigned',
        teamMembers,
      };

      const newNode: Node = {
        id: `step-${Date.now()}`,
        type: 'workflowStep',
        position,
        data: newNodeData,
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes, teamMembers],
  );

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const addStep = () => {
    const newNodeData: StepNodeData = {
      label: 'New Step',
      description: '',
      estimatedHours: 0,
      assignedTo: 'unassigned',
      teamMembers,
    };

    const newNode: Node = {
      id: `step-${Date.now()}`,
      type: 'workflowStep',
      position: { x: Math.random() * 300, y: Math.random() * 300 },
      data: newNodeData,
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const saveWorkflow = () => {
    const workflowData = {
      name: workflowName,
      description: workflowDescription,
      nodes,
      edges,
      steps: nodes.map((node, index) => {
        const nodeData = node.data as StepNodeData;
        return {
          id: node.id,
          name: nodeData.label,
          description: nodeData.description,
          estimated_hours: nodeData.estimatedHours,
          assigned_to: nodeData.assignedTo === 'unassigned' ? null : nodeData.assignedTo,
          dependencies: edges
            .filter(edge => edge.target === node.id)
            .map(edge => edge.source),
        };
      }),
    };

    if (onSave) {
      onSave(workflowData);
    }
  };

  const exportWorkflow = () => {
    const workflowData = {
      name: workflowName,
      description: workflowDescription,
      nodes,
      edges,
    };
    
    const dataStr = JSON.stringify(workflowData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${workflowName || 'workflow'}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importWorkflow = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const workflowData = JSON.parse(e.target?.result as string);
          setWorkflowName(workflowData.name || '');
          setWorkflowDescription(workflowData.description || '');
          setNodes(workflowData.nodes || []);
          setEdges(workflowData.edges || []);
        } catch (error) {
          console.error('Error importing workflow:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Visual Workflow Builder</h2>
          <div className="flex gap-2">
            <Button onClick={addStep} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Step
            </Button>
            <Button onClick={exportWorkflow} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <label>
              <Button variant="outline" size="sm" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </span>
              </Button>
              <input
                type="file"
                accept=".json"
                onChange={importWorkflow}
                className="hidden"
              />
            </label>
            <Button onClick={saveWorkflow} disabled={!workflowName.trim()}>
              <Save className="h-4 w-4 mr-2" />
              Save Workflow
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="workflow-name">Workflow Name</Label>
            <Input
              id="workflow-name"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              placeholder="Enter workflow name..."
            />
          </div>
          <div>
            <Label htmlFor="workflow-description">Description</Label>
            <Input
              id="workflow-description"
              value={workflowDescription}
              onChange={(e) => setWorkflowDescription(e.target.value)}
              placeholder="Enter workflow description..."
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-50 border-r p-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Drag & Drop</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-grab active:cursor-grabbing bg-white hover:bg-gray-50 transition-colors"
                draggable
                onDragStart={(event) => onDragStart(event, 'workflowStep')}
              >
                <div className="text-2xl mb-2">📋</div>
                <div className="text-sm font-medium">Workflow Step</div>
                <div className="text-xs text-gray-500">Drag to canvas</div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-4">
            <h3 className="font-medium text-sm mb-2">Instructions</h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Drag steps onto the canvas</li>
              <li>• Connect steps by dragging from handles</li>
              <li>• Click on steps to edit properties</li>
              <li>• Use controls to zoom and pan</li>
            </ul>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
            className="bg-gray-50"
          >
            <Controls />
            <MiniMap />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            <Panel position="top-right">
              <div className="text-xs text-gray-500 bg-white px-2 py-1 rounded border">
                Steps: {nodes.length} | Connections: {edges.length}
              </div>
            </Panel>
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}
