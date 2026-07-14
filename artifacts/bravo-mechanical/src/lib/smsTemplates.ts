import { supabase } from "@/integrations/supabase/client";
import { SITE } from "./site";

// Owner-editable templates (Settings → SMS Templates, stored in the settings
// table). {name} and {service} placeholders are filled at send time.
export type SmsTemplateOverrides = {
  confirmation?: string; // settings key sms_day_1  — appointment/new-job confirmation
  follow_up?: string;    // settings key sms_follow_up — general/quote follow-up
  invoice?: string;      // settings key sms_invoice — invoice ready / payment reminders
};

export const fetchSmsTemplateOverrides = async (): Promise<SmsTemplateOverrides> => {
  const { data } = await supabase
    .from("settings" as never)
    .select("key,value")
    .in("key", ["sms_day_1", "sms_follow_up", "sms_invoice"]);
  const map: Record<string, string> = {};
  ((data as unknown as { key: string; value: unknown }[]) || []).forEach((row) => {
    if (typeof row.value === "string" && row.value.trim()) map[row.key] = row.value;
  });
  return { confirmation: map.sms_day_1, follow_up: map.sms_follow_up, invoice: map.sms_invoice };
};

const fill = (template: string, name: string, service?: string) =>
  template.replace(/\{name\}/g, name).replace(/\{service\}/g, service || "HVAC service");

// Customer-facing SMS templates. IMPORTANT: never include a payment URL unless
// a real, working link is passed in — there is no online payment page yet, so
// default copy routes customers to reply or call the office.
export const getSmsTemplate = (
  type: "new_job" | "quote" | "general" | "day_1" | "day_3" | "day_7",
  customerName?: string | null,
  link?: string,
  overrides?: SmsTemplateOverrides,
) => {
  const name = customerName?.trim() || "there";

  if (overrides) {
    if (type === "new_job" && overrides.confirmation) return fill(overrides.confirmation, name);
    if ((type === "quote" || type === "general") && overrides.follow_up) return fill(overrides.follow_up, name);
    if ((type === "day_1" || type === "day_3" || type === "day_7") && overrides.invoice) return fill(overrides.invoice, name);
  }

  const payCta = link ? `You can view and pay here: ${link}` : `Reply to this message or call ${SITE.phone} to arrange payment.`;

  const templates: Record<string, string> = {
    new_job: `Hi ${name}, your HVAC job is in our queue. Reply here with any access notes and we’ll keep you posted. - Bravo Mechanical`,
    quote: `Hi ${name}, your quote is ready. Reply YES and we can lock your spot on the schedule. - Bravo Mechanical`,
    general: `Hi ${name}, this is Bravo Mechanical following up on your HVAC service.`,
    day_1: `Hi ${name}, your Bravo Mechanical invoice is ready. ${payCta}`,
    day_3: `Hi ${name}, checking in on your Bravo Mechanical invoice. ${payCta}`,
    day_7: `Hi ${name}, final reminder about your outstanding Bravo Mechanical invoice. ${payCta}`,
  };

  return templates[type] || templates.general;
};
