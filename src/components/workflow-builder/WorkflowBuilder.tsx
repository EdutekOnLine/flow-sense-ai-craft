
import React, { useCallback, useState, useEffect, useRef } from 'react';
import {
  ReactFlow,
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  OnSelectionChangeParams,
  MarkerType,
  ConnectionMode,
  ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { WorkflowToolbar } from './WorkflowToolbar';
import { WorkflowNode } from './WorkflowNode';
import { WorkflowSidebar } from './WorkflowSidebar';
import { NodeEditor } from './NodeEditor';
import { ConditionalEdge } from './ConditionalEdge';
import { useWorkflowPersistence } from '@/hooks/useWorkflowPersistence';
import { useToast } from '@/hooks/use-toast';

interface WorkflowNodeData extends Record<string, unknown> {
  label: string;
  stepType: string;
  description: string;
  assignedTo: string | null;
  estimatedHours: number | null;
  // Node type specific configurations
  emailConfig?: {
    to?: string;
    subject?: string;
    body?: string;
  };
  webhookConfig?: {
    url?: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
  };
  conditionConfig?: {
    field?: string;
    operator?: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
    value?: string;
  };
  delayConfig?: {
    duration?: number;
    unit?: 'minutes' | 'hours' | 'days';
  };
}

const nodeTypes = {
  workflowStep: WorkflowNode,
};

const edgeTypes = {
  conditional: ConditionalEdge,
};

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

export default function WorkflowBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [nodeIdCounter, setNodeIdCounter] = useState(1);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isNodeEditorOpen, setIsNodeEditorOpen] = useState(false);
  const [currentWorkflowName, setCurrentWorkflowName] = useState<string | undefined>();
  const [currentWorkflowDescription, setCurrentWorkflowDescription] = useState<string | undefined>();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const { toast } = useToast();

  const {
    currentWorkflowId,
    setCurrentWorkflowId,
    isLoading: isSaving,
    saveWorkflow,
    loadWorkflow
  } = useWorkflowPersistence();

  // Track changes to mark workflow as modified
  useEffect(() => {
    if (nodes.length > 0 || edges.length > 0) {
      setHasUnsavedChanges(true);
    }
  }, [nodes, edges]);

  const generatePersistentNodeId = useCallback(() => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `node-${timestamp}-${random}`;
  }, []);

  const generatePersistentEdgeId = useCallback((sourceId: string, targetId: string) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `edge-${sourceId}-${targetId}-${timestamp}-${random}`;
  }, []);

  const onConnect = useCallback(
    (params: Connection) => {
      // Determine edge type based on source node type
      const sourceNode = nodes.find(node => node.id === params.source);
      const sourceNodeData = sourceNode?.data as WorkflowNodeData;
      
      let edgeType = 'default';
      let edgeLabel = '';
      
      // Use conditional edge for decision nodes
      if (sourceNodeData?.stepType === 'if-condition' || 
          sourceNodeData?.stepType === 'condition' || 
          sourceNodeData?.stepType === 'decision' ||
          sourceNodeData?.stepType === 'switch-case' ||
          sourceNodeData?.stepType === 'filter') {
        edgeType = 'conditional';
        edgeLabel = 'Yes'; // Default label for conditional branches
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
    },
    [setEdges, nodes, generatePersistentEdgeId]
  );

  const addNode = useCallback((type: string, label: string, description: string = '') => {
    const persistentId = generatePersistentNodeId();
    
    const newNode: Node = {
      id: persistentId,
      type: 'workflowStep',
      position: { x: 250, y: 100 + nodes.length * 150 },
      data: { 
        label: label,
        stepType: type,
        description: description,
        assignedTo: null,
        estimatedHours: null
      } as WorkflowNodeData,
      dragHandle: '.drag-handle',
    };
    
    setNodes((nds) => nds.concat(newNode));
    setNodeIdCounter((counter) => counter + 1);
  }, [nodes.length, setNodes, generatePersistentNodeId]);

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    
    // Close editor if deleted node was selected
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
      setIsNodeEditorOpen(false);
    }
  }, [setNodes, setEdges, selectedNode]);

  const updateNodeData = useCallback((nodeId: string, newData: Partial<WorkflowNodeData>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          const updatedNode = { ...node, data: { ...node.data, ...newData } };
          // Update selected node if it's the same
          if (selectedNode?.id === nodeId) {
            setSelectedNode(updatedNode);
          }
          return updatedNode;
        }
        return node;
      })
    );
  }, [setNodes, selectedNode]);

  const onSelectionChange = useCallback((params: OnSelectionChangeParams) => {
    const selectedNodes = params.nodes;
    
    // Handle node selection
    if (selectedNodes.length === 1) {
      const node = selectedNodes[0];
      setSelectedNode(node);
      setIsNodeEditorOpen(true);
    } else {
      setSelectedNode(null);
      setIsNodeEditorOpen(false);
    }
  }, []);

  const closeNodeEditor = useCallback(() => {
    setIsNodeEditorOpen(false);
    setSelectedNode(null);
  }, []);

  const handleSaveWorkflow = useCallback(async (name: string, description?: string) => {
    if (!reactFlowInstance) return;
    
    const viewport = reactFlowInstance.getViewport();
    await saveWorkflow(name, nodes, edges, viewport, description, currentWorkflowId || undefined);
    
    setCurrentWorkflowName(name);
    setCurrentWorkflowDescription(description);
    setHasUnsavedChanges(false);
  }, [saveWorkflow, nodes, edges, currentWorkflowId, reactFlowInstance]);

  const handleLoadWorkflow = useCallback(async (workflowId: string) => {
    const workflow = await loadWorkflow(workflowId);
    if (workflow) {
      // Preserve persistent IDs from loaded workflow
      setNodes(workflow.nodes);
      setEdges(workflow.edges);
      setCurrentWorkflowName(workflow.name);
      setCurrentWorkflowDescription(workflow.description);
      setHasUnsavedChanges(false);
      
      // Set viewport
      if (reactFlowInstance && workflow.viewport) {
        reactFlowInstance.setViewport(workflow.viewport);
      }
      
      toast({
        title: "Workflow Loaded",
        description: `"${workflow.name}" has been loaded successfully.`,
      });
    }
  }, [loadWorkflow, setNodes, setEdges, toast, reactFlowInstance]);

  const handleNewWorkflow = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setCurrentWorkflowId(null);
    setCurrentWorkflowName(undefined);
    setCurrentWorkflowDescription(undefined);
    setHasUnsavedChanges(false);
    setSelectedNode(null);
    setIsNodeEditorOpen(false);
    setNodeIdCounter(1);
  }, [setNodes, setEdges, setCurrentWorkflowId]);

  // Generate available fields from previous nodes
  const getAvailableFields = useCallback(() => {
    if (!selectedNode) return [];
    
    const fields: string[] = [];
    
    // Find all nodes that come before the selected node in the workflow
    const selectedNodeIndex = nodes.findIndex(n => n.id === selectedNode.id);
    const previousNodes = nodes.slice(0, selectedNodeIndex);
    
    previousNodes.forEach(node => {
      const nodeData = node.data as WorkflowNodeData;
      
      // Add common fields based on step type
      switch (nodeData.stepType) {
        case 'form-submitted':
          fields.push('form.name', 'form.email', 'form.phone', 'form.message');
          break;
        case 'record-created':
          fields.push('record.id', 'record.title', 'record.status', 'record.created_at');
          break;
        case 'webhook-trigger':
          fields.push('webhook.payload', 'webhook.headers', 'webhook.method');
          break;
        default:
          fields.push(`${nodeData.stepType}.result`, `${nodeData.stepType}.status`);
      }
    });
    
    // Add some common system fields
    fields.push('current_user.id', 'current_user.email', 'current_date', 'current_time');
    
    return [...new Set(fields)]; // Remove duplicates
  }, [selectedNode, nodes]);

  return (
    <div className="h-[800px] w-full flex border border-gray-200 rounded-lg overflow-hidden bg-white">
      <WorkflowSidebar onAddNode={addNode} />
      <div className="flex-1 flex flex-col">
        <WorkflowToolbar 
          onAddNode={addNode}
          onSave={handleSaveWorkflow}
          onLoad={handleLoadWorkflow}
          onNewWorkflow={handleNewWorkflow}
          isSaving={isSaving}
          currentWorkflowName={currentWorkflowName}
          currentWorkflowDescription={currentWorkflowDescription}
          hasUnsavedChanges={hasUnsavedChanges}
          isCurrentWorkflowSaved={!!currentWorkflowId}
        />
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onSelectionChange={onSelectionChange}
            onInit={setReactFlowInstance}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            snapToGrid={true}
            snapGrid={[15, 15]}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            minZoom={0.2}
            maxZoom={2}
            attributionPosition="bottom-left"
            proOptions={{ hideAttribution: true }}
            connectionMode={ConnectionMode.Loose}
            deleteKeyCode={['Backspace', 'Delete']}
          >
            <Background 
              variant={BackgroundVariant.Dots} 
              gap={15} 
              size={1}
              className="bg-gray-50"
            />
            <Controls 
              position="top-right"
              showZoom={true}
              showFitView={true}
              showInteractive={true}
            />
            <MiniMap 
              position="bottom-right"
              nodeStrokeWidth={3}
              zoomable
              pannable
              className="bg-white border border-gray-200 rounded"
            />
          </ReactFlow>
          
          <NodeEditor
            selectedNode={selectedNode}
            isOpen={isNodeEditorOpen}
            onClose={closeNodeEditor}
            onUpdateNode={updateNodeData}
            availableFields={getAvailableFields()}
          />
        </div>
      </div>
    </div>
  );
}
