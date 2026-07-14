import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.1.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Missing authorization header" }, 401);
    }
    if (req.method !== "POST") {
      return json({ error: "Method not allowed" }, 405);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser();
    if (authError || !user) {
      return json({ error: "Unauthorized" }, 401);
    }

    const adminClient = serviceKey
      ? createClient(supabaseUrl, serviceKey)
      : userClient;

    // Only CRM staff (admin/user) may send email.
    const { data: roles } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);
    const isStaff = (roles ?? []).some(
      (r: { role: string }) => r.role === "admin" || r.role === "user",
    );
    if (!isStaff) {
      return json({ error: "Forbidden: CRM access required" }, 403);
    }

    const { to, subject, html, text } = await req.json();
    if (!to || (typeof to !== "string" && !Array.isArray(to))) {
      return json({ error: "Missing or invalid 'to' email address" }, 400);
    }
    if (!subject || typeof subject !== "string") {
      return json({ error: "Missing or invalid 'subject'" }, 400);
    }
    if (!html || typeof html !== "string") {
      return json({ error: "Missing or invalid 'html' body" }, 400);
    }

    // API key: env secret if set, otherwise the key stored in Supabase Vault
    // (get_service_secret is a SECURITY DEFINER function granted to service_role only).
    let resendApiKey = Deno.env.get("RESEND_API_KEY") ?? "";
    if (!resendApiKey && serviceKey) {
      const { data: vaultKey } = await adminClient.rpc("get_service_secret", {
        secret_name: "resend_api_key",
      });
      resendApiKey = (vaultKey as string) ?? "";
    }
    const fromEmail =
      Deno.env.get("RESEND_FROM_EMAIL") ||
      "Bravo Mechanical <info@bravomechanicalny.com>";
    if (!resendApiKey) {
      return json({ error: "Resend API key not configured" }, 500);
    }

    const resend = new Resend(resendApiKey);
    const recipients = Array.isArray(to) ? to : [to];
    const emailPayload: {
      from: string;
      to: string[];
      subject: string;
      html: string;
      text?: string;
    } = { from: fromEmail, to: recipients, subject, html };
    if (text) emailPayload.text = text;

    const { data, error } = await resend.emails.send(emailPayload);

    const recipientLog = recipients.join(",");
    if (error) {
      console.error("Resend error:", error);
      await adminClient.from("email_send_log").insert({
        template_name: "custom",
        recipient_email: recipientLog,
        status: "failed",
        error_message: JSON.stringify(error).slice(0, 500),
      });
      return json({ error: "Failed to send email" }, 502);
    }

    await adminClient.from("email_send_log").insert({
      message_id: data?.id ?? null,
      template_name: "custom",
      recipient_email: recipientLog,
      status: "sent",
    });

    return json({ success: true, id: data?.id, to });
  } catch (error) {
    console.error("Email send error:", error);
    return json(
      { error: "Internal server error", message: error instanceof Error ? error.message : String(error) },
      500,
    );
  }
});
