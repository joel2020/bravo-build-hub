export const getSmsTemplate = (type: "new_job" | "quote" | "general" | "day_1" | "day_3" | "day_7", customerName?: string | null, link?: string) => {
  const name = customerName?.trim() || "there";
  const paymentLink = link || "https://pay.bravo.example";

  const templates: Record<string, string> = {
    new_job: `Hi ${name}, your HVAC job is in our queue. Reply here with any access notes and we’ll keep you posted.`,
    quote: `Hi ${name}, your quote is ready. Reply YES and we can lock your spot on the schedule.`,
    general: `Hi ${name}, this is Bravo Mechanical following up on your HVAC service.`,
    day_1: `Hi ${name}, friendly reminder your invoice is ready: ${paymentLink}`,
    day_3: `Hi ${name}, checking in on your invoice. You can pay here: ${paymentLink}`,
    day_7: `Hi ${name}, final reminder before collections workflow starts: ${paymentLink}`,
  };

  return templates[type] || templates.general;
};
