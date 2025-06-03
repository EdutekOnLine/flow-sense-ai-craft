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
import { WorkflowPermissionGuard } from './WorkflowPermissionGuard';
import { useWorkflowPersistence } from '@/hooks/useWorkflowPersistence';
import { useWorkflowPermissions } from '@/hooks/useWorkflowPermissions';
import { useToast } from '@/hooks/use-toast';
import { NaturalLanguageGenerator } from './NaturalLanguageGenerator';
import { FloatingAssistant } from './FloatingAssistant';
import { NodeSuggestions } from './NodeSuggestions';
import { useStepSuggestions } from '@/hooks/useStepSuggestions';
import { useWorkflowReviewer } from '@/hooks/useWorkflowReviewer';
import { WorkflowReview } from './WorkflowReview';

interface WorkflowNodeData extends Record<string, unknown> {
  label: string;
  stepType: string;
  description: string;
  assignedTo: string | null;
  estimatedHours: number | null;
  onConfigure?: () => void;
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

interface StepSuggestion {
  id: string;
  label: string;
  description: string;
  stepType: string;
  reason: string;
  confidence: number;
}

export default function WorkflowBuilder() {
  const { canCreateWorkflows, canEditWorkflows, canDeleteWorkflows } = useWorkflowPermissions();

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [nodeIdCounter, setNodeIdCounter] = useState(1);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isNodeEditorOpen, setIsNodeEditorOpen] = useState(false);
  const [currentWorkflowName, setCurrentWorkflowName] = useState<string | undefined>();
  const [currentWorkflowDescription, setCurrentWorkflowDescription] = useState<string | undefined>();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const { toast } = useToast();

  // Initialize step suggestions hook
  const {
    suggestions,
    isLoading: isSuggestionsLoading,
    generateSuggestions,
    clearSuggestions
  } = useStepSuggestions();
  
  const [showAssistant, setShowAssistant] = useState(false);
  const [contextualSuggestionsPosition, setContextualSuggestionsPosition] = useState<{ x: number; y: number } | null>(null);

  const {
    currentWorkflowId,
    setCurrentWorkflowId,
    isLoading: isSaving,
    saveWorkflow,
    loadWorkflow
  } = useWorkflowPersistence();

  // Track changes to mark workflow as modified - but only after initial load
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  useEffect(() => {
    // Don't mark as changed during initial load or when loading a workflow
    if (!isInitialLoad && (nodes.length > 0 || edges.length > 0)) {
      console.log('Marking workflow as changed due to nodes/edges update');
      setHasUnsavedChanges(true);
    }
  }, [nodes, edges, isInitialLoad]);

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

