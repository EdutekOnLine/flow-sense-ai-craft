
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StepSuggestion {
  id: string;
  label: string;
  description: string;
  stepType: string;
  reason: string;
  confidence: number;
}

const generateStepSuggestions = async (workflowContext: any): Promise<StepSuggestion[]> => {
  console.log('Generating step suggestions for context:', workflowContext);

  const prompt = `
You are a workflow automation expert. Based on the current workflow context, suggest 3 logical next steps.

Current step: ${workflowContext.currentStep.type} - "${workflowContext.currentStep.label}"
Description: ${workflowContext.currentStep.description}

Existing next steps: ${workflowContext.existingNextSteps.map((step: any) => `${step.type}: ${step.label}`).join(', ') || 'None'}

Workflow size: ${workflowContext.workflowSize} nodes
Total connections: ${workflowContext.totalConnections}

Please respond with a JSON array of 3 step suggestions, each with:
- "id": A unique identifier for the suggestion
- "label": A short, descriptive name for the step
- "description": A brief description of what this step does
- "stepType": One of: "trigger", "form-submitted", "send-email", "manual-approval", "if-condition", "manual-task", "create-record", "update-record", "webhook", "delay", "end"
- "reason": Why this step makes sense as a next step (1-2 sentences)
- "confidence": A number between 0 and 1 indicating how confident you are in this suggestion

Consider:
- What naturally follows the current step type
- Common workflow patterns
- What hasn't been done yet in this workflow
- Logical business process flow

Example response:
[
  {
    "id": "approval-check",
    "label": "Manager Approval",
    "description": "Route request to manager for approval decision",
    "stepType": "manual-approval",
    "reason": "Form submissions typically require management approval before processing.",
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
          { role: 'system', content: 'You are a workflow automation expert that suggests logical next steps. Always respond with valid JSON array only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('OpenAI suggestions response:', content);
    
    try {
      const suggestions = JSON.parse(content);
      return Array.isArray(suggestions) ? suggestions : [];
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      return [];
    }

  } catch (error) {
    console.error('OpenAI suggestion generation failed:', error);
    return [];
  }
};

const handler = async (req: Request): Promise<Response> => {
  console.log('Suggest next steps function called');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { workflowContext } = await req.json();
    console.log('Received workflow context:', workflowContext);

    if (!workflowContext || !workflowContext.currentStep) {
      return new Response(
        JSON.stringify({ error: 'Workflow context with current step is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const suggestions = openAIApiKey 
      ? await generateStepSuggestions(workflowContext)
      : [];
    
    console.log('Generated suggestions:', suggestions);

    return new Response(
      JSON.stringify({ suggestions }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in suggest-next-steps function:', error);
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
