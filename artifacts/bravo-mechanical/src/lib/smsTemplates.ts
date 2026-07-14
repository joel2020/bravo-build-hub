import { SITE } from "./site";

// Customer-facing SMS templates. IMPORTANT: never include a payment URL unless
// a real, working link is passed in — there is no online payment page yet
// (settings.integrations.stripe = false), so default copy routes customers to
// reply or call the office instead of texting them a dead link.
export const getSmsTemplate = (type: "new_job" | "quote" | "general" | "day_1" | "day_3" | "day_7", customerName?: string | null, link?: string) => {
  const name = customerName?.trim() || "there";
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
