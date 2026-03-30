import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Verify caller is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "غير مصرح" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseClient = createClient(supabaseUrl, anonKey);
    const {
      data: { user: caller },
    } = await supabaseClient.auth.getUser(token);

    if (!caller) {
      return new Response(JSON.stringify({ error: "غير مصرح" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "ليس لديك صلاحية" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, ...params } = await req.json();

    switch (action) {
      case "list_users": {
        const { data, error } = await supabaseAdmin.auth.admin.listUsers();
        if (error) throw error;

        // Get subscriptions
        const { data: subs } = await supabaseAdmin
          .from("subscriptions")
          .select("*");

        // Get roles
        const { data: roles } = await supabaseAdmin
          .from("user_roles")
          .select("*");

        const users = data.users.map((u) => {
          const sub = subs?.find((s) => s.user_id === u.id);
          const userRoles = roles?.filter((r) => r.user_id === u.id).map((r) => r.role) || [];
          return {
            id: u.id,
            email: u.email,
            created_at: u.created_at,
            roles: userRoles,
            subscription: sub || null,
          };
        });

        return new Response(JSON.stringify({ users }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "create_user": {
        const { email, password } = params;
        if (!email || !password) {
          return new Response(
            JSON.stringify({ error: "الإيميل وكلمة المرور مطلوبان" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const { data, error } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });
        if (error) throw error;

        // Add user role
        await supabaseAdmin
          .from("user_roles")
          .insert({ user_id: data.user.id, role: "user" });

        return new Response(JSON.stringify({ user: data.user }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "update_email": {
        const { user_id, new_email } = params;
        if (!user_id || !new_email) {
          return new Response(
            JSON.stringify({ error: "معرف المستخدم والإيميل الجديد مطلوبان" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const { error } = await supabaseAdmin.auth.admin.updateUserById(
          user_id,
          { email: new_email, email_confirm: true }
        );
        if (error) throw error;

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "reset_password": {
        const { user_id, new_password } = params;
        if (!user_id || !new_password) {
          return new Response(
            JSON.stringify({ error: "معرف المستخدم وكلمة المرور مطلوبان" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const { error } = await supabaseAdmin.auth.admin.updateUserById(
          user_id,
          { password: new_password }
        );
        if (error) throw error;

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "set_subscription": {
        const { user_id, subscription_type, end_date, is_permanent } = params;
        if (!user_id) {
          return new Response(
            JSON.stringify({ error: "معرف المستخدم مطلوب" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const { error } = await supabaseAdmin
          .from("subscriptions")
          .upsert(
            {
              user_id,
              subscription_type: subscription_type || "monthly",
              start_date: new Date().toISOString().split("T")[0],
              end_date: is_permanent ? null : end_date,
              is_permanent: !!is_permanent,
              status: "active",
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          );
        if (error) throw error;

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "revoke_subscription": {
        const { user_id: revokeUserId } = params;
        const { error } = await supabaseAdmin
          .from("subscriptions")
          .update({ status: "expired", updated_at: new Date().toISOString() })
          .eq("user_id", revokeUserId);
        if (error) throw error;

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "delete_user": {
        const { user_id: deleteUserId } = params;
        const { error } = await supabaseAdmin.auth.admin.deleteUser(deleteUserId);
        if (error) throw error;

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ error: "إجراء غير معروف" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
