import { supabase } from "@/integrations/supabase/client";

const FUNCTION_URL = `${
  (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() || "https://tzczkcvavudoyuuetwcr.supabase.co"
}/functions/v1/send-email`;

export type SendEmailOptions = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  leadId?: string;
  jobId?: string;
  invoiceId?: string;
};

export type SendEmailResult =
  | { success: true; id: string; to: string | string[]; fallback?: false }
  | { success: false; error: string; fallback?: false }
  | { success: true; fallback: true; to: string | string[] };

export async function sendEmail(
  options: SendEmailOptions
): Promise<SendEmailResult> {
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
      body: JSON.stringify(options),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      return { success: true, id: data.id, to: data.to, fallback: false };
    }

    console.warn("Email function failed:", data);
    return { success: false, error: data.error || "Failed to send email" };
  } catch (error) {
    console.warn("Email fetch failed:", error);
    return { success: false, error: "Network error sending email" };
  }
}

export function openMailtoFallback(
  to: string | string[],
  subject: string,
  body?: string
): void {
  const recipient = Array.isArray(to) ? to.join(",") : to;
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = body ? encodeURIComponent(body) : "";
  window.open(
    `mailto:${recipient}?subject=${encodedSubject}&body=${encodedBody}`,
    "_blank"
  );
}
