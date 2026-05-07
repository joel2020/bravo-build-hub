import { supabase } from "@/integrations/supabase/client";
import { ensureFollowUp } from "@/lib/followUps";
import { sendUnpaidInvoiceFollowUp } from "@/lib/crm";

export const ensureInvoiceFollowUp = async (opts: {
  leadId?: string | null;
  jobId?: string | null;
  invoiceNumber: string;
  daysLate: 1 | 3 | 7;
}) => {
  const dueAt = new Date();
  const note = `invoice_${opts.daysLate}: Follow up on unpaid invoice ${opts.invoiceNumber}`;
  return ensureFollowUp({
    leadId: opts.leadId,
    jobId: opts.jobId,
    dueAt,
    reason: note,
    windowHours: 20,
  });
};

export const sendInvoiceFollowUp = async (
  invoiceId: string,
  leadId: string | null,
  jobId: string | null,
  invoiceNo: string
) => {
  const lead = leadId
    ? await supabase.from("leads").select("name, phone, email").eq("id", leadId).maybeSingle()
    : { data: null as { name: string | null; phone: string | null; email: string | null } | null };

  return sendUnpaidInvoiceFollowUp(
    invoiceId,
    leadId,
    jobId,
    lead.data?.phone || null,
    lead.data?.email || null,
    lead.data?.name || null,
    invoiceNo
  );
};
