import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the caller - require service role key or valid admin JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the caller is an existing admin using their JWT
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Allow service role key (for initial bootstrap only)
    const token = authHeader.replace("Bearer ", "");
    const isServiceRole = token === serviceRoleKey;

    if (!isServiceRole) {
      // Verify JWT belongs to an admin
      const userClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user }, error: userError } = await userClient.auth.getUser();
      if (userError || !user) {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      // Check admin role
      const { data: isAdmin } = await userClient.rpc("is_admin");
      if (!isAdmin) {
        return new Response(
          JSON.stringify({ error: "Forbidden: admin access required" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Check if admin already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const adminExists = existingUsers?.users?.some(
      (u: any) => u.email === "admin@admin.au.edu"
    );

    if (adminExists) {
      return new Response(
        JSON.stringify({ message: "Admin already exists" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create admin user
    const { data: adminUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: "admin@admin.au.edu",
      password: "Sampath2008",
      email_confirm: true,
      user_metadata: { name: "Admin", registration_number: "ADMIN" },
    });

    if (createError) throw createError;

    // Set admin role
    if (adminUser.user) {
      await supabaseAdmin
        .from("user_roles")
        .update({ role: "admin" })
        .eq("user_id", adminUser.user.id);
    }

    return new Response(
      JSON.stringify({ message: "Admin created successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
