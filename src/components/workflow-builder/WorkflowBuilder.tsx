import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Node,
  Edge,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { initialNodes, initialEdges } from './initial-elements';
import { WorkflowNode } from './WorkflowNode';
import { NodeEditor } from './NodeEditor';
import { Button } from '@/components/ui/button';
import { Plus, Save, Upload, Download, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/components/ui/use-toast"
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createWorkflow, getWorkflow, updateWorkflow } from '@/lib/api/workflow.api';
import { useParams } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from "zod"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Workflow } from '@/lib/types';
import { useUser } from '@clerk/nextjs';
import { DraggableStep } from './DraggableStep';

const defaultNodeOptions = [
  { label: 'Send Email', type: 'send-email', description: 'Send an email to a specified address.' },
  { label: 'Update Record', type: 'update-record', description: 'Update a record in the database.' },
  { label: 'Create Task', type: 'create-task', description: 'Create a new task for a user.' },
  { label: 'Webhook Call', type: 'webhook-call', description: 'Make a call to a webhook endpoint.' },
  { label: 'If Condition', type: 'if-condition', description: 'Check a condition and branch the workflow.' },
  { label: 'Filter', type: 'filter', description: 'Filter records based on specified criteria.' },
  { label: 'Delay', type: 'delay', description: 'Pause the workflow for a specified duration.' },
  { label: 'Wait', type: 'wait', description: 'Wait for a specific event to occur.' },
  { label: 'Approval', type: 'approval', description: 'Request approval from a user.' },
  { label: 'Form Submitted', type: 'form-submitted', description: 'Triggered when a form is submitted.' },
  { label: 'Schedule Trigger', type: 'schedule-trigger', description: 'Triggered based on a schedule.' },
];

interface WorkflowNodeData extends Record<string, unknown> {
  label: string;
  stepType: string;
  description: string;
  assignedTo: string | null;
  estimatedHours: number | null;
  onConfigure?: (nodeId: string) => void;
}

const workflowSchema = z.object({
  name: z.string().min(3, {
    message: "Workflow name must be at least 3 characters.",
  }),
  description: z.string().optional(),
  triggerType: z.string().optional(),
})

