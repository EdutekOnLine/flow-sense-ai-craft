
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user from JWT
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify API access for neura-flow module
    const { data: hasAccess } = await supabase.rpc('verify_api_access', {
      p_user_id: user.id,
      p_module_name: 'neura-flow',
      p_action: 'write'
    });

    if (!hasAccess) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions for workflow generation' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { description, context = '' } = await req.json();

    if (!description) {
      return new Response(
        JSON.stringify({ error: 'Missing workflow description' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate workflow using OpenAI
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a workflow automation expert. Generate a structured workflow based on the user's description. Return a JSON object with the following structure:
            {
              "name": "Workflow Name",
              "description": "Workflow description",
              "steps": [
                {
                  "name": "Step name",
                  "description": "Step description",
                  "estimated_hours": 2,
                  "dependencies": []
                }
              ]
            }
            Keep steps practical and actionable. Estimate hours realistically.`
          },
          {
            role: 'user',
            content: `Create a workflow for: ${description}${context ? `\n\nAdditional context: ${context}` : ''}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      console.error('OpenAI API error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to generate workflow' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openaiResult = await openaiResponse.json();
    const workflowContent = openaiResult.choices[0]?.message?.content;

    if (!workflowContent) {
      return new Response(
        JSON.stringify({ error: 'No workflow generated' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    try {
      const workflowData = JSON.parse(workflowContent);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          workflow: workflowData 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (parseError) {
      console.error('Failed to parse workflow JSON:', parseError);
      return new Response(
        JSON.stringify({ error: 'Failed to parse generated workflow' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Error generating workflow:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

