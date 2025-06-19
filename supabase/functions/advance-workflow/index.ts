
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
        JSON.stringify({ error: 'Insufficient permissions for workflow operations' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { workflowId, stepId } = await req.json();

    if (!workflowId || !stepId) {
      return new Response(
        JSON.stringify({ error: 'Missing workflowId or stepId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Advance the workflow step
    const { data: updatedStep, error: stepError } = await supabase
      .from('workflow_steps')
      .update({ 
        status: 'completed',
        actual_hours: 1 // This could be calculated based on time tracking
      })
      .eq('id', stepId)
      .eq('workflow_id', workflowId)
      .select()
      .single();

    if (stepError) {
      return new Response(
        JSON.stringify({ error: stepError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get next step in the workflow
    const { data: nextStep } = await supabase
      .from('workflow_steps')
      .select('*')
      .eq('workflow_id', workflowId)
      .eq('status', 'pending')
      .order('step_order')
      .limit(1)
      .single();

    // Update workflow instance if there's a next step
    if (nextStep) {
      await supabase
        .from('workflow_instances')
        .update({ current_step_id: nextStep.id })
        .eq('workflow_id', workflowId);
    } else {
      // Mark workflow as completed
      await supabase
        .from('workflow_instances')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('workflow_id', workflowId);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        updatedStep,
        nextStep: nextStep || null,
        workflowCompleted: !nextStep
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error advancing workflow:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

