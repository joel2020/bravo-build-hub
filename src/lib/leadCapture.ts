import { supabase } from "@/integrations/supabase/client";

export type LeadCaptureInput = {
  fullName: string;
  phone?: string;
  email?: string;
  serviceRequested?: string;
  message?: string;
  source: string;
  sourceUrl?: string;
  sourceReferrer?: string;
  urgency?: "low" | "normal" | "high" | "emergency";
  honeypotValue?: string;
};

function getUtmParam(name: string) {
  if (typeof window === "undefined") return undefined;
  return new URLSearchParams(window.location.search).get(name) ?? undefined;
}

export async function captureLead(input: LeadCaptureInput) {
  const normalizedPhone = input.phone?.trim() || null;
  const normalizedEmail = input.email?.trim() || null;

  const { error } = await supabase.from("leads").insert({
    full_name: input.fullName.trim(),
    phone: normalizedPhone,
    email: normalizedEmail,
    service_requested: input.serviceRequested || null,
    notes: input.message || null,
    source: input.source,
    source_url: input.sourceUrl || (typeof window !== "undefined" ? window.location.href : null),
    source_referrer: input.sourceReferrer || (typeof document !== "undefined" ? document.referrer : null),
    utm_source: getUtmParam("utm_source") || null,
    utm_medium: getUtmParam("utm_medium") || null,
    utm_campaign: getUtmParam("utm_campaign") || null,
    urgency: input.urgency || "normal",
    honeypot_value: input.honeypotValue || null,
    spam_score: input.honeypotValue ? 100 : 0,
  });

  return { error };
}
