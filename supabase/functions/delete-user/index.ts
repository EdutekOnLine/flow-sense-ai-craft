
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface DeleteUserRequest {
  userId: string;
  adminId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, adminId }: DeleteUserRequest = await req.json();

    console.log("Received user deletion request:", { userId, adminId });

    // Initialize Supabase client with service role key for admin operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // First, verify the requesting user is an admin or root
    const { data: adminProfile, error: adminError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', adminId)
      .single();

    if (adminError || !adminProfile || !['admin', 'root'].includes(adminProfile.role)) {
      console.error("Unauthorized deletion attempt:", adminError);
      return new Response(
        JSON.stringify({ error: "Unauthorized: Only admins can delete users" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check if user being deleted exists and get their role
    const { data: userProfile, error: userError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (userError || !userProfile) {
      console.error("User not found:", userError);
      return new Response(
        JSON.stringify({ error: "User not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Prevent admin from deleting themselves
    if (userId === adminId) {
      return new Response(
        JSON.stringify({ error: "Cannot delete your own account" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Prevent deletion of root users (database trigger will also prevent this)
    if (userProfile.role === 'root') {
      return new Response(
        JSON.stringify({ error: "Root users cannot be deleted" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Only root users can delete admins
    if (userProfile.role === 'admin' && adminProfile.role !== 'root') {
      return new Response(
        JSON.stringify({ error: "Only root users can delete admin users" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check if this is the last admin (prevent deleting the last admin unless requester is root)
    if (userProfile.role === 'admin') {
      const { data: adminCount, error: countError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .eq('role', 'admin');

      if (countError || !adminCount || (adminCount.length <= 1 && adminProfile.role !== 'root')) {
        return new Response(
          JSON.stringify({ error: "Cannot delete the last admin user" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
    }

    console.log("Deleting user from auth.users table...");

    // Delete user from auth.users table (this will cascade to profiles table)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error("Error deleting user:", deleteError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to delete user", 
          details: deleteError.message 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("User deleted successfully:", userId);

    return new Response(JSON.stringify({
      message: "User deleted successfully",
      deletedUserId: userId
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in delete-user function:", error);
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
