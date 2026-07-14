import { supabase } from "@/integrations/supabase/client";

export type SendSmsResult =
  | { success: true; sid: string; to: string; fallback?: false }
  | { success: false; error: string; fallback?: false }
  | { success: true; fallback: true; to: string };

// Server-side send via Twilio. The send_sms_via_twilio RPC (SECURITY DEFINER,
// staff-only) reads credentials from Supabase Vault, posts to Twilio
// synchronously, records the message in sms_messages, and returns the sid.
export async function sendSms(to: string, body: string): Promise<SendSmsResult> {
  try {
    const { data, error } = await supabase.rpc("send_sms_via_twilio" as never, {
      p_to: to,
      p_body: body,
    } as never);

    const result = data as { success?: boolean; sid?: string; to?: string; error?: string } | null;
    if (!error && result?.success) {
      return { success: true, sid: result.sid || "", to: result.to || to, fallback: false };
    }

    console.warn("Server SMS failed, falling back to sms: link:", error || result?.error);
    return { success: true, fallback: true, to };
  } catch (err) {
    console.warn("SMS send failed, falling back to sms: link:", err);
    return { success: true, fallback: true, to };
  }
}

export function openSmsFallback(to: string, body: string): void {
  const phoneNumber = to.startsWith("+") ? to : `+1${to.replace(/\D/g, "")}`;
  const encodedBody = encodeURIComponent(body);
  window.open(`sms:${phoneNumber}&body=${encodedBody}`, "_blank");
}

export async function sendSmsWithFallback(
  to: string,
  body: string
): Promise<SendSmsResult> {
  const result = await sendSms(to, body);

  if (!result.success) {
    openSmsFallback(to, body);
    return { success: true, fallback: true, to };
  }

  if (result.fallback) {
    openSmsFallback(to, body);
  }

  return result;
}
