
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    stepType: string;
    description: string;
    assignedTo: string | null;
    estimatedHours: number | null;
    [key: string]: any;
  };
  dragHandle: string;
}

interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  data?: { label?: string };
  markerEnd?: any;
  style?: any;
}

const generateNodeId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `node-${timestamp}-${random}`;
};

const generateEdgeId = (sourceId: string, targetId: string) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `edge-${sourceId}-${targetId}-${timestamp}-${random}`;
};

const createNode = (stepType: string, label: string, description: string, x: number, y: number, additionalData: any = {}): WorkflowNode => {
  return {
    id: generateNodeId(),
    type: 'workflowStep',
    position: { x, y },
    data: {
      label,
      stepType,
      description,
      assignedTo: null,
      estimatedHours: null,
      ...additionalData
    },
    dragHandle: '.drag-handle',
  };
};

const createEdge = (sourceId: string, targetId: string, label?: string): WorkflowEdge => {
  return {
    id: generateEdgeId(sourceId, targetId),
    source: sourceId,
    target: targetId,
    type: label ? 'conditional' : 'default',
    data: label ? { label } : undefined,
    markerEnd: {
      type: 'ArrowClosed',
      width: 20,
      height: 20,
    },
    style: {
      strokeWidth: 2,
      stroke: label ? '#6366f1' : '#64748b',
    },
  };
};

const generateWorkflowWithOpenAI = async (description: string): Promise<{ nodes: WorkflowNode[], edges: WorkflowEdge[], title: string, workflowDescription: string }> => {
  console.log('Generating workflow with OpenAI for description:', description);

  const prompt = `
You are a workflow automation expert. Based on the following description, generate a detailed workflow with clear steps and connections.

Description: "${description}"

Please respond with a JSON object containing:
1. "title": A concise title for the workflow (max 50 characters)
2. "description": A brief description of what this workflow accomplishes
3. "steps": An array of workflow steps, each with:
   - "type": One of these step types: "trigger", "form-submitted", "send-email", "manual-approval", "if-condition", "manual-task", "create-record", "update-record", "webhook", "delay", "end"
   - "label": A short, descriptive name for the step
   - "description": A detailed description of what this step does
   - "conditions": (optional) For conditional steps, what condition is being checked
4. "connections": An array of connections between steps, each with:
   - "from": The index of the source step (0-based)
   - "to": The index of the target step (0-based)
   - "label": (optional) For conditional connections, the condition label (e.g., "Yes", "No", "Approved", "Rejected")

Rules:
- Always start with a "trigger" step
- Always end with an "end" step
- Use "if-condition" for decision points with multiple outcomes
- Use "manual-approval" when human approval is needed
- Use "send-email" for notifications
- Use "delay" for waiting periods
- Make sure all steps are connected logically
- For conditional steps, create separate paths for different outcomes

Example response format:
{
  "title": "Employee Onboarding Process",
  "description": "Automates the employee onboarding workflow from application to first day",
  "steps": [
    {
      "type": "trigger",
      "label": "Start Process",
      "description": "Workflow triggered when new employee form is submitted"
    },
    {
      "type": "manual-approval",
      "label": "HR Review",
      "description": "HR manager reviews the application and makes approval decision"
    }
  ],
  "connections": [
    {
      "from": 0,
      "to": 1
    }
  ]
}
`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a workflow automation expert that creates structured workflows from natural language descriptions. Always respond with valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('OpenAI raw response:', content);
    
    // Parse the JSON response
    let workflowData;
    try {
      workflowData = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', parseError);
      // Fallback to rule-based parsing
      return parseWorkflowDescriptionFallback(description);
    }

    // Convert OpenAI response to our workflow format
    const nodes: WorkflowNode[] = [];
    const edges: WorkflowEdge[] = [];
    
    // Create nodes from steps
    workflowData.steps.forEach((step: any, index: number) => {
      const x = 250;
      const y = 50 + (index * 150);
      
      const node = createNode(
        step.type,
        step.label,
        step.description,
        x,
        y,
        step.conditions ? { conditionConfig: { value: step.conditions } } : {}
      );
      
      nodes.push(node);
    });
    
    // Create edges from connections
    workflowData.connections.forEach((connection: any) => {
      const sourceNode = nodes[connection.from];
      const targetNode = nodes[connection.to];
      
      if (sourceNode && targetNode) {
        const edge = createEdge(sourceNode.id, targetNode.id, connection.label);
        edges.push(edge);
      }
    });

    return {
      nodes,
      edges,
      title: workflowData.title || 'Generated Workflow',
      workflowDescription: workflowData.description || description
    };

  } catch (error) {
    console.error('OpenAI generation failed, falling back to rule-based parsing:', error);
    return parseWorkflowDescriptionFallback(description);
  }
};

