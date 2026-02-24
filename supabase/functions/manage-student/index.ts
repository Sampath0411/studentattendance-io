import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Validation helpers
const REGEX_ALPHANUM = /^[A-Za-z0-9]+$/;
const REGEX_NAME = /^[A-Za-z0-9\s.\-']+$/;
const MAX_NAME_LEN = 100;
const MAX_REG_LEN = 50;
const MAX_PASSWORD_LEN = 128;
const MIN_PASSWORD_LEN = 6;
const MAX_BATCH_LEN = 50;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validateStudent(s: any): string | null {
  if (!s.name || typeof s.name !== "string" || s.name.trim().length === 0 || s.name.length > MAX_NAME_LEN) return "Invalid name";
  if (!REGEX_NAME.test(s.name)) return "Name contains invalid characters";
  if (!s.registration_number || typeof s.registration_number !== "string" || s.registration_number.length > MAX_REG_LEN) return "Invalid registration number";
  if (!REGEX_ALPHANUM.test(s.registration_number)) return "Registration number must be alphanumeric";
  if (!s.password || typeof s.password !== "string" || s.password.length < MIN_PASSWORD_LEN || s.password.length > MAX_PASSWORD_LEN) return `Password must be ${MIN_PASSWORD_LEN}-${MAX_PASSWORD_LEN} characters`;
  if (s.batch && (typeof s.batch !== "string" || s.batch.length > MAX_BATCH_LEN)) return "Invalid batch";
  return null;
}

function validateUUID(id: string): boolean {
  return typeof id === "string" && UUID_REGEX.test(id);
}

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

    const dbClient = createClient(supabaseUrl, serviceRoleKey);
    const authHeaders = {
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey,
      "Content-Type": "application/json",
    };

    // GoTrue admin helpers
    async function createAuthUser(email: string, password: string, name: string, regNum: string) {
      const resp = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          email, password, email_confirm: true,
          user_metadata: { name, registration_number: regNum },
        }),
      });
      const data = await resp.json();
      return { data, ok: resp.ok, status: resp.status };
    }

    async function findAuthUserByEmail(email: string) {
      const { data, error } = await dbClient.rpc('get_user_id_by_email', { _email: email });
      if (error || !data) {
        let page = 1;
        while (true) {
          const resp = await fetch(`${supabaseUrl}/auth/v1/admin/users?page=${page}&per_page=100`, {
            headers: authHeaders,
          });
          if (!resp.ok) return null;
          const result = await resp.json();
          const users = result.users || [];
          const found = users.find((u: any) => u.email === email);
          if (found) return found;
          if (users.length < 100) return null;
          page++;
        }
      }
      return { id: data };
    }

    async function updateAuthUser(userId: string, updates: any) {
      const resp = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify(updates),
      });
      return resp.ok;
    }

    async function deleteAuthUser(userId: string) {
      const resp = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      return resp.ok;
    }

    async function recoverExistingUser(email: string, password: string, name: string, registration_number: string, batch: string | null) {
      const existing = await findAuthUserByEmail(email);
      if (!existing) return null;
      await updateAuthUser(existing.id, {
        password,
        user_metadata: { name, registration_number },
      });
      await dbClient.from("profiles").upsert({
        id: existing.id, name, registration_number, batch: batch || null,
      }, { onConflict: "id" });
      const { data: existingRole } = await dbClient.from("user_roles").select("id").eq("user_id", existing.id).eq("role", "student");
      if (!existingRole || existingRole.length === 0) {
        await dbClient.from("user_roles").insert({ user_id: existing.id, role: "student" });
      }
      return existing.id;
    }

    const { action, ...payload } = await req.json();

    if (action === "create") {
      const { name, registration_number, password, batch } = payload;
      const validationError = validateStudent({ name, registration_number, password, batch });
      if (validationError) {
        return new Response(JSON.stringify({ error: validationError }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const email = `${registration_number.toLowerCase()}@student.au.edu`;

      const result = await createAuthUser(email, password, name, registration_number);

      if (!result.ok) {
        const errMsg = result.data?.msg || result.data?.message || result.data?.error || "";
        if (typeof errMsg === "string" && errMsg.includes("already been registered")) {
          const recoveredId = await recoverExistingUser(email, password, name, registration_number, batch);
          if (recoveredId) {
            return new Response(JSON.stringify({ success: true, user_id: recoveredId, recovered: true }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        }
        return new Response(JSON.stringify({ error: "Failed to create student" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const userId = result.data.id;
      if (batch && userId) {
        await dbClient.from("profiles").update({ batch }).eq("id", userId);
      }
      return new Response(JSON.stringify({ success: true, user_id: userId }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "create_bulk") {
      const { students } = payload;
      if (!Array.isArray(students) || students.length === 0 || students.length > 200) {
        return new Response(JSON.stringify({ error: "Invalid student list" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const results: any[] = [];
      for (const s of students) {
        const { name, registration_number, password, batch } = s;
        const vErr = validateStudent({ name, registration_number, password: password?.length >= MIN_PASSWORD_LEN ? password : "Student@123", batch });
        if (vErr) {
          results.push({ registration_number: registration_number || "unknown", success: false, error: vErr });
          continue;
        }
        const email = `${registration_number.toLowerCase()}@student.au.edu`;
        const effectivePassword = password?.length >= MIN_PASSWORD_LEN ? password : "Student@123";

        const result = await createAuthUser(email, effectivePassword, name, registration_number);
        if (!result.ok) {
          const errMsg = result.data?.msg || result.data?.message || result.data?.error || "";
          if (typeof errMsg === "string" && errMsg.includes("already been registered")) {
            const recoveredId = await recoverExistingUser(email, effectivePassword, name, registration_number, batch);
            if (recoveredId) {
              results.push({ registration_number, success: true, recovered: true });
              continue;
            }
          }
          results.push({ registration_number, success: false, error: "Failed to create student" });
        } else {
          if (batch && result.data.id) {
            await dbClient.from("profiles").update({ batch }).eq("id", result.data.id);
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
      if (!student_id || !validateUUID(student_id)) {
        return new Response(JSON.stringify({ error: "Invalid student ID" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      await dbClient.from("attendance").delete().eq("student_id", student_id);
      await dbClient.from("user_roles").delete().eq("user_id", student_id);
      await dbClient.from("profiles").delete().eq("id", student_id);
      const deleted = await deleteAuthUser(student_id);
      if (!deleted) {
        return new Response(JSON.stringify({ error: "Failed to delete student" }), {
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
  } catch (err: any) {
    console.error("manage-student error:", err);
    return new Response(JSON.stringify({ error: "An internal error occurred" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
