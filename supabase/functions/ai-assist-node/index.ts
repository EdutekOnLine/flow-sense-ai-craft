
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AIAssistRequest {
  prompt: string;
  fieldType: 'email' | 'webhook' | 'condition' | 'delay' | 'general';
  nodeType: string;
  currentValues?: any;
}

const generateSystemPrompt = (fieldType: string, nodeType: string) => {
  const basePrompt = `You are an AI assistant helping users configure workflow automation steps. Be practical, professional, and provide actionable content.`;
  
  switch (fieldType) {
    case 'email':
      return `${basePrompt}

For email configuration, generate:
- Professional email subject lines
- Well-structured email body content
- Use personalization tokens like {{first_name}}, {{company_name}}, {{order_number}} where appropriate
- Keep content concise and actionable
- Return JSON with "subject" and "body" fields`;

    case 'webhook':
      return `${basePrompt}

For webhook configuration, generate:
- Properly formatted JSON payloads
- Appropriate HTTP headers if needed
- Use placeholder variables like {{user_id}}, {{timestamp}}, {{data}} where appropriate
- Follow REST API best practices
- Return JSON with "payload" field containing the webhook payload`;

    case 'condition':
      return `${basePrompt}

For condition configuration, generate:
- Clear field names that make sense in business context
- Appropriate operators (equals, not_equals, contains, greater_than, less_than)
- Realistic values for comparison
- Return JSON with "field", "operator", and "value" fields`;

    case 'delay':
      return `${basePrompt}

For delay configuration, generate:
- Appropriate duration values
- Suitable time units (minutes, hours, days)
- Brief reasoning for the suggested timing
- Return JSON with "duration", "unit", and "reasoning" fields`;

    default:
      return `${basePrompt}

Generate helpful configuration content based on the user's request. Return structured JSON that can be applied to the workflow step.`;
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, fieldType, nodeType, currentValues }: AIAssistRequest = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log(`AI Assist request: ${fieldType} for ${nodeType}`);
    console.log(`Prompt: ${prompt}`);

    const systemPrompt = generateSystemPrompt(fieldType, nodeType);
    
    let userPrompt = prompt;
    if (currentValues && Object.keys(currentValues).length > 0) {
      userPrompt += `\n\nCurrent values: ${JSON.stringify(currentValues, null, 2)}`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const assistantResponse = data.choices[0].message.content;

    console.log(`AI Response: ${assistantResponse}`);

    // Try to parse JSON response, fallback to text if needed
    let content;
    try {
      content = JSON.parse(assistantResponse);
    } catch {
      // If not valid JSON, structure it based on field type
      switch (fieldType) {
        case 'email':
          const lines = assistantResponse.split('\n');
          content = {
            subject: lines.find(l => l.toLowerCase().includes('subject'))?.replace(/^.*subject:?\s*/i, '') || assistantResponse.substring(0, 100),
            body: assistantResponse
          };
          break;
        case 'webhook':
          content = { payload: assistantResponse };
          break;
        case 'condition':
          content = { 
            field: "custom_field",
            operator: "equals",
            value: assistantResponse 
          };
          break;
        case 'delay':
          content = {
            duration: 1,
            unit: "hours",
            reasoning: assistantResponse
          };
          break;
        default:
          content = { text: assistantResponse };
      }
    }

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-assist-node function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'An unexpected error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