  // Function to handle opening configuration for a specific node
  const handleOpenNodeConfiguration = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setSelectedNode(node);
      setIsNodeEditorOpen(true);
    }
  }, [nodes]);

  // Update nodes to include the onConfigure callback
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          onConfigure: () => handleOpenNodeConfiguration(node.id),
        },
      }))
    );
  }, [handleOpenNodeConfiguration, setNodes]);

  const handleAddSuggestedStep = useCallback((suggestion: StepSuggestion) => {
    if (!canCreateWorkflows) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to add nodes to workflows.",
        variant: "destructive",
      });
      return;
    }

    const persistentId = generatePersistentNodeId();
    
    // Position new node to the right of the selected node
    let newPosition = { x: 400, y: 100 + nodes.length * 150 };
    if (selectedNode) {
      newPosition = {
        x: selectedNode.position.x + 300,
        y: selectedNode.position.y
      };
    }
    
    const newNode: Node = {
      id: persistentId,
      type: 'workflowStep',
      position: newPosition,
      data: { 
        label: suggestion.label,
        stepType: suggestion.stepType,
        description: suggestion.description,
        assignedTo: null,
        estimatedHours: null,
        onConfigure: () => handleOpenNodeConfiguration(persistentId),
      } as WorkflowNodeData,
      draggable: true,
    };
    
    setNodes((nds) => nds.concat(newNode));
    
    // Connect to selected node if there is one
    if (selectedNode) {
      const newEdge: Edge = {
        id: generatePersistentEdgeId(selectedNode.id, persistentId),
        source: selectedNode.id,
        target: persistentId,
        type: 'default',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
        },
        style: {
          strokeWidth: 2,
          stroke: '#64748b',
        },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    }
    
    // Clear contextual suggestions
    setContextualSuggestionsPosition(null);
    
    toast({
      title: "Step Added",
      description: `"${suggestion.label}" has been added to your workflow.`,
    });
  }, [selectedNode, nodes.length, setNodes, setEdges, generatePersistentNodeId, generatePersistentEdgeId, canCreateWorkflows, toast, handleOpenNodeConfiguration]);

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
      console.log('Edge created:', newEdge);
    },
    [setEdges, nodes, generatePersistentEdgeId, canCreateWorkflows, toast]
  );

  const addNode = useCallback((type: string, label: string, description: string = '') => {
    if (!canCreateWorkflows) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to add nodes to workflows.",
        variant: "destructive",
      });
      return;
    }

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
        estimatedHours: null,
        onConfigure: () => handleOpenNodeConfiguration(persistentId),
      } as WorkflowNodeData,
      draggable: true,
    };
    
    setNodes((nds) => nds.concat(newNode));
    setNodeIdCounter((counter) => counter + 1);
  }, [nodes.length, setNodes, generatePersistentNodeId, canCreateWorkflows, toast, handleOpenNodeConfiguration]);

  const deleteNode = useCallback((nodeId: string) => {
    if (!canDeleteWorkflows) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to delete nodes from workflows.",
        variant: "destructive",
      });
      return;
    }

    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    
    // Close editor if deleted node was selected
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
      setIsNodeEditorOpen(false);
    }
  }, [setNodes, setEdges, selectedNode, canDeleteWorkflows, toast]);

  const updateNodeData = useCallback((nodeId: string, newData: Partial<WorkflowNodeData>) => {
    if (!canEditWorkflows) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to edit workflow nodes.",
        variant: "destructive",
      });
      return;
    }

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          const updatedNode = { 
            ...node, 
            data: { 
              ...node.data, 
              ...newData,
              onConfigure: () => handleOpenNodeConfiguration(nodeId),
            } 
          };
          // Update selected node if it's the same
          if (selectedNode?.id === nodeId) {
            setSelectedNode(updatedNode);
          }
          return updatedNode;
        }
        return node;
      })
    );
  }, [setNodes, selectedNode, canEditWorkflows, toast, handleOpenNodeConfiguration]);

  const onSelectionChange = useCallback((params: OnSelectionChangeParams) => {
    const selectedNodes = params.nodes;
    
    // Handle node selection for suggestions but don't open configuration panel
    if (selectedNodes.length === 1) {
      const node = selectedNodes[0];
      
      // Generate AI suggestions for the selected node
      generateSuggestions(node, nodes, edges);
      setShowAssistant(true);
      
      // Position contextual suggestions near the node
      setContextualSuggestionsPosition({
        x: node.position.x + 200,
        y: node.position.y + 50
      });
    } else {
      clearSuggestions();
      setShowAssistant(false);
      setContextualSuggestionsPosition(null);
    }
  }, [generateSuggestions, clearSuggestions, nodes, edges]);

  const closeNodeEditor = useCallback(() => {
    setIsNodeEditorOpen(false);
    setSelectedNode(null);
  }, []);

  const handleSaveWorkflow = useCallback(async (name: string, description?: string, isReusable?: boolean) => {
    if (!canCreateWorkflows && !canEditWorkflows) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to save workflows.",
        variant: "destructive",
      });
      return;
    }

    try {
      const viewport = reactFlowInstance?.getViewport() || { x: 0, y: 0, zoom: 1 };
      console.log('Saving workflow with:', { name, description, isReusable, nodesCount: nodes.length, edgesCount: edges.length });
      
      await saveWorkflow(name, nodes, edges, viewport, description, currentWorkflowId || undefined, isReusable);
      
      setCurrentWorkflowName(name);
      setCurrentWorkflowDescription(description);
      setHasUnsavedChanges(false); // Reset unsaved changes after successful save
      console.log('Workflow saved successfully, hasUnsavedChanges set to false');
    } catch (error) {
      console.error('Failed to save workflow:', error);
      // Error handling is already done in the saveWorkflow function
    }
  }, [saveWorkflow, nodes, edges, currentWorkflowId, reactFlowInstance, canCreateWorkflows, canEditWorkflows, toast]);

  const handleLoadWorkflow = useCallback(async (workflowId: string) => {
    console.log('Loading workflow, setting isInitialLoad to true');
    setIsInitialLoad(true);
    
    const workflow = await loadWorkflow(workflowId);
    if (workflow) {
      // Preserve persistent IDs from loaded workflow and ensure draggable
      const draggableNodes = workflow.nodes.map(node => ({ 
        ...node, 
        draggable: true,
        data: {
          ...node.data,
          onConfigure: () => handleOpenNodeConfiguration(node.id),
        }
      }));
      setNodes(draggableNodes);
      setEdges(workflow.edges);
      setCurrentWorkflowName(workflow.name);
      setCurrentWorkflowDescription(workflow.description);
      setHasUnsavedChanges(false);
      
      // Set viewport
      if (reactFlowInstance && workflow.viewport) {
        reactFlowInstance.setViewport(workflow.viewport);
      }
      
      // Allow changes to be tracked after initial load
      setTimeout(() => {
        console.log('Setting isInitialLoad to false after workflow load');
        setIsInitialLoad(false);
      }, 100);
      
      toast({
        title: "Workflow Loaded",
        description: `"${workflow.name}" has been loaded successfully.`,
      });
    }
  }, [loadWorkflow, setNodes, setEdges, toast, reactFlowInstance, handleOpenNodeConfiguration]);

  const handleNewWorkflow = useCallback(() => {
    console.log('Creating new workflow, setting isInitialLoad to true');
    setIsInitialLoad(true);
    setNodes([]);
    setEdges([]);
    setCurrentWorkflowId(null);
    setCurrentWorkflowName(undefined);
    setCurrentWorkflowDescription(undefined);
    setHasUnsavedChanges(false);
    setSelectedNode(null);
    setIsNodeEditorOpen(false);
    setNodeIdCounter(1);
    
    // Allow changes to be tracked after clearing
    setTimeout(() => {
      console.log('Setting isInitialLoad to false after new workflow');
      setIsInitialLoad(false);
    }, 100);
  }, [setNodes, setEdges, setCurrentWorkflowId]);

  const handleWorkflowGenerated = useCallback((result: any) => {
    console.log('Applying generated workflow:', result);
    
    // Clear existing workflow
    setNodes([]);
    setEdges([]);
    
    // Apply generated nodes and edges
    setTimeout(() => {
      // Ensure all generated nodes are draggable and have configure callback
      const draggableNodes = result.nodes.map((node: Node) => ({ 
        ...node, 
        draggable: true,
        data: {
          ...node.data,
          onConfigure: () => handleOpenNodeConfiguration(node.id),
        }
      }));
      setNodes(draggableNodes);
      setEdges(result.edges);
      
      // Set the workflow metadata
      if (result.title) {
        setCurrentWorkflowName(result.title);
      }
      if (result.description) {
        setCurrentWorkflowDescription(result.description);
      }
      
      setHasUnsavedChanges(true);
      
      // Fit view to show all generated nodes
      if (reactFlowInstance) {
        setTimeout(() => {
          reactFlowInstance.fitView({ padding: 0.2 });
        }, 100);
      }
    }, 100);
  }, [setNodes, setEdges, reactFlowInstance, handleOpenNodeConfiguration]);

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

  // Add workflow reviewer
  const {
    suggestions: reviewSuggestions,
    isLoading: isReviewing,
    reviewWorkflow,
    clearSuggestions: clearReviewSuggestions
  } = useWorkflowReviewer();

  const [showReview, setShowReview] = useState(false);

  const handleOpenReview = useCallback(() => {
    reviewWorkflow(nodes, edges, currentWorkflowName);
    setShowReview(true);
  }, [reviewWorkflow, nodes, edges, currentWorkflowName]);

  const handleApplySuggestion = useCallback((suggestion: any) => {
    console.log('Applying suggestion:', suggestion);
    
    // Apply the suggested changes
    if (suggestion.suggestedAction.changes) {
      const { changes } = suggestion.suggestedAction;
      
      // Remove nodes
      if (changes.nodesToRemove) {
        changes.nodesToRemove.forEach((nodeId: string) => {
          deleteNode(nodeId);
        });
      }
      
      // Modify nodes
      if (changes.nodesToModify) {
        changes.nodesToModify.forEach(({ id, changes: nodeChanges }: any) => {
          updateNodeData(id, nodeChanges);
        });
      }
      
      // Add nodes (simplified - would need proper positioning logic)
      if (changes.nodesToAdd) {
        changes.nodesToAdd.forEach((nodeData: any) => {
          addNode(nodeData.stepType || 'default', nodeData.label || 'New Step', nodeData.description || '');
        });
      }
      
      // Remove edges
      if (changes.edgesToRemove) {
        setEdges((eds) => eds.filter(edge => !changes.edgesToRemove.includes(edge.id)));
      }
    }
    
    toast({
      title: "Suggestion Applied",
      description: suggestion.title,
    });
  }, [deleteNode, updateNodeData, addNode, setEdges, toast]);

  const handleDismissSuggestion = useCallback((suggestionId: string) => {
    // Could implement local dismissal tracking if needed
    console.log('Dismissed suggestion:', suggestionId);
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!canCreateWorkflows) {
        toast({
          title: "Permission Denied",
          description: "You don't have permission to add nodes to workflows.",
          variant: "destructive",
        });
        return;
      }

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const stepData = event.dataTransfer.getData('application/reactflow');

      // Check if we have valid step data
      if (typeof stepData === 'undefined' || !stepData) {
        return;
      }

      let parsedData;
      try {
        parsedData = JSON.parse(stepData);
      } catch (error) {
        console.error('Failed to parse dropped data:', error);
        return;
      }

      const { type, label, description } = parsedData;

      if (typeof type === 'undefined' || !type) {
        return;
      }

      // Calculate position relative to the ReactFlow canvas
      const position = reactFlowInstance?.screenToFlowPosition({
        x: event.clientX - (reactFlowBounds?.left || 0),
        y: event.clientY - (reactFlowBounds?.top || 0),
      }) || { x: 0, y: 0 };

      const persistentId = generatePersistentNodeId();
      
      const newNode: Node = {
        id: persistentId,
        type: 'workflowStep',
        position,
        data: { 
          label: label || 'New Step',
          stepType: type,
          description: description || '',
          assignedTo: null,
          estimatedHours: null,
          onConfigure: () => handleOpenNodeConfiguration(persistentId),
        } as WorkflowNodeData,
        draggable: true,
      };

      setNodes((nds) => nds.concat(newNode));
      setNodeIdCounter((counter) => counter + 1);
      
      toast({
        title: "Step Added",
        description: `"${label || 'New Step'}" has been added to your workflow.`,
      });
    },
    [reactFlowInstance, canCreateWorkflows, generatePersistentNodeId, setNodes, toast, handleOpenNodeConfiguration]
  );

  return (
    <WorkflowPermissionGuard>
      <div className="h-[800px] w-full flex border border-gray-200 rounded-lg overflow-hidden bg-white">
        <WorkflowSidebar onAddNode={addNode} />
        <div className="flex-1 flex flex-col">
          <WorkflowToolbar 
            onAddNode={addNode}
            onSave={handleSaveWorkflow}
            onLoad={handleLoadWorkflow}
            onNewWorkflow={handleNewWorkflow}
            onOpenGenerator={() => setIsGeneratorOpen(true)}
            onOpenReview={handleOpenReview}
            isSaving={isSaving}
            currentWorkflowName={currentWorkflowName}
            currentWorkflowDescription={currentWorkflowDescription}
            currentWorkflowIsReusable={false}
            hasUnsavedChanges={hasUnsavedChanges}
            isCurrentWorkflowSaved={!!currentWorkflowId}
            nodes={nodes}
            edges={edges}
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
              onDrop={onDrop}
              onDragOver={onDragOver}
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
              deleteKeyCode={canDeleteWorkflows ? ['Backspace', 'Delete'] : []}
              nodesDraggable={canEditWorkflows}
              nodesConnectable={canCreateWorkflows}
              elementsSelectable={true}
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
            
            {/* Contextual suggestions near selected node */}
            {contextualSuggestionsPosition && suggestions.length > 0 && (
              <NodeSuggestions
                suggestions={suggestions}
                position={contextualSuggestionsPosition}
                onAddSuggestion={handleAddSuggestedStep}
                onDismiss={() => setContextualSuggestionsPosition(null)}
              />
            )}
            
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
      
      {/* Floating AI Assistant Panel */}
      <FloatingAssistant
        suggestions={suggestions}
        isLoading={isSuggestionsLoading}
        isVisible={showAssistant}
        onClose={() => setShowAssistant(false)}
        onAddSuggestion={handleAddSuggestedStep}
        selectedNodeLabel={(selectedNode?.data as WorkflowNodeData)?.label}
      />
      
      <NaturalLanguageGenerator
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        onWorkflowGenerated={handleWorkflowGenerated}
      />
      
      {/* Workflow Review Panel */}
      <WorkflowReview
        isOpen={showReview}
        onClose={() => setShowReview(false)}
        suggestions={reviewSuggestions}
        isLoading={isReviewing}
        workflowName={currentWorkflowName}
        onApplySuggestion={handleApplySuggestion}
        onDismissSuggestion={handleDismissSuggestion}
      />
    </WorkflowPermissionGuard>
  );
}
