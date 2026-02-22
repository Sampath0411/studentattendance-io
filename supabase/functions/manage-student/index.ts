import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization")!;

    // Verify caller is admin
    const callerClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: roles } = await callerClient.from("user_roles").select("role").eq("user_id", caller.id);
    if (!roles?.some((r: any) => r.role === "admin")) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { action, ...payload } = await req.json();

    if (action === "create") {
      const { name, registration_number, password, batch } = payload;
      if (!name || !registration_number || !password || password.length < 6) {
        return new Response(JSON.stringify({ error: "Invalid input" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const email = `${registration_number.toLowerCase()}@student.au.edu`;
      const { data: newUser, error: createErr } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name, registration_number },
      });
      if (createErr) {
        return new Response(JSON.stringify({ error: createErr.message }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (batch && newUser.user) {
        await adminClient.from("profiles").update({ batch }).eq("id", newUser.user.id);
      }
      return new Response(JSON.stringify({ success: true, user_id: newUser.user?.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "create_bulk") {
      const { students } = payload;
      if (!Array.isArray(students) || students.length === 0) {
        return new Response(JSON.stringify({ error: "No students provided" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const results: any[] = [];
      for (const s of students) {
        const { name, registration_number, password, batch } = s;
        if (!name || !registration_number || !password) {
          results.push({ registration_number, success: false, error: "Missing fields" });
          continue;
        }
        const email = `${registration_number.toLowerCase()}@student.au.edu`;
        const { data: newUser, error: createErr } = await adminClient.auth.admin.createUser({
          email,
          password: password.length >= 6 ? password : "Student@123",
          email_confirm: true,
          user_metadata: { name, registration_number },
        });
        if (createErr) {
          results.push({ registration_number, success: false, error: createErr.message });
        } else {
          if (batch && newUser.user) {
            await adminClient.from("profiles").update({ batch }).eq("id", newUser.user.id);
          }
          results.push({ registration_number, success: true });
        }
      }
      return new Response(JSON.stringify({ results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "delete") {
      const { student_id } = payload;
      if (!student_id) {
        return new Response(JSON.stringify({ error: "Missing student_id" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Delete attendance, profile, role, then auth user
      await adminClient.from("attendance").delete().eq("student_id", student_id);
      await adminClient.from("user_roles").delete().eq("user_id", student_id);
      await adminClient.from("profiles").delete().eq("id", student_id);
      const { error: delErr } = await adminClient.auth.admin.deleteUser(student_id);
      if (delErr) {
        return new Response(JSON.stringify({ error: delErr.message }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
