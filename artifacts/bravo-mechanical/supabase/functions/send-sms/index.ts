import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
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

    // Verify the caller's JWT.
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

    // Service-role client for privileged checks + audit logging (bypasses RLS).
    const adminClient = serviceKey
      ? createClient(supabaseUrl, serviceKey)
      : userClient;

    // Only CRM staff (admin/user) may send messages — prevents any signed-up
    // account from running up Twilio charges.
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

    const { to, body } = await req.json();
    if (!to || typeof to !== "string") {
      return json({ error: "Missing or invalid 'to' phone number" }, 400);
    }
    if (!body || typeof body !== "string") {
      return json({ error: "Missing or invalid 'body' message" }, 400);
    }

    const phoneNumber = to.startsWith("+") ? to : `+1${to.replace(/\D/g, "")}`;

    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");
    if (!accountSid || !twilioAuthToken || !twilioPhoneNumber) {
      return json({ error: "Twilio configuration missing" }, 500);
    }

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const twilioBody = new URLSearchParams({
      From: twilioPhoneNumber,
      To: phoneNumber,
      Body: body,
    });

    const twilioResponse = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${accountSid}:${twilioAuthToken}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: twilioBody,
    });

    if (!twilioResponse.ok) {
      const errorData = await twilioResponse.json().catch(() => ({}));
      console.error("Twilio error:", errorData);
      await adminClient.from("email_send_log").insert({
        template_name: "sms",
        recipient_email: phoneNumber,
        status: "failed",
        error_message: JSON.stringify(errorData).slice(0, 500),
      });
      return json({ error: "Failed to send SMS" }, 502);
    }

    const messageData = await twilioResponse.json();
    const messageSid = messageData.sid;

    // Audit log via service role (the user JWT cannot write email_send_log).
    await adminClient.from("email_send_log").insert({
      message_id: messageSid,
      template_name: "sms",
      recipient_email: phoneNumber,
      status: "sent",
    });

    return json({ success: true, sid: messageSid, to: phoneNumber });
  } catch (error) {
    console.error("SMS send error:", error);
    return json(
      { error: "Internal server error", message: error instanceof Error ? error.message : String(error) },
      500,
    );
  }
});
