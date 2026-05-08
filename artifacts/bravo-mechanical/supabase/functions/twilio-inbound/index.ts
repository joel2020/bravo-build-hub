import { createClient } from "https://esm.sh/@supabase/supabase-js@2.105.1";

const EXPECTED_SUPABASE_URL = "https://vqygaqrderxvumczpfnu.supabase.co";
const OWNER_PHONE_FALLBACK = "+19143619142";

function normalizePhone(value: string | null | undefined): string {
  if (!value) return "";
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return trimmed.startsWith("+") ? `+${digits}` : `+${digits}`;
}

function requireEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

function safeLogError(message: string, error: unknown): void {
  const detail = error instanceof Error ? error.message : String(error);
  console.error(message, detail.replace(/(token|key|secret|password)=([^\s&]+)/gi, "$1=[redacted]"));
}

function timingSafeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const aa = enc.encode(a);
  const bb = enc.encode(b);
  if (aa.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < aa.length; i++) diff |= aa[i] ^ bb[i];
  return diff === 0;
}

async function hmacSha1Base64(authToken: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(authToken),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  const bytes = new Uint8Array(signature);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function canonicalWebhookUrl(req: Request): string {
  const url = new URL(req.url);
  const proto = req.headers.get("x-forwarded-proto") || url.protocol.replace(":", "");
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || url.host;
  return `${proto}://${host}${url.pathname}${url.search}`;
}

async function verifyTwilioSignature(req: Request, params: URLSearchParams, authToken: string): Promise<boolean> {
  const supplied = req.headers.get("x-twilio-signature") || "";
  if (!supplied) return false;

  const sorted = [...params.entries()].sort(([a], [b]) => a.localeCompare(b));
  const payload = sorted.reduce((acc, [key, value]) => acc + key + value, canonicalWebhookUrl(req));
  const expected = await hmacSha1Base64(authToken, payload);
  return timingSafeEqual(expected, supplied);
}

async function sendOwnerAlert(message: string, env: { accountSid: string; authToken: string; twilioPhone: string; ownerPhone: string }) {
  const body = new URLSearchParams({
    To: env.ownerPhone,
    From: env.twilioPhone,
    Body: message.slice(0, 1500),
  });

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${env.accountSid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${env.accountSid}:${env.authToken}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!res.ok) {
    throw new Error(`Twilio owner alert failed with HTTP ${res.status}`);
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: { Allow: "POST" } });
  }

  let supabaseUrl: string;
  let serviceRoleKey: string;
  let twilioAuthToken: string;
  let twilioAccountSid: string;
  let twilioPhone: string;
  const ownerPhone = normalizePhone(Deno.env.get("OWNER_PHONE_NUMBER") || OWNER_PHONE_FALLBACK);

  try {
    supabaseUrl = requireEnv("SUPABASE_URL");
    serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
    twilioAuthToken = requireEnv("TWILIO_AUTH_TOKEN");
    twilioAccountSid = requireEnv("TWILIO_ACCOUNT_SID");
    twilioPhone = normalizePhone(requireEnv("TWILIO_PHONE_NUMBER"));
  } catch (error) {
    safeLogError("twilio-inbound env validation failed", error);
    return new Response("Server configuration error", { status: 500 });
  }

  if (supabaseUrl !== EXPECTED_SUPABASE_URL) {
    safeLogError("twilio-inbound Supabase project mismatch", new Error("Unexpected SUPABASE_URL"));
    return new Response("Server configuration error", { status: 500 });
  }

  let params: URLSearchParams;
  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("application/x-www-form-urlencoded")) {
      return new Response("Unsupported Media Type", { status: 415 });
    }
    params = new URLSearchParams(await req.text());
  } catch (error) {
    safeLogError("twilio-inbound body parse failed", error);
    return new Response("Bad Request", { status: 400 });
  }

  const shouldValidate = (Deno.env.get("TWILIO_WEBHOOK_VALIDATE_SIGNATURE") || "true").toLowerCase() !== "false";
  if (shouldValidate && !(await verifyTwilioSignature(req, params, twilioAuthToken))) {
    safeLogError("twilio-inbound signature validation failed", new Error("Invalid or missing X-Twilio-Signature"));
    return new Response("Forbidden", { status: 403 });
  }

  const fromPhone = normalizePhone(params.get("From"));
  const toPhone = normalizePhone(params.get("To"));
  const body = (params.get("Body") || "").trim();
  const messageSid = params.get("MessageSid") || params.get("SmsSid") || null;

  if (!fromPhone || !body) {
    return new Response("<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response></Response>", {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let inboundId: string | null = null;
  let leadId: string | null = null;

  try {
    const { data, error } = await supabase
      .from("inbound_messages")
      .insert({ from_phone: fromPhone, body, source: "twilio", message_sid: messageSid })
      .select("id")
      .single();
    if (error) throw error;
    inboundId = data.id;
  } catch (error) {
    safeLogError("twilio-inbound failed to insert inbound message", error);
    return new Response("Temporary failure", { status: 500 });
  }

  try {
    const { data: existingLead, error: matchError } = await supabase
      .from("leads")
      .select("id, notes")
      .eq("phone", fromPhone)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (matchError) throw matchError;

    if (existingLead?.id) {
      leadId = existingLead.id;
      await supabase
        .from("leads")
        .update({ notes: `${existingLead.notes || ""}\nInbound SMS: ${body}`.trim(), status: "contacted" })
        .eq("id", leadId);
    } else {
      const { data: createdLead, error: createError } = await supabase
        .from("leads")
        .insert({ name: `SMS lead ${fromPhone}`, phone: fromPhone, source: "phone", status: "new", notes: `Inbound SMS: ${body}` })
        .select("id")
        .single();
      if (createError) throw createError;
      leadId = createdLead.id;
    }

    if (leadId && inboundId) {
      await supabase.from("inbound_messages").update({ lead_id: leadId }).eq("id", inboundId);
    }
  } catch (error) {
    safeLogError("twilio-inbound lead matching/creation failed", error);
  }

  if (fromPhone !== ownerPhone) {
    try {
      await sendOwnerAlert(`New Bravo SMS from ${fromPhone}${toPhone ? ` to ${toPhone}` : ""}: ${body}`, {
        accountSid: twilioAccountSid,
        authToken: twilioAuthToken,
        twilioPhone,
        ownerPhone,
      });
    } catch (error) {
      safeLogError("twilio-inbound owner alert failed", error);
    }
  }

  return new Response("<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response></Response>", {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
});