export default function WorkflowBuilder() {
  const { toast } = useToast()
  const { id: workflowId } = useParams();
  const queryClient = useQueryClient();
  const { user } = useUser();

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange, updateEdge] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [availableFields, setAvailableFields] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [canEditWorkflows, setCanEditWorkflows] = useState(false);
  const [workflowDetails, setWorkflowDetails] = useState<Workflow | null>(null);

  const workflowForm = useForm<z.infer<typeof workflowSchema>>({
    resolver: zodResolver(workflowSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  })

  const { data: workflowData, isLoading: isWorkflowLoading } = useQuery({
    queryKey: ['workflow', workflowId],
    queryFn: () => getWorkflow(workflowId as string),
    enabled: !!workflowId,
    onSuccess: (data) => {
      if (data) {
        setNodes(data.nodes as Node[]);
        setEdges(data.edges as Edge[]);
        setWorkflowDetails(data);
        workflowForm.reset({
          name: data.name,
          description: data.description,
          triggerType: data.triggerType || '',
        });
        setCanEditWorkflows(data.createdBy === user?.id);
      }
    },
    onError: (error) => {
      toast({
        title: "Error fetching workflow",
        description: "Failed to fetch workflow details. Please try again.",
        variant: "destructive",
      })
    }
  });

  const { mutate: saveWorkflow, isLoading: isSaveLoading } = useMutation({
    mutationFn: async (data: { nodes: Node[], edges: Edge[], name: string, description: string, triggerType: string }) => {
      if (workflowId) {
        return updateWorkflow(workflowId, data);
      } else {
        return createWorkflow(data);
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Workflow saved",
        description: "Your workflow has been saved successfully.",
      })
      queryClient.invalidateQueries(['workflows']);
      if (!workflowId && data?.id) {
        window.location.href = `/workflow/${data.id}`;
      }
    },
    onError: (error) => {
      toast({
        title: "Error saving workflow",
        description: "Failed to save workflow. Please try again.",
        variant: "destructive",
      })
    }
  });

  const onUpdateNode = useCallback((nodeId: string, newData: Partial<WorkflowNodeData>) => {
    if (!canEditWorkflows) {
      toast({
        title: "Cannot edit workflow",
        description: "You do not have permission to edit this workflow.",
      });
      return;
    }

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              ...newData,
            },
          };
        }
        return node;
      })
    );

    // Update selected node if it's the one being edited
    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode((prevSelectedNode) => {
        if (prevSelectedNode) {
          return {
            ...prevSelectedNode,
            data: {
              ...prevSelectedNode.data,
              ...newData,
            },
          };
        }
        return prevSelectedNode;
      });
    }

    toast({
      title: "Node updated",
      description: `Node ${nodeId} has been updated.`,
    })
  }, [setNodes, selectedNode, canEditWorkflows, toast]);

  // Simple function to handle node configuration
  const handleNodeConfigure = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setSelectedNode(node);
      setIsEditorOpen(true);
    }
  }, [nodes]);

  const onConnect = useCallback(
    (params) => {
      if (!canEditWorkflows) {
        toast({
          title: "Cannot edit workflow",
          description: "You do not have permission to edit this workflow.",
        });
        return;
      }
      setEdges((eds) => addEdge(params, eds))
    },
    [setEdges, canEditWorkflows, toast]
  );

  const onNodesChangeWrapper = useCallback((changes) => {
    if (!canEditWorkflows) {
      toast({
        title: "Cannot edit workflow",
        description: "You do not have permission to edit this workflow.",
      });
      return;
    }
    onNodesChange(changes)
  }, [onNodesChange, canEditWorkflows, toast]);

  const onEdgesChangeWrapper = useCallback((changes) => {
    if (!canEditWorkflows) {
      toast({
        title: "Cannot edit workflow",
        description: "You do not have permission to edit this workflow.",
      });
      return;
    }
    onEdgesChange(changes)
  }, [onEdgesChange, canEditWorkflows, toast]);

  const addNewNode = useCallback((stepType: string, position?: { x: number; y: number }) => {
    if (!canEditWorkflows) {
      toast({
        title: "Cannot edit workflow",
        description: "You do not have permission to edit this workflow.",
      });
      return;
    }

    const newId = String(nodes.length + 1);

    const getDefaultLabel = (type: string) => {
      const foundOption = defaultNodeOptions.find(option => option.type === type);
      return foundOption ? foundOption.label : 'New Node';
    };

    const getDefaultDescription = (type: string) => {
      const foundOption = defaultNodeOptions.find(option => option.type === type);
      return foundOption ? foundOption.description : '';
    };
    
    const newNode: Node = {
      id: newId,
      type: 'workflow',
      position: position || { x: Math.random() * 300, y: Math.random() * 300 },
      data: {
        label: getDefaultLabel(stepType),
        stepType,
        description: getDefaultDescription(stepType),
        assignedTo: null,
        estimatedHours: null,
        onConfigure: handleNodeConfigure
      },
    };

    setNodes((nds) => nds.concat(newNode));
    
    // Auto-select and open editor for new nodes
    setSelectedNode(newNode);
    setIsEditorOpen(true);
  }, [nodes, handleNodeConfigure, canEditWorkflows, toast]);

  // Update existing nodes to include the configure function
  useEffect(() => {
    setNodes((currentNodes) => 
      currentNodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          onConfigure: handleNodeConfigure
        }
      }))
    );
  }, [handleNodeConfigure, setNodes]);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      if (!canEditWorkflows) {
        toast({
          title: "Cannot edit workflow",
          description: "You do not have permission to edit this workflow.",
        });
        return;
      }

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      // check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance!.project({
        x: event.clientX - reactFlowBounds!.left,
        y: event.clientY - reactFlowBounds!.top,
      });
      addNewNode(type, position);
    },
    [reactFlowInstance, addNewNode, canEditWorkflows, toast]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const handleSave = async (values: z.infer<typeof workflowSchema>) => {
    if (!canEditWorkflows) {
      toast({
        title: "Cannot edit workflow",
        description: "You do not have permission to edit this workflow.",
      });
      return;
    }

    try {
      saveWorkflow({
        nodes,
        edges,
        name: values.name,
        description: values.description,
        triggerType: values.triggerType || '',
      });
    } catch (error) {
      console.error("Error saving workflow:", error);
      toast({
        title: "Error saving workflow",
        description: "Failed to save workflow. Please try again.",
        variant: "destructive",
      })
    }
  };

  const nodeTypes = useMemo(() => ({ workflow: WorkflowNode }), []);

  return (
    <div className="h-screen w-full">
      <ReactFlowProvider>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="absolute top-4 right-20 z-50">
              <Settings className="h-4 w-4 mr-2" />
              Workflow Settings
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Workflow Settings</DialogTitle>
              <DialogDescription>
                Make changes to your workflow here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <Form {...workflowForm}>
              <form onSubmit={workflowForm.handleSubmit(handleSave)} className="space-y-4">
                <FormField
                  control={workflowForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Workflow Name" {...field} />
                      </FormControl>
                      <FormDescription>
                        This is the name that will be displayed in the workflow list.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={workflowForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Workflow Description" {...field} />
                      </FormControl>
                      <FormDescription>
                        Briefly describe what this workflow does.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={isSaveLoading}>Save changes</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <div className="absolute top-4 right-4 z-50">
          <Button variant="outline" size="sm" onClick={() => handleSave(workflowForm.getValues())} disabled={isSaveLoading}>
            <Save className="h-4 w-4 mr-2" />
            {workflowId ? 'Update' : 'Save'}
          </Button>
        </div>

        <div className="sidebar absolute left-4 top-4 z-50 bg-white border rounded p-2">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Add New Step</h3>
          {defaultNodeOptions.map((option) => (
            <DraggableStep key={option.type} type={option.type} label={option.label} />
          ))}
        </div>

        <div className="reactflow-wrapper h-full" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChangeWrapper}
            onEdgesChange={onEdgesChangeWrapper}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onInit={setReactFlowInstance}
            nodeTypes={nodeTypes}
            fitView
            className="bg-gray-100"
          >
            <Controls />
            <Background variant="dots" gap={20} size={0.5} />
          </ReactFlow>
        </div>

        <NodeEditor
          selectedNode={selectedNode}
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          onUpdateNode={onUpdateNode}
          availableFields={availableFields}
        />
      </ReactFlowProvider>
    </div>
  );
}