const parseWorkflowDescriptionFallback = (description: string): { nodes: WorkflowNode[], edges: WorkflowEdge[], title: string, workflowDescription: string } => {
  console.log('Using fallback parsing for description:', description);
  
  const nodes: WorkflowNode[] = [];
  const edges: WorkflowEdge[] = [];
  let nodeCounter = 0;
  
  // Generate title from description
  const title = description.split('.')[0].substring(0, 50) + (description.length > 50 ? '...' : '');
  
  // Start node
  const startNode = createNode('trigger', 'Start', 'Workflow start trigger', 50, 50);
  nodes.push(startNode);
  let lastNode = startNode;
  
  // Basic parsing patterns
  const patterns = [
    { regex: /when\s+(.+?)\s+fills?\s+out\s+(.+?)\s+form/i, type: 'form-submitted', action: 'Form Submission' },
    { regex: /notify\s+(.+?)(?:\s+and|$|\.)/i, type: 'send-email', action: 'Send Notification' },
    { regex: /wait\s+for\s+approval/i, type: 'manual-approval', action: 'Manual Approval' },
    { regex: /if\s+approved/i, type: 'if-condition', action: 'Approval Check' },
    { regex: /if\s+rejected/i, type: 'if-condition', action: 'Rejection Check' },
    { regex: /send\s+(.+?)\s+email/i, type: 'send-email', action: 'Send Email' },
    { regex: /create\s+(.+?)(?:\s+and|$|\.)/i, type: 'create-record', action: 'Create Record' },
    { regex: /update\s+(.+?)(?:\s+and|$|\.)/i, type: 'update-record', action: 'Update Record' },
    { regex: /schedule\s+(.+?)(?:\s+and|$|\.)/i, type: 'delay', action: 'Schedule Task' },
  ];
  
  const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  sentences.forEach((sentence, index) => {
    const trimmed = sentence.trim();
    if (!trimmed) return;
    
    nodeCounter++;
    const yPos = 50 + (nodeCounter * 150);
    
    // Check for patterns
    let matched = false;
    for (const pattern of patterns) {
      const match = trimmed.match(pattern.regex);
      if (match) {
        const node = createNode(
          pattern.type,
          pattern.action,
          trimmed,
          250,
          yPos
        );
        nodes.push(node);
        
        // Create edge from last node
        if (lastNode) {
          const edgeLabel = pattern.type === 'if-condition' 
            ? (trimmed.includes('approved') ? 'Yes' : trimmed.includes('rejected') ? 'No' : undefined)
            : undefined;
          edges.push(createEdge(lastNode.id, node.id, edgeLabel));
        }
        
        lastNode = node;
        matched = true;
        break;
      }
    }
    
    // If no pattern matched, create a generic task
    if (!matched && trimmed.length > 5) {
      const node = createNode(
        'manual-task',
        'Manual Task',
        trimmed,
        250,
        yPos
      );
      nodes.push(node);
      
      if (lastNode) {
        edges.push(createEdge(lastNode.id, node.id));
      }
      
      lastNode = node;
    }
  });
  
  // Add end node
  const endNode = createNode('end', 'Complete', 'Workflow completed', 450, 50 + ((nodeCounter + 1) * 150));
  nodes.push(endNode);
  
  if (lastNode && lastNode !== endNode) {
    edges.push(createEdge(lastNode.id, endNode.id));
  }
  
  return {
    nodes,
    edges,
    title,
    workflowDescription: description
  };
};

const handler = async (req: Request): Promise<Response> => {
  console.log('Generate workflow function called');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { description } = await req.json();
    console.log('Received description:', description);

    if (!description || typeof description !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Description is required and must be a string' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Use OpenAI if API key is available, otherwise fallback to rule-based parsing
    const result = openAIApiKey 
      ? await generateWorkflowWithOpenAI(description)
      : parseWorkflowDescriptionFallback(description);
    
    console.log('Generated workflow result:', {
      title: result.title,
      nodeCount: result.nodes.length,
      edgeCount: result.edges.length
    });

    return new Response(
      JSON.stringify({
        nodes: result.nodes,
        edges: result.edges,
        title: result.title,
        description: result.workflowDescription
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-workflow function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);
