
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AdvanceWorkflowRequest {
  workflowId: string;
  completedStepId: string;
  completedBy: string;
  completionNotes?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { workflowId, completedStepId, completedBy, completionNotes }: AdvanceWorkflowRequest = await req.json();

    console.log(`Advancing workflow ${workflowId}, completed step ${completedStepId} by ${completedBy}`);

    // Get the active workflow instance for this workflow
    const { data: workflowInstance, error: instanceError } = await supabaseClient
      .from('workflow_instances')
      .select('*')
      .eq('workflow_id', workflowId)
      .eq('status', 'active')
      .single();

    if (instanceError || !workflowInstance) {
      console.error('Error fetching workflow instance:', instanceError);
      throw new Error(`No active workflow instance found for workflow ${workflowId}`);
    }

    console.log('Found workflow instance:', workflowInstance);

    // Verify this is the current step
    if (workflowInstance.current_step_id !== completedStepId) {
      throw new Error('Cannot complete step - this is not the current step in the workflow');
    }

    // Log the step completion
    const { error: logError } = await supabaseClient
      .from('workflow_comments')
      .insert({
        workflow_id: workflowId,
        user_id: completedBy,
        comment: `Step completed: ${completionNotes || 'No additional notes'}`
      });

    if (logError) {
      console.error('Error logging step completion:', logError);
    }

    // Get current workflow steps ordered by step_order
    const { data: workflowSteps, error: stepsError } = await supabaseClient
      .from('workflow_steps')
      .select('*')
      .eq('workflow_id', workflowId)
      .order('step_order', { ascending: true });

    if (stepsError) {
      throw new Error(`Failed to fetch workflow steps: ${stepsError.message}`);
    }

    // Find the completed step and the next step
    const completedStepIndex = workflowSteps.findIndex(step => step.id === completedStepId);
    if (completedStepIndex === -1) {
      throw new Error('Completed step not found in workflow');
    }

    const completedStep = workflowSteps[completedStepIndex];
    console.log(`Completed step: ${completedStep.name} (order: ${completedStep.step_order})`);

    // Update the completed step status
    const { error: updateStepError } = await supabaseClient
      .from('workflow_steps')
      .update({ 
        status: 'completed',
        actual_hours: completedStep.estimated_hours
      })
      .eq('id', completedStepId);

    if (updateStepError) {
      console.error('Error updating step status:', updateStepError);
    }

    // Check if there's a next step
    const nextStepIndex = completedStepIndex + 1;
    if (nextStepIndex < workflowSteps.length) {
      const nextStep = workflowSteps[nextStepIndex];
      console.log(`Next step: ${nextStep.name} (order: ${nextStep.step_order})`);

      // Update workflow instance to point to next step
      const { error: instanceUpdateError } = await supabaseClient
        .from('workflow_instances')
        .update({ 
          current_step_id: nextStep.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', workflowInstance.id);

      if (instanceUpdateError) {
        console.error('Error updating workflow instance:', instanceUpdateError);
        throw instanceUpdateError;
      }

      // Update next step status to pending if it's not already
      const { error: nextStepError } = await supabaseClient
        .from('workflow_steps')
        .update({ status: 'pending' })
        .eq('id', nextStep.id);

      if (nextStepError) {
        console.error('Error updating next step status:', nextStepError);
      }

      // Create assignment for the next step ONLY if someone is assigned
      if (nextStep.assigned_to) {
        console.log(`Creating assignment for next step assigned to: ${nextStep.assigned_to}`);
        
        const { error: assignmentError } = await supabaseClient
          .from('workflow_step_assignments')
          .insert({
            workflow_step_id: nextStep.id,
            assigned_to: nextStep.assigned_to,
            assigned_by: completedBy,
            status: 'pending',
            due_date: nextStep.metadata?.due_date || null
          });

        if (assignmentError) {
          console.error('Error creating step assignment:', assignmentError);
          throw assignmentError;
        } else {
          console.log('Step assignment created successfully for next step');
        }
      }
    } else {
      // This was the last step, mark workflow instance as completed
      console.log('Workflow completed - marking instance as completed');
      
      const { error: instanceCompleteError } = await supabaseClient
        .from('workflow_instances')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString(),
          current_step_id: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', workflowInstance.id);

      if (instanceCompleteError) {
        console.error('Error updating workflow instance:', instanceCompleteError);
        throw instanceCompleteError;
      }

      // Log workflow completion
      const { error: completionLogError } = await supabaseClient
        .from('workflow_comments')
        .insert({
          workflow_id: workflowId,
          user_id: completedBy,
          comment: 'Workflow completed - all steps finished'
        });

      if (completionLogError) {
        console.error('Error logging workflow completion:', completionLogError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Workflow advanced successfully',
        workflowId,
        completedStepId,
        nextStepExists: nextStepIndex < workflowSteps.length,
        workflowInstanceId: workflowInstance.id
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error("Error in advance-workflow function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
