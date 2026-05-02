import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response("Method not allowed", {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      });
    }

    // Parse Twilio form data
    const formData = await req.formData();
    const fromPhone = formData.get("From") as string;
    const body = formData.get("Body") as string;
    const messageSid = formData.get("MessageSid") as string;

    if (!fromPhone || !body) {
      return new Response("Missing From or Body", {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      });
    }

    // Init Supabase client with service role key (no auth needed for webhook)
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Try to match the phone number to a lead
    // Strip +1 prefix for comparison
    const normalizedPhone = fromPhone.replace(/^[+]?1?/, "").replace(/\D/g, "");
    const formattedPhone = `+1${normalizedPhone}`;

    const { data: lead } = await supabaseClient
      .from("leads")
      .select("id")
      .or(`phone.eq.${formattedPhone},phone.eq.${fromPhone}`)
      .maybeSingle();

    // Insert inbound message
    const { error: insertError } = await supabaseClient.from("inbound_messages").insert({
      from_phone: fromPhone,
      body: body,
      source: "twilio",
      lead_id: lead?.id || null,
      message_sid: messageSid || null,
    });

    if (insertError) {
      console.error("Failed to store inbound message:", insertError);
      return new Response("Error storing message", {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      });
    }

    // Return Twilio-compatible empty response
    return new Response(
      "<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response></Response>",
      { headers: { ...corsHeaders, "Content-Type": "text/xml" } }
    );
  } catch (error) {
    console.error("Twilio inbound webhook error:", error);
    return new Response("Internal server error", {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });
  }
});
