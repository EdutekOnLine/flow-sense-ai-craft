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
import { SaveWorkflowDialog } from './SaveWorkflowDialog';
import { useWorkflowPermissions } from '@/hooks/useWorkflowPermissions';
import { useToast } from '@/hooks/use-toast';
import { useSavedWorkflows } from '@/hooks/useSavedWorkflows';
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
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const { toast } = useToast();
  const { saveWorkflow, updateWorkflow, workflows } = useSavedWorkflows();

  // Add AI Assistant toggle state
  const [aiAssistantEnabled, setAiAssistantEnabled] = useState(true);

  // Initialize step suggestions hook
  const {
    suggestions,
    isLoading: isSuggestionsLoading,
    generateSuggestions,
    clearSuggestions
  } = useStepSuggestions();
  
  const [showAssistant, setShowAssistant] = useState(false);
  const [contextualSuggestionsPosition, setContextualSuggestionsPosition] = useState<{ x: number; y: number } | null>(null);

  // Helper functions for generating persistent IDs
  const generatePersistentNodeId = useCallback(() => {
    const id = `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return id;
  }, []);

  const generatePersistentEdgeId = useCallback((sourceId: string, targetId: string) => {
    return `edge-${sourceId}-${targetId}-${Date.now()}`;
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

  // Load workflow on mount if workflowId is provided
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const workflowId = urlParams.get('workflowId');
    
    if (workflowId && workflows.length > 0) {
      const workflow = workflows.find(w => w.id === workflowId);
      if (workflow) {
        console.log('Loading workflow:', workflow);
        setCurrentWorkflowId(workflowId);
        setNodes(workflow.nodes.map(node => ({
          ...node,
          data: {
            ...node.data,
            onConfigure: () => handleOpenNodeConfiguration(node.id),
          }
        })));
        setEdges(workflow.edges);
        
        // Apply viewport if available
        if (workflow.viewport && reactFlowInstance) {
          setTimeout(() => {
            reactFlowInstance.setViewport(workflow.viewport);
          }, 100);
        }
        
        toast({
          title: "Workflow Loaded",
          description: `"${workflow.name}" has been loaded for editing.`,
        });
      }
    }
  }, [workflows, reactFlowInstance, toast, handleOpenNodeConfiguration, setNodes, setEdges]);

  const handleSaveWorkflow = useCallback(async (name: string, description: string) => {
    console.log('WorkflowBuilder.handleSaveWorkflow called with:', { name, description });
    
    try {
      const viewport = reactFlowInstance?.getViewport() || { x: 0, y: 0, zoom: 1 };
      console.log('Current viewport:', viewport);
      console.log('Current nodes:', nodes);
      console.log('Current edges:', edges);
      
      if (currentWorkflowId) {
        // Update existing workflow
        await updateWorkflow(currentWorkflowId, name, description, nodes, edges, viewport);
        console.log('Workflow updated successfully in WorkflowBuilder');
        
        toast({
          title: "Workflow Updated",
          description: `"${name}" has been updated successfully.`,
        });
      } else {
        // Save new workflow
        const savedWorkflow = await saveWorkflow(name, description, nodes, edges, viewport);
        setCurrentWorkflowId(savedWorkflow.id);
        console.log('Workflow saved successfully in WorkflowBuilder');
        
        toast({
          title: "Workflow Saved",
          description: `"${name}" has been saved successfully.`,
        });
      }
    } catch (error) {
      console.error('Error in handleSaveWorkflow:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save workflow. Please try again.",
        variant: "destructive",
      });
      // Re-throw the error so the dialog can handle it
      throw error;
    }
  }, [nodes, edges, reactFlowInstance, saveWorkflow, updateWorkflow, currentWorkflowId, toast]);

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
    if (selectedNodes.length === 1 && aiAssistantEnabled) {
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
  }, [generateSuggestions, clearSuggestions, nodes, edges, aiAssistantEnabled]);

  const closeNodeEditor = useCallback(() => {
    setIsNodeEditorOpen(false);
    setSelectedNode(null);
  }, []);

  const handleNewWorkflow = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    setIsNodeEditorOpen(false);
    setNodeIdCounter(1);
    setCurrentWorkflowId(null);
    
    // Clear URL parameters
    const url = new URL(window.location.href);
    url.searchParams.delete('workflowId');
    window.history.replaceState({}, '', url.toString());
  }, [setNodes, setEdges]);

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
    reviewWorkflow(nodes, edges, "Current Workflow");
    setShowReview(true);
  }, [reviewWorkflow, nodes, edges]);

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

  const handleToggleAIAssistant = useCallback((enabled: boolean) => {
    setAiAssistantEnabled(enabled);
    if (!enabled) {
      // Clear suggestions and hide assistant when disabled
      clearSuggestions();
      setShowAssistant(false);
      setContextualSuggestionsPosition(null);
    }
  }, [clearSuggestions]);

  return (
    <WorkflowPermissionGuard>
      <div className="h-[800px] w-full flex border border-gray-200 rounded-lg overflow-hidden bg-white">
        <WorkflowSidebar onAddNode={addNode} />
        <div className="flex-1 flex flex-col">
          <WorkflowToolbar 
            onAddNode={addNode}
            onNewWorkflow={handleNewWorkflow}
            onOpenGenerator={() => setIsGeneratorOpen(true)}
            onOpenReview={handleOpenReview}
            onSaveWorkflow={() => setIsSaveDialogOpen(true)}
            nodes={nodes}
            edges={edges}
            aiAssistantEnabled={aiAssistantEnabled}
            onToggleAIAssistant={handleToggleAIAssistant}
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
            
            {/* Contextual suggestions near selected node - only show if AI Assistant is enabled */}
            {aiAssistantEnabled && contextualSuggestionsPosition && suggestions.length > 0 && (
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
      
      {/* Floating AI Assistant Panel - only show if AI Assistant is enabled */}
      {aiAssistantEnabled && (
        <FloatingAssistant
          suggestions={suggestions}
          isLoading={isSuggestionsLoading}
          isVisible={showAssistant}
          onClose={() => setShowAssistant(false)}
          onAddSuggestion={handleAddSuggestedStep}
          selectedNodeLabel={(selectedNode?.data as WorkflowNodeData)?.label}
        />
      )}
      
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
        workflowName="Current Workflow"
        onApplySuggestion={handleApplySuggestion}
        onDismissSuggestion={handleDismissSuggestion}
      />

      {/* Save Workflow Dialog */}
      <SaveWorkflowDialog
        isOpen={isSaveDialogOpen}
        onClose={() => setIsSaveDialogOpen(false)}
        onSave={handleSaveWorkflow}
        nodes={nodes}
        edges={edges}
      />
    </WorkflowPermissionGuard>
  );
}
