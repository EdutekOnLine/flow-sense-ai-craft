
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface UserInvitationRequest {
  email: string;
  role: string;
  department?: string;
  invitationToken: string;
  invitedByName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, role, department, invitationToken, invitedByName }: UserInvitationRequest = await req.json();

    const inviteUrl = `${Deno.env.get('SITE_URL') || 'http://localhost:3000'}/?invite=${invitationToken}`;
    
    const departmentText = department ? ` in the ${department} department` : '';
    const inviterText = invitedByName ? ` by ${invitedByName}` : '';

    // Use a more generic from address that works with verified domains
    const fromAddress = "NeuraFlow <noreply@yourdomain.com>"; // You'll need to replace this with your verified domain
    
    console.log("Attempting to send invitation email to:", email);
    console.log("Using from address:", fromAddress);

    const emailResponse = await resend.emails.send({
      from: fromAddress,
      to: [email],
      subject: `You're invited to join NeuraFlow as ${role}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb; margin-bottom: 20px;">You're Invited to NeuraFlow</h1>
          
          <p>Hello,</p>
          
          <p>You have been invited${inviterText} to join NeuraFlow as a <strong>${role}</strong>${departmentText}.</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #1e293b; margin-top: 0;">Getting Started</h2>
            <p>Click the button below to create your account and start using NeuraFlow's intelligent workflow management system.</p>
          </div>
          
          <div style="margin: 30px 0; text-align: center;">
            <a href="${inviteUrl}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Accept Invitation & Create Account
            </a>
          </div>
          
          <p style="color: #64748b; font-size: 14px;">
            If the button doesn't work, you can copy and paste this link into your browser:<br>
            <a href="${inviteUrl}" style="color: #2563eb;">${inviteUrl}</a>
          </p>
          
          <p style="color: #64748b; font-size: 14px;">
            This invitation will expire in 7 days. If you have any questions, please contact your administrator.
          </p>
          
          <p style="color: #64748b; font-size: 14px;">
            Best regards,<br>
            The NeuraFlow Team
          </p>
        </div>
      `,
    });

    console.log("Email response:", emailResponse);

    if (emailResponse.error) {
      console.error("Resend API error:", emailResponse.error);
      return new Response(
        JSON.stringify({ 
          error: "Email sending failed", 
          details: emailResponse.error,
          message: "Please verify your domain at resend.com/domains and update the from address in the edge function" 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("User invitation email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-user-invitation function:", error);
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
