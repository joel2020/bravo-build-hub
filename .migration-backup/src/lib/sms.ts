import { supabase } from "@/integrations/supabase/client";

const FUNCTION_URL =
  "https://vqygaqrderxvumczpfnu.supabase.co/functions/v1/send-sms";

export type SendSmsResult =
  | { success: true; sid: string; to: string; fallback?: false }
  | { success: false; error: string; fallback?: false }
  | { success: true; fallback: true; to: string };

export async function sendSms(to: string, body: string): Promise<SendSmsResult> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  }

  try {
    const response = await fetch(FUNCTION_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({ to, body }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      return { success: true, sid: data.sid, to: data.to, fallback: false };
    }

    console.warn("SMS function failed, falling back to sms: link:", data);
    return { success: true, fallback: true, to };
  } catch (error) {
    console.warn("SMS fetch failed, falling back to sms: link:", error);
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
    return { ...result, fallback: true };
  }

  if (result.fallback) {
    openSmsFallback(to, body);
  }

  return result;
}
