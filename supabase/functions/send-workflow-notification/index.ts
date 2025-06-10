
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WorkflowNotificationRequest {
  userEmail: string;
  userName: string;
  stepName: string;
  workflowName: string;
  stepDescription?: string;
  dueDate?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userEmail, userName, stepName, workflowName, stepDescription, dueDate }: WorkflowNotificationRequest = await req.json();

    const dueDateText = dueDate 
      ? `Due: ${new Date(dueDate).toLocaleDateString()}`
      : '';

    const emailResponse = await resend.emails.send({
      from: "NeuraFlow <onboarding@resend.dev>",
      to: [userEmail],
      subject: `New Workflow Step Assigned: ${stepName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb; margin-bottom: 20px;">New Workflow Step Assigned</h1>
          
          <p>Hello ${userName},</p>
          
          <p>You have been assigned a new step in a workflow:</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #1e293b; margin-top: 0;">${stepName}</h2>
            <p><strong>Workflow:</strong> ${workflowName}</p>
            ${stepDescription ? `<p><strong>Description:</strong> ${stepDescription}</p>` : ''}
            ${dueDateText ? `<p><strong>${dueDateText}</strong></p>` : ''}
          </div>
          
          <p>Please log in to your NeuraFlow dashboard to view and manage this assignment.</p>
          
          <div style="margin: 30px 0;">
            <a href="${Deno.env.get('SITE_URL') || 'https://neuraflowai.app'}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Assignment
            </a>
          </div>
          
          <p style="color: #64748b; font-size: 14px;">
            Best regards,<br>
            The NeuraFlow Team
          </p>
        </div>
      `,
    });

    console.log("Workflow notification email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-workflow-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
