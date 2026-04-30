import { ensureFollowUp } from "@/lib/followUps";

export const ensureInvoiceFollowUp = async (opts: { leadId?: string | null; jobId?: string | null; invoiceNumber: string; daysLate: 1 | 3 | 7 }) => {
  const dueAt = new Date();
  const note = `invoice_${opts.daysLate}: Follow up on unpaid invoice ${opts.invoiceNumber}`;
  return ensureFollowUp({ leadId: opts.leadId, jobId: opts.jobId, dueAt, reason: note, windowHours: 20 });
};
