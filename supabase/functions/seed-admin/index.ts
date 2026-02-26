import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const sectionAdmins = [
  { email: "admin.a3@admin.au.edu", section: "A3", name: "Admin A3" },
  { email: "admin.a4@admin.au.edu", section: "A4", name: "Admin A4" },
  { email: "admin.a5@admin.au.edu", section: "A5", name: "Admin A5" },
  { email: "admin.a6@admin.au.edu", section: "A6", name: "Admin A6" },
  { email: "admin.a7@admin.au.edu", section: "A7", name: "Admin A7" },
  { email: "admin.a8@admin.au.edu", section: "A8", name: "Admin A8" },
  { email: "admin.a9@admin.au.edu", section: "A9", name: "Admin A9" },
  { email: "admin.womenscollege@admin.au.edu", section: "Women's College", name: "Admin Women's College" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const token = authHeader.replace("Bearer ", "");

    if (token !== serviceRoleKey) {
      const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: userData } = await userClient.auth.getUser();
      if (!userData.user) {
        return new Response(JSON.stringify({ error: "Invalid token" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: isAdminData } = await userClient.rpc("is_admin");
      if (!isAdminData) {
        return new Response(JSON.stringify({ error: "Not an admin" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingEmails = new Set(existingUsers?.users?.map((u: any) => u.email) || []);

    const results: string[] = [];

    // Seed main admin
    if (!existingEmails.has("admin@admin.au.edu")) {
      const { data: adminUser, error } = await supabaseAdmin.auth.admin.createUser({
        email: "admin@admin.au.edu",
        password: "Sampath2008",
        email_confirm: true,
        user_metadata: { name: "Admin", registration_number: "ADMIN" },
      });
      if (error) { results.push(`A2 admin error: ${error.message}`); }
      else if (adminUser.user) {
        await supabaseAdmin.from("user_roles").update({ role: "admin" }).eq("user_id", adminUser.user.id);
        await supabaseAdmin.from("profiles").update({ section: "A2" }).eq("id", adminUser.user.id);
        results.push("A2 admin created");
      }
    } else {
      results.push("A2 admin exists");
    }

    // Seed section admins
    for (const sa of sectionAdmins) {
      if (!existingEmails.has(sa.email)) {
        const { data: user, error } = await supabaseAdmin.auth.admin.createUser({
          email: sa.email,
          password: "Admin@123",
          email_confirm: true,
          user_metadata: { name: sa.name, registration_number: "ADMIN" },
        });
        if (error) { results.push(`${sa.section} error: ${error.message}`); }
        else if (user.user) {
          await supabaseAdmin.from("user_roles").upsert({ user_id: user.user.id, role: "admin" });
          await supabaseAdmin.from("profiles").update({ section: sa.section }).eq("id", user.user.id);
          results.push(`${sa.section} admin created`);
        }
      } else {
        results.push(`${sa.section} admin exists`);
      }
    }

    return new Response(JSON.stringify({ message: "Seeding complete", results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
