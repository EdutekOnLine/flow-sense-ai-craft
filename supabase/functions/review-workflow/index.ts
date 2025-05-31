
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WorkflowSuggestion {
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
    changes?: any;
  };
  reasoning: string;
  confidence: number;
}

const generateWorkflowReview = async (workflowContext: any): Promise<WorkflowSuggestion[]> => {
  console.log('Generating workflow review for:', workflowContext.name);

  const prompt = `
You are a workflow optimization expert. Analyze the following workflow and provide specific improvement suggestions.

Workflow: "${workflowContext.name}"
Nodes: ${workflowContext.nodeCount}
Edges: ${workflowContext.edgeCount}

Workflow Structure:
${JSON.stringify(workflowContext.nodes, null, 2)}

Connections:
${JSON.stringify(workflowContext.edges, null, 2)}

Connectivity Analysis:
${JSON.stringify(workflowContext.connectivity, null, 2)}

Please analyze this workflow and suggest improvements in the following categories:

1. **Redundancy**: Identify duplicate or unnecessary steps
2. **Missing Branches**: Find incomplete conditional paths or error handling
3. **Performance**: Spot bottlenecks or inefficient sequences
4. **Optimization**: Suggest ways to streamline the workflow
5. **Best Practices**: Recommend industry standard improvements

For each suggestion, provide:
- A unique ID
- Type (redundancy, missing_branch, performance, optimization, best_practice)
- Title (brief description)
- Description (detailed explanation)
- Severity (low, medium, high)
- Node IDs and Edge IDs affected
- Suggested action type (remove, combine, add, modify, reorganize)
- Detailed action description
- Reasoning (why this improvement is needed)
- Confidence score (0-1)

Focus on actionable, specific improvements. Consider:
- Are there nodes with no connections?
- Do conditional nodes have both true/false paths?
- Are there redundant sequential steps?
- Is there proper error handling?
- Are there performance bottlenecks (like delays in critical paths)?
- Does the workflow follow logical business process flow?

Respond with a JSON array of suggestions:

[
  {
    "id": "unique-suggestion-id",
    "type": "redundancy",
    "title": "Remove Duplicate Email Step",
    "description": "Two consecutive email steps are sending similar content",
    "severity": "medium",
    "nodeIds": ["node-1", "node-2"],
    "edgeIds": ["edge-1"],
    "suggestedAction": {
      "type": "combine",
      "details": "Combine the two email steps into a single comprehensive message",
      "changes": {
        "nodesToRemove": ["node-2"],
        "nodesToModify": [{"id": "node-1", "changes": {"label": "Combined Email"}}]
      }
    },
    "reasoning": "Multiple consecutive emails can overwhelm recipients and reduce effectiveness",
    "confidence": 0.85
  }
]
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
          { role: 'system', content: 'You are a workflow optimization expert that analyzes business processes and suggests specific improvements. Always respond with valid JSON array only.' },
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
    
    console.log('OpenAI review response:', content);
    
    try {
      const suggestions = JSON.parse(content);
      return Array.isArray(suggestions) ? suggestions : [];
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      return [];
    }

  } catch (error) {
    console.error('OpenAI workflow review failed:', error);
    return [];
  }
};

const handler = async (req: Request): Promise<Response> => {
  console.log('Review workflow function called');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { workflowContext } = await req.json();
    console.log('Received workflow context:', workflowContext);

    if (!workflowContext || !workflowContext.nodes) {
      return new Response(
        JSON.stringify({ error: 'Workflow context with nodes is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const suggestions = openAIApiKey 
      ? await generateWorkflowReview(workflowContext)
      : [];
    
    console.log('Generated workflow review suggestions:', suggestions);

    return new Response(
      JSON.stringify({ suggestions }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in review-workflow function:', error);
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
